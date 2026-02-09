from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from langchain_core.messages import HumanMessage, AIMessage

# Import configuration (initializes Firebase and LangSmith)
import src.app.config

# Import core modules
from src.core.state import State
from src.core.graph import graph

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def dict_to_history(history):
    result=[]
    for content in history:
        if content['role']=='user':
            result.append(HumanMessage(content=content['text']))
        else:
            result.append(AIMessage(content=content['text']))
    return result

class Request(BaseModel):
    user_id: str
    room_id: str
    message: str
    history: list

#@app.route("/api/chat", methods=['POST'])
@app.post("/api/chat")
def answer_prompt(data:Request):
    print(data)
    history=data.history+[{'role':'user','text':data.message}]
    initial_state = State(user_id=data.user_id,room_id=data.room_id, messages=dict_to_history(history))
    response_state=graph.invoke(initial_state)
    #chat=model.start_chat()
    return {'response': str(response_state['messages'][-1].content)}


class EvaluationRequest(BaseModel):
    dataset_name: str = "chatbot-evaluation-dataset"
    experiment_prefix: str = "chatbot-eval"
    dry_run: bool = False


@app.post("/api/evaluate")
async def run_evaluation(data: EvaluationRequest):
    """
    Run LangSmith evaluation on a specified dataset.
    
    This endpoint triggers an evaluation run against the chatbot,
    using the custom evaluators defined in the evaluation module.
    
    Args:
        dataset_name: Name of the LangSmith dataset to use
        experiment_prefix: Prefix for the experiment name
        dry_run: If True, run without uploading to LangSmith
        
    Returns:
        Evaluation summary with scores for each evaluator
    """
    from src.evaluation.runner import run_evaluation as execute_evaluation
    
    try:
        results = execute_evaluation(
            dataset_name=data.dataset_name,
            experiment_prefix=data.experiment_prefix,
            dry_run=data.dry_run
        )
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/evaluate/setup")
async def setup_evaluation_dataset():
    """
    Set up the evaluation dataset with sample test cases.
    
    This endpoint creates a new dataset in LangSmith (if it doesn't exist)
    and populates it with sample test cases for each agent type.
    """
    from src.evaluation.datasets import add_examples_to_dataset
    
    try:
        add_examples_to_dataset()
        return {"status": "success", "message": "Dataset setup complete"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


#if __name__ == "__main__":
#    app.run()

