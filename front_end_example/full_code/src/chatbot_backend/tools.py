import vertexai
from vertexai.generative_models import (
    FunctionDeclaration,
    GenerationConfig,
    GenerativeModel,
    Part,
    Tool,
)

get_number_member_room=FunctionDeclaration(
    name="get_number_of_members",
    description="Retrieve the total number of members currently present in the room that the user is accessing. If the user is not currently accessing any room, return -1.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
        },
    },    
)
get_number_of_tasks_room=FunctionDeclaration(
    name="get_number_of_tasks",
    description="Retrieve the total number of tasks in the room that the user is accessing. If the user is not currently accessing any room, return -1.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
        },
    },    
)
get_specific_status_task=FunctionDeclaration(
    name="get_specific_status_task",
    description="Retrieve tasks with a specific status in the room that the user is accessing. If the user is not currently accessing any room, return -1. If a specific status does not exist, return the available statuses.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
            "specific_status":{"type":"string","description":"Status of the tasks the user wants to retrieve."},
            "user_task":{"type":"boolean","description":"Whether to receive only the tasks assigned to the current user."}
        },
    },    
)
tools = Tool(
    function_declarations=[
        get_number_member_room,
        get_number_of_tasks_room,
        get_specific_status_task,
    ],
)