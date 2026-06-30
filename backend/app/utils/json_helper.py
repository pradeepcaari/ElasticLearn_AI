import json
import re

def clean_and_parse_json(text):
    """
    Cleans raw LLM response text by stripping markdown code blocks,
    finding valid JSON bounds, and parsing it into a Python list/dict.
    """
    if not text:
        return None
    
    cleaned = text.strip()
    
    # Strip markdown fences if present
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Find first '{' or '[' and last '}' or ']'
        match = re.search(r'([\{\[].*[\}\])])', cleaned, re.DOTALL)
        if match:
            extracted = match.group(1)
            try:
                return json.loads(extracted)
            except json.JSONDecodeError:
                # Strip trailing commas inside JSON objects or arrays
                # e.g., [1, 2, 3, ] -> [1, 2, 3]
                # {"a": 1, } -> {"a": 1}
                cleaned_commas = re.sub(r',\s*([\}\]])', r'\1', extracted)
                try:
                    return json.loads(cleaned_commas)
                except json.JSONDecodeError as e:
                    raise ValueError(f"Failed to parse cleaned JSON content: {e}. Original: {text}")
        raise ValueError(f"No JSON object or array structure found in text. Original: {text}")
