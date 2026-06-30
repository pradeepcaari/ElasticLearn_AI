from crewai import Task

class DiagnosticTasks:
    @staticmethod
    def frame_questions_task(agent, interests):
        return Task(
            description=f"Based on the following areas of interest: {interests}, frame 3-5 simple, probing diagnostic questions to identify the student's baseline understanding. Return a mixture of MCQs and open-ended questions.",
            expected_output="A JSON object containing an array of question objects. Each question object must have exactly the following keys: 'id' (integer, starting from 1), 'type' (string, either 'mcq' or 'open'), 'text' (string, the question text), 'options' (array of exactly 4 strings for MCQ questions, or null/empty for open-ended questions), and 'rationale' (string, why this question was framed). Return ONLY valid raw JSON.",
            agent=agent
        )

    @staticmethod
    def evaluate_diagnostic_task(agent, questions, answers):
        return Task(
            description=f"Analyze the following questions: {questions} and the user's answers: {answers}. Identify exactly where their foundational knowledge is missing and any misconceptions they may have.",
            expected_output="A structured summary of the student's level, identified gaps, and misconceptions.",
            agent=agent
        )

    @staticmethod
    def design_curriculum_task(agent, evaluation_report):
        return Task(
            description=f"Using the following diagnostic evaluation: {evaluation_report}, build a structured learning path with at least 3 distinct modules, each with clear learning objectives and a suggested mode (Foundation or Acceleration). Also decide the overall level (foundation or acceleration) and identify the specific gaps.",
            expected_output="A JSON object containing: 'level' (string, either 'foundation' or 'acceleration'), 'gaps' (an array of strings indicating identified knowledge gaps), and 'curriculum' (an array of module objects, each containing 'title', 'objectives', and 'mode'). Return ONLY valid raw JSON.",
            agent=agent
        )


