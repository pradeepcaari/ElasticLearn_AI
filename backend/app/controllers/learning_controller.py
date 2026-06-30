from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.models.progress import ProgressModel
import os
import requests as http_req

# ── System prompts per learning mode ──────────────────────────────────────────
SYSTEM_FOUNDATION = """You are ElasticLearn AI, a patient and insightful tutor in Foundation Mode.
Explain concepts from first principles using clear language, analogies, and step-by-step breakdowns.
Rules:
- Use simple relatable analogies (water flow for electricity, highways for networks, etc.)
- Break every concept into small digestible steps with headers
- Use **bold** for key terms, `code` for formulas/code snippets
- Use bullet points and numbered lists for steps
- End with a short "Try This" practice suggestion
- Always respond in clean Markdown format
- Be encouraging and clear — never make the student feel lost"""

SYSTEM_ACCELERATION = """You are ElasticLearn AI, an advanced research-level tutor in Acceleration Mode.
Engage with depth, mathematical rigor, and cutting-edge context.
Rules:
- Assume strong fundamentals — skip basic definitions
- For mathematical notation: wrap inline math in single dollar signs like $E = mc^2$ and display/block equations in double dollar signs like $$F = G\\frac{m_1 m_2}{r^2}$$ on their own line
- Use LaTeX syntax for all math: fractions (\\frac), vectors (\\vec), Greek letters (\\alpha, \\beta), subscripts/superscripts, integrals (\\int), sums (\\sum), matrices (\\begin{bmatrix})
- Reference real-world engineering applications, trade-offs, and research context
- Structure answers with clear headers (##) and subheadings (###)
- Use bullet points (- ) for lists, **bold** for key terms, `code` for code/variable names
- End with a thought-provoking challenge or extension problem
- Always respond in clean Markdown format with LaTeX math delimiters as described above"""

def _call_glm(system_prompt: str, user_message: str) -> tuple[str | None, str | None]:
    """Call GLM 5.1 REST API directly. Returns (text, error)."""
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    zai_key = os.getenv("ZAI_API_KEY")
    
    print(f"[DEBUG] _call_glm: NVIDIA_API_KEY={bool(nvidia_key)}, ZAI_API_KEY={bool(zai_key)}")
    
    if nvidia_key and nvidia_key != "your-nvidia-api-key":
        api_key = nvidia_key
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        model = "z-ai/glm-5.1"
    elif zai_key and zai_key != "your-zai-api-key":
        api_key = zai_key
        url = "https://api.z.ai/api/paas/v4/chat/completions"
        model = "glm-5.1"
    else:
        print("[DEBUG] No valid API key found!")
        return None, "Neither NVIDIA_API_KEY nor ZAI_API_KEY is configured"

    print(f"[DEBUG] Calling URL: {url} with model: {model}")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
        "top_p": 0.95
    }

    try:
        resp = http_req.post(
            url,
            headers=headers,
            json=payload,
            timeout=45
        )
        if resp.status_code != 200:
            return None, f"GLM API {resp.status_code}: {resp.text[:300]}"

        data = resp.json()
        text = data["choices"][0]["message"]["content"]
        return text.strip(), None

    except Exception as e:
        return None, str(e)


def learning_query():
    data = request.get_json()
    query = data.get("query", "").strip()
    mode  = data.get("mode", "foundation").lower()
    session_id = data.get("session_id")
    session_title = data.get("session_title")

    if not query:
        return jsonify({"msg": "Missing query"}), 400

    user_id = get_jwt_identity()

    # Build recent conversation context from the current session (last 5 messages)
    if session_id:
        session_history = ProgressModel.get_session_messages(user_id, session_id)
        recent_history = session_history[-5:]
    else:
        recent_history = list(reversed(ProgressModel.get_history(user_id, limit=5)))

    context_parts = []
    for h in recent_history:
        context_parts.append(f"Student: {h['query']}")
        context_parts.append(f"Tutor: {h['response'][:300]}")
    context = "\n".join(context_parts)

    # Build the prompt for GLM
    system = SYSTEM_FOUNDATION if mode == "foundation" else SYSTEM_ACCELERATION
    user_msg = ""
    if context:
        user_msg += f"**Recent conversation context:**\n{context}\n\n---\n\n"
    user_msg += f"**Student asks:** {query}"

    # Call GLM
    response_text, err = _call_glm(system, user_msg)

    if not response_text:
        print(f"[GLM ERROR] {err}")
        response_text = (
            "I'm having trouble reaching the AI service right now. The server might be offline or undergoing maintenance. "
            "Please try again in a moment!"
        )

    ProgressModel.add_interaction(user_id, query, response_text, session_id, session_title)
    return jsonify({"response": response_text}), 200


def learning_help():
    data = request.get_json()
    if not data or not data.get("topic") or not data.get("mode"):
        return jsonify({"msg": "Missing topic or mode"}), 400

    topic = data["topic"]
    mode  = data["mode"].lower()
    session_id = data.get("session_id")
    session_title = data.get("session_title")
    
    system = SYSTEM_FOUNDATION if mode == "foundation" else SYSTEM_ACCELERATION

    user_msg = (
        f"Give me a concise but thorough explanation of **{topic}**. "
        f"{'Use a simple analogy and step-by-step breakdown.' if mode == 'foundation' else 'Include mathematical formulation, engineering context, and a challenge question.'}"
    )

    response_text, err = _call_glm(system, user_msg)

    if not response_text:
        print(f"[GLM Help ERROR] {err}")
        response_text = (
            "AI explanation is temporarily unavailable. The server might be offline. Please try again in a moment!"
        )

    user_id = get_jwt_identity()
    ProgressModel.add_interaction(user_id, f"Help me understand: {topic}", response_text, session_id, session_title)

    return jsonify({"response": response_text}), 200


def get_chat_sessions():
    user_id = get_jwt_identity()
    sessions = ProgressModel.get_sessions(user_id)
    return jsonify({'sessions': sessions}), 200


def get_session_history(session_id):
    user_id = get_jwt_identity()
    messages = ProgressModel.get_session_messages(user_id, session_id)
    
    # Format messages for frontend
    formatted = []
    for msg in messages:
        # User message
        formatted.append({
            'id': f"{msg['_id']}_user",
            'role': 'user',
            'content': msg['query'],
            'timestamp': msg.get('timestamp')
        })
        # Assistant response
        formatted.append({
            'id': f"{msg['_id']}_assistant",
            'role': 'assistant',
            'content': msg['response'],
            'timestamp': msg.get('timestamp')
        })
    return jsonify({'messages': formatted}), 200
