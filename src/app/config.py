"""Application configuration including Firebase and LangSmith setup."""

import os
from dotenv import load_dotenv
from firebase_admin import credentials
import firebase_admin

# Load environment variables
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS", "firebase.json"))
firebase_admin.initialize_app(cred)

# LangSmith Configuration for Tracing & Evaluation
# Set LANGSMITH_TRACING=true in .env to enable tracing
os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING", "false")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")
#os.environ["LANGSMITH_WORKSPACE_ID"] = os.getenv("LANGSMITH_PROJECT", "chatbot-tkpm")
