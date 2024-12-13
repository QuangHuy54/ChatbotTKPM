from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_vertexai import ChatVertexAI

from enum import Enum
#source:  https://medium.com/@ipeksahbazoglu/building-a-multi-agent-system-with-langgraph-and-gemini-1e7d7eab5c12
llm = ChatVertexAI(model_name= 'gemini-1.5-pro-001')

members = ["DatabaseOperator", "Guider", "Communicate"]

#create options map for the supervisor output parser.
member_options = {member:member for member in members}

#create Enum object
MemberEnum = Enum('MemberEnum', member_options)

from pydantic import BaseModel

#force Supervisor to pick from options defined above
# return a dictionary specifying the next agent to call 
#under key next.
class SupervisorOutput(BaseModel):
    #defaults to communication agent
    next: MemberEnum = MemberEnum.Communicate

system_prompt = (
    """You are a supervisor tasked with managing a conversation between the
    crew of workers:  {members}. Given the following user request, 
    and crew responses respond with the worker to act next.
    Each worker will perform a task and respond with their results and status. 
    When finished with the task, route to communicate to deliver the result to 
    user. Given the conversation and crew history below, who should act next?
    Select one of: {options} 
    \n{format_instructions}\n"""
)
# Our team supervisor is an LLM node. It just picks the next agent to process
# and decides when the work is completed

# Using openai function calling can make output parsing easier for us
supervisor_parser = JsonOutputParser(pydantic_object=SupervisorOutput)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        MessagesPlaceholder(variable_name="agent_history")
       
    ]
).partial(options=str(members), members=", ".join(members), 
    format_instructions = supervisor_parser.get_format_instructions())


supervisor_chain = (
    prompt | llm |supervisor_parser
)