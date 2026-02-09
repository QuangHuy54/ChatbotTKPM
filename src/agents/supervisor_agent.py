"""Supervisor Agent - Orchestrates multi-agent workflow."""

# Standard library
import os
from enum import Enum

# Third-party
from dotenv import load_dotenv
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

# Configuration
load_dotenv()
llm = ChatOpenAI(model="gpt-5-mini", temperature=0, api_key=os.getenv('API_OPENAI'))

# Define available workers
MEMBERS = ["DatabaseOperator", "Guider", "Communicate"]

# Worker descriptions
WORKER_DESCRIPTIONS = {
    'DatabaseOperator': 'This worker can get information about rooms or tasks in the database',
    'Guider': 'This worker can get basic information and the guidance of the platform',
    'Communicate': 'This worker use to communicate with the user'
}

# Create options map for the supervisor output parser
member_options = {member: member for member in MEMBERS}

# Create Enum object
MemberEnum = Enum('MemberEnum', member_options)


class SupervisorOutput(BaseModel):
    """Output schema for supervisor - specifies which worker should act next."""
    next: MemberEnum = MemberEnum.Communicate  # defaults to communication agent


# System prompt for supervisor
SYSTEM_PROMPT = """You are a supervisor tasked with managing a conversation between the crew of workers: {members} with the description of each workers: {descriptions}. Given the following user request, and crew responses respond with the worker to act next.

Each worker will perform a task and respond with their results and status. When finished with the task, route to communicate to deliver the result to user. Given the conversation and crew history below, who should act next?

Select one of: {options}

{format_instructions}"""

# Create supervisor parser
supervisor_parser = JsonOutputParser(pydantic_object=SupervisorOutput)

# Create prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder(variable_name="messages"),
    MessagesPlaceholder(variable_name="agent_history")
]).partial(
    options=str(MEMBERS),
    descriptions=str(WORKER_DESCRIPTIONS),
    members=", ".join(MEMBERS),
    format_instructions=supervisor_parser.get_format_instructions()
)

# Create supervisor chain
# Note: JsonOutputParser handles malformed JSON gracefully in modern LangChain
supervisor_chain = prompt | llm | supervisor_parser