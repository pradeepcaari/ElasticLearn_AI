from crewai import Crew, Process
from .agents.question_framer import QuestionFramerAgent
from .agents.diagnostic_evaluator import DiagnosticEvaluatorAgent
from .agents.curriculum_designer import CurriculumDesignerAgent
from .tasks import DiagnosticTasks

class DiagnosticCrew:
    def __init__(self, interests):
        self.interests = interests
        self.framer_agent = QuestionFramerAgent().create_agent()
        self.evaluator_agent = DiagnosticEvaluatorAgent().create_agent()
        self.designer_agent = CurriculumDesignerAgent().create_agent()

    def generate_questions(self):
        task = DiagnosticTasks.frame_questions_task(self.framer_agent, self.interests)
        crew = Crew(
            agents=[self.framer_agent],
            tasks=[task],
            process=Process.sequential
        )
        return crew.kickoff()

    def run_full_diagnostic(self, questions, answers):
        # Combined evaluation and design for context keeping
        eval_task = DiagnosticTasks.evaluate_diagnostic_task(self.evaluator_agent, questions, answers)
        design_task = DiagnosticTasks.design_curriculum_task(self.designer_agent, "the evaluation summary provided by the evaluator")
        
        # CrewAI supports task output passing automatically when in sequential process
        crew = Crew(
            agents=[self.evaluator_agent, self.designer_agent],
            tasks=[eval_task, design_task],
            process=Process.sequential
        )
        return crew.kickoff()

