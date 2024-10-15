from flask import Flask,request,jsonify
from flask_cors import CORS
from datetime import datetime
import json
import vertexai
import firebase_admin
import datetime
from firebase_admin import credentials
from firebase_admin import firestore
import requests
from vertexai.generative_models import (
    FunctionDeclaration,
    GenerationConfig,
    GenerativeModel,
    Part,
    GenerationResponse,
    Content,
    Tool,
)
import tools
cred = credentials.Certificate("firebase.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_number_of_members(user_session):
  if user_session['room_id']=="":
    return -1
  else:
    ref = db.collection("room").document(user_session['room_id'])
    return ref.collection('member').count().get()[0][0].value
def get_number_of_tasks(user_session):
  if user_session['room_id']=="":
    return -1
  else:
    ref = db.collection("room").document(user_session['room_id'])
    return ref.collection('task').count().get()[0][0].value
def get_specific_status_task(user_session,specific_status,user_task):
  if user_session['room_id']=="":
    return -1
  else:
    ref = db.collection("room").document(user_session['room_id']).collection('task_status')
    query=ref.where('name','==',specific_status)
    existing=next(query.stream(),None)
    result=[]
    if not existing:
        statuses=ref.stream()
        for status in statuses:
           doc=status.to_dict()
           result.append(doc['name'])
        return {'available_status':result} 
    ref_task=db.collection("room").document(user_session['room_id']).collection('task').where('status','==',specific_status)
    if user_task:
       ref_task=ref_task.where('assignee_id','==',user_session['user_id'])
    for task in ref_task.stream():
        data_task=task.to_dict()
        deadline=datetime.datetime.fromtimestamp(data_task['deadline'].timestamp())
        result.append({'task_name':data_task['title'],'deadline':deadline.strftime('%d %B, %H:%M')})
    return result

PROJECT_ID = "chatbot-437514"  # @param {type:"string"}
LOCATION = "us-central1"  # @param {type:"string"}

def dict_to_history(history):
    result=[Content(role='user',parts=[Part.from_text("You are a chat assistant which is integrated into a task and work progress management platform. The assistant should: Provide clear, accurate information based on supplied tools; Be transparent when an answer is not known or when the necessary information is not available, stating that it cannot provide speculative or incomplete answers;Maintain a helpful, polite and professional tone, keeping the focus on improving the user's task management and workflow; Don't automatically correct the spelling of the user's request; Avoid asking another questions after providing an answer; If a user requests information or assistance that the assistant cannot directly provide, it should avoid them and tell customers the problem.")])]
    for content in history:
        result.append(Content(role=content['role'],parts=[Part.from_text(content['text'])]))
    return result
vertexai.init(project=PROJECT_ID, location=LOCATION)

model = GenerativeModel(
    "gemini-1.5-pro-001",
    generation_config=GenerationConfig(temperature=0),
    tools=[tools.tools],
)
def extract_function_calls(response: GenerationResponse) -> list[dict]:
    function_calls: list[dict] = []
    if response.candidates[0].function_calls:
        for function_call in response.candidates[0].function_calls:
            function_call_dict: dict[str, dict[str, Any]] = {function_call.name: {}}
            for key, value in function_call.args.items():
                function_call_dict[function_call.name][key] = value
            function_calls.append(function_call_dict)
    return function_calls

def handle_message(function_calls,user_session):
    result=[]
    for function_call in function_calls:
        function_name=list(function_call.keys())[0]
        try:
            if function_name=="get_number_of_members":
                result.append(Part.from_function_response(
                    name="get_number_of_members",
                    response={
                        "content":get_number_of_members(user_session), 
                    },))
            elif function_name=="get_number_of_tasks":
                result.append(Part.from_function_response(
                    name="get_number_of_tasks",
                    response={
                        "content":get_number_of_tasks(user_session), 
                    },))
            elif function_name=="get_specific_status_task":
                args=function_call[function_name]
                print(args)
                result.append(Part.from_function_response(
                    name="get_specific_status_task",
                    response={
                        "content":get_specific_status_task(user_session,args['specific_status'],args['user_task']), 
                },))
        
        except IndexError as e:
           print(f"Error processing item: {e}")
    return result
    

@app.route("/api/chat", methods=['POST'])
def answer_prompt() -> str:
    data = request.get_json()
    print(data)
    history=data['history']
    chat=model.start_chat(history=dict_to_history(history))
    #chat=model.start_chat()
    prompt=data['message']
    response_model = chat.send_message(prompt)
    function_calls = extract_function_calls(response_model)
    if len(function_calls)==0:
        return jsonify({'response': str(response_model.text)})
    else:
        response=handle_message(function_calls,data)
        final_response = chat.send_message(response)
        print(final_response)
        return jsonify({'response': str(final_response.text)})


if __name__ == "__main__":
    app.run()
