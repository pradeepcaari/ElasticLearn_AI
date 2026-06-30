from crewai import Agent, LLM
import os

class BaseAgent:
    def __init__(self, role, goal, backstory):
        self.role = role
        self.goal = goal
        self.backstory = backstory

    def create_agent(self):
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        zai_key = os.getenv("ZAI_API_KEY")
        agent_llm = None
        
        # Instantiate GLM LLM if a valid API key is present
        if nvidia_key and nvidia_key != "your-nvidia-api-key":
            agent_llm = LLM(
                model="openai/z-ai/glm-5.1",
                api_key=nvidia_key,
                base_url="https://integrate.api.nvidia.com/v1"
            )
        elif zai_key and zai_key != "your-zai-api-key":
            agent_llm = LLM(
                model="openai/glm-5.1",
                api_key=zai_key,
                base_url="https://api.z.ai/api/paas/v4"
            )

        return Agent(
            role=self.role,
            goal=self.goal,
            backstory=self.backstory,
            verbose=True,
            allow_delegation=False,
            llm=agent_llm
        )
