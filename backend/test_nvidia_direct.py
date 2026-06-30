import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")
url = "https://integrate.api.nvidia.com/v1/chat/completions"
model = "z-ai/glm-5.1"

print(f"API Key starting with: {api_key[:10] if api_key else 'None'}")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": model,
    "messages": [
        {"role": "user", "content": "Hello, are you active?"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
}

try:
    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    result = f"Status Code: {resp.status_code}\nResponse: {resp.text}"
except Exception as e:
    result = f"Error occurred: {str(e)}"

print(result)

# Write to a file so the agent can read it even if console output is sandboxed
with open("nvidia_result.txt", "w", encoding="utf-8") as f:
    f.write(result)
