from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser

from enum import Enum
#source:  https://medium.com/@ipeksahbazoglu/building-a-multi-agent-system-with-langgraph-and-gemini-1e7d7eab5c12
import os 
from langchain_openai  import ChatOpenAI
from langchain.output_parsers import OutputFixingParser

from dotenv import load_dotenv
load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini",temperature=0, api_key=os.getenv('API_OPENAI'))

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

descriptions='''
'DatabaseOperator': 'This worker can get information about rooms or tasks in the database', 'Guider': 'This worker can get basic information and the guidance of the platform', 'Communicate': 'This worker use to communicate with the user'
'''
system_prompt = (
    """You are a supervisor tasked with managing a conversation between the
    crew of workers:  {members} with the description of each workers: {descriptions}.  Given the following user request, 
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
).partial(options=str(members), descriptions=descriptions, members=", ".join(members), 
    format_instructions = supervisor_parser.get_format_instructions())

new_parser = OutputFixingParser.from_llm(parser=supervisor_parser, llm=llm)


supervisor_chain = (
    prompt | llm |new_parser
)