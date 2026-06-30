import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-must-be-at-least-32-bytes-long')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-must-be-at-least-32-bytes-long')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)   # stay logged in for 7 days
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/elasticlearn')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    ZAI_API_KEY = os.getenv('ZAI_API_KEY')
    NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
