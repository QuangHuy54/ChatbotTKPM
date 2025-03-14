from typing import Annotated
from langchain_openai  import ChatOpenAI
from langchain.tools import tool
from langgraph.prebuilt import InjectedState, ToolNode, create_react_agent
from langgraph.prebuilt import ToolNode
from firebase_admin import firestore
from langgraph.checkpoint.memory import MemorySaver
import datetime
from helper import State
db = firestore.client()
import os 
from dotenv import load_dotenv
load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini",temperature=0, api_key=os.getenv('API_OPENAI'))
from helper import State
    
@tool
def get_number_of_members(state:Annotated[dict, InjectedState]) -> int:
    """
    Retrieve the total number of members currently present in the room that the user is accessing. If the user is not currently accessing any room, return -1.
    """
    print(state)
    if state['room_id']=="":
        return -1
    else:
        ref = db.collection("room").document(state['room_id'])
        return ref.collection('member').count().get()[0][0].value

@tool
def get_number_of_tasks(state:Annotated[dict, InjectedState]) -> int:
    """
    Retrieve the total number of tasks in the room that the user is accessing. If the user is not currently accessing any room, return -1.
    """
    print(state)
    if state['room_id']=="":
        return -1
    else:
        ref = db.collection("room").document(state['room_id'])
        return ref.collection('task').count().get()[0][0].value
  
@tool
def get_specific_status_task(state:Annotated[dict, InjectedState],specific_status: str,user_task: bool):
    """
    Retrieve tasks with a specific status in the room that the user is accessing. If the user is not currently accessing any room, return -1. If a specific status does not exist, return the available statuses.
    Args:
        state: State of the communication
        specific_status: Status of the tasks the user wants to retrieve.
        user_task: Whether to receive only the tasks assigned to the current user.
    """
    print(state)
    if state['room_id']=="":
        return -1
    else:
        ref = db.collection("room").document(state['room_id']).collection('task_status')
        query=ref.where('name','==',specific_status)
        existing=next(query.stream(),None)
        result=[]
        if not existing:
            statuses=ref.stream()
            for status in statuses:
                doc=status.to_dict()
                result.append(doc['name'])
            return {'available_status':result} 
        ref_task=db.collection("room").document(state['room_id']).collection('task').where('status','==',specific_status)
        if user_task:
            ref_task=ref_task.where('assignee_id','==',state['user_id'])
        for task in ref_task.stream():
            data_task=task.to_dict()
            deadline=datetime.datetime.fromtimestamp(data_task['deadline'].timestamp())
            result.append({'task_name':data_task['title'],'deadline':deadline.strftime('%d %B, %H:%M')})
        return result

tools=[get_number_of_members,get_number_of_tasks,get_specific_status_task]
tool_node = ToolNode(tools)

# Attach the tools to the model so that it knows what it can call.
llm_with_tools = llm.bind_tools(tools)
checkpointer = MemorySaver()

database_agent = create_react_agent(llm, tool_node, state_schema=State,state_modifier='''You are an assistant for database operators. Use your tools to answer questions. If you do not have a tool to answer the question, say so. Don\'t include special characters in the response which can cause json parse error such as '\n'. Don't unintentionally lowercase characters in the response.''')


system_prompt = """ You are an assistant for database operators. Use your tools to answer questions. If you do not hav e a tool to answer the question, say so. """

#database_agent = helper.create_tool_agent(llm=llm, tools = tools, 
#              system_prompt = system_prompt)
