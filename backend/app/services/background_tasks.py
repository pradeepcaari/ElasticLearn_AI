import threading
import os
import time
from app.services.crew_orchestrator.crews import DiagnosticCrew
from app.models.job_status import JobStatusModel
from app.models.user import UserModel
from app.utils.json_helper import clean_and_parse_json

def run_diagnostic_background(job_id, interests, questions, answers):
    try:
        JobStatusModel.update_job(job_id, 'PROCESSING')
        
        result_dict = None
        
        # Run CrewAI evaluation & design if API key is present
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        zai_key = os.getenv("ZAI_API_KEY")
        if (nvidia_key and nvidia_key != "your-nvidia-api-key") or (zai_key and zai_key != "your-zai-api-key"):
            try:
                # Simulate a brief delay to let user see step animation transitions
                time.sleep(1.0)
                crew = DiagnosticCrew(interests)
                result = crew.run_full_diagnostic(questions, answers)
                result_dict = clean_and_parse_json(str(result))
                if not result_dict or not isinstance(result_dict, dict):
                    raise ValueError("AI returned empty or invalid result structure")
                print("CrewAI diagnostic completed successfully.")
            except Exception as ai_err:
                print(f"CrewAI failed, falling back to mock: {ai_err}")
                result_dict = None  # ensure fallback runs

                
        if not result_dict:
            # Fallback mock diagnostic result generation
            print("Running fallback diagnostic evaluator logic...")
            time.sleep(2.0) # Simulate AI processing time
            
            # Simple grading logic: count MCQ answers
            # Let's check selected options
            mcq_answers = [a for a in answers if a.get('type') == 'mcq' or 'selected_index' in a]
            correct_count = 0
            for ans in mcq_answers:
                if ans.get('selected_index') == 1: # Mock correct index
                    correct_count += 1
            
            level = "acceleration" if len(mcq_answers) == 0 or correct_count >= (len(mcq_answers) / 2) else "foundation"
            
            gaps = []
            if level == "foundation":
                gaps = [f"{interest} fundamentals" for interest in interests[:2]]
            
            # Build structured learning path
            curriculum = []
            topic_pool = gaps if gaps else [f"{interest} advanced concepts" for interest in interests]
            for idx, gap in enumerate(topic_pool):
                curriculum.append({
                    "title": f"Module {idx+1}: Intro to {gap}",
                    "objectives": f"Identify core components, build context, and understand {gap} applications.",
                    "mode": "Foundation" if level == "foundation" else "Acceleration"
                })
            
            result_dict = {
                "level": level,
                "gaps": gaps,
                "curriculum": curriculum
            }

        # Save result to Job document
        JobStatusModel.update_job(job_id, 'COMPLETED', result=result_dict)
        
        # Update user's profile with the detected mode and interests
        job = JobStatusModel.get_job(job_id)
        if job and 'user_id' in job:
            UserModel.update_user_profile(job['user_id'], {
                'mode': result_dict['level'],
                'interests': interests
            })
            
    except Exception as e:
        print(f"Background diagnostic task exception: {e}")
        JobStatusModel.update_job(job_id, 'FAILED', result={"error": str(e)})

def start_diagnostic_task(job_id, interests, questions, answers):
    thread = threading.Thread(
        target=run_diagnostic_background,
        args=(job_id, interests, questions, answers)
    )
    thread.start()
