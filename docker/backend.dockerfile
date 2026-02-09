FROM python:3.12-slim

WORKDIR /app

RUN pip install --upgrade pip

RUN pip install langchain langchain-community langgraph firebase_admin fastapi[standard] langchain-openai pypdf scikit-learn langsmith

COPY . /app

EXPOSE 8000

WORKDIR /app/src/app

CMD ["fastapi", "run", "main.py", "--port", "8000"]