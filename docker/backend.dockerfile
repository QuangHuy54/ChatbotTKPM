FROM python:3.12-slim
    
WORKDIR /app

RUN pip install --upgrade pip

RUN pip install langchain langchain-community langgraph firebase_admin fastapi[standard] langchain-openai pypdf scikit-learn

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "chatbot:app", "--host", "0.0.0.0", "--port", "8000"]
