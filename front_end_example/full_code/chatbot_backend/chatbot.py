from firebase_admin import credentials
import firebase_admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

cred = credentials.Certificate("firebase.json")
firebase_admin.initialize_app(cred)
app = FastAPI()
PROJECT_ID = "chatbot-437514"  # @param {type:"string"}
LOCATION = "us-central1"  # @param {type:"string"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from pydantic import BaseModel
import database_agent as database_agent
from multi_agent_graph import State,graph
from langchain_core.messages import HumanMessage, AIMessage


#cors = CORS(app, resources={r"/api/*": {"origins": "*"}})



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


#if __name__ == "__main__":
#    app.run()
