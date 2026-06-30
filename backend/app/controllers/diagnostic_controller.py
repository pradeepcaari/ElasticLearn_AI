from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.services.crew_orchestrator.crews import DiagnosticCrew
from app.models.job_status import JobStatusModel
from app.services.background_tasks import start_diagnostic_task
from app.utils.json_helper import clean_and_parse_json
import os

MOCK_QUIZ_POOL = {
    "calculus": [
        {"id": 1, "type": "mcq", "text": "What does a derivative fundamentally represent?", "options": ["Area under a curve", "Rate of change of a function", "A polynomial root", "An integral approximation"], "rationale": "Probes basic calculus concepts."},
        {"id": 2, "type": "open", "text": "Explain what the Fundamental Theorem of Calculus connects.", "rationale": "Assesses integral-derivative relationship."}
    ],
    "linear algebra": [
        {"id": 3, "type": "mcq", "text": "If a matrix has a determinant of 0, it is:", "options": ["Symmetric", "Invertible", "Singular", "Identity"], "rationale": "Probes singularity baseline."},
        {"id": 4, "type": "open", "text": "Describe geometrically what a linear transformation does to space.", "rationale": "Assesses geometric intuition of linear algebra."}
    ],
    "algorithms & dsa": [
        {"id": 5, "type": "mcq", "text": "Which data structure uses FIFO (First-In, First-Out) ordering?", "options": ["Stack", "Queue", "Heap", "Binary Tree"], "rationale": "Assesses basic DSA knowledge."},
        {"id": 6, "type": "mcq", "text": "What is the time complexity of binary search on a sorted array?", "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "rationale": "Assesses binary search complexity knowledge."}
    ]
}

def get_questions():
    data = request.get_json()
    interests = data.get('interests', [])
    if not interests:
        return jsonify({'msg': 'Missing interests'}), 400
    
    try:
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        zai_key = os.getenv("ZAI_API_KEY")
        if (nvidia_key and nvidia_key != "your-nvidia-api-key") or (zai_key and zai_key != "your-zai-api-key"):
            crew = DiagnosticCrew(interests)
            result = crew.generate_questions()
            parsed_questions = clean_and_parse_json(str(result))
            if not parsed_questions or not isinstance(parsed_questions, list):
                raise ValueError("JSON parsing returned empty or invalid questions structure.")
            return jsonify({'questions': parsed_questions}), 200
        else:
            raise ValueError("ZAI_API_KEY not configured. Falling back to mock quiz questions.")
    except Exception as e:
        print(f"Failed to generate questions using AI crew: {e}")
        # Build fallback questions list from chosen interests or default pool
        fallback_questions = []
        q_id = 1
        for interest in interests:
            interest_lower = interest.lower()
            matched_pool = False
            for pool_key, questions in MOCK_QUIZ_POOL.items():
                if pool_key in interest_lower or interest_lower in pool_key:
                    for q in questions:
                        q_copy = q.copy()
                        q_copy['id'] = q_id
                        fallback_questions.append(q_copy)
                        q_id += 1
                    matched_pool = True
                    break
            
            if not matched_pool:
                # Add default fallback questions
                fallback_questions.append({
                    "id": q_id,
                    "type": "mcq" if q_id % 2 != 0 else "open",
                    "text": f"What is the most crucial concept to master in {interest} and why?",
                    "options": ["First principles definition", "Practical implementation", "Advanced optimization theories", "Historical context"] if q_id % 2 != 0 else None,
                    "rationale": f"General assessment for {interest}."
                })
                q_id += 1
                
        return jsonify({'questions': fallback_questions}), 200

def submit_diagnostic():
    data = request.get_json()
    interests = data.get('interests', [])
    questions = data.get('questions', [])
    answers = data.get('answers', [])
    
    if not questions or not answers:
        return jsonify({'msg': 'Missing questions or answers'}), 400
    
    user_id = get_jwt_identity()
    job_id = JobStatusModel.create_job(user_id)
    
    # Run the expensive evaluator & designer in the background
    start_diagnostic_task(job_id, interests, questions, answers)
    
    return jsonify({
        'job_id': job_id,
        'msg': 'Diagnostic evaluation started'
    }), 202
