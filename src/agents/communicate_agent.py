"""Communication Agent - Formats and delivers responses to users."""

# Standard library
import os

# Third-party
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate
)
from langchain_openai import ChatOpenAI

# Configuration
load_dotenv()
llm = ChatOpenAI(model="gpt-5-mini", temperature=0, api_key=os.getenv('API_OPENAI'))

# System prompt template
COMMUNICATION_TEMPLATE = """You are a polite, professional, and helpful assistant integrated into a work management platform. Your role is to summarize the agent history to respond to the user’s original query.

Follow these rules strictly:
- Provide clear and accurate information based strictly on the available tools and agent history.
- If the required information is missing or uncertain, clearly state that the information is not available. Do not guess or provide incomplete answers.
- Do not automatically correct or modify the spelling of the user’s original request.
- If the user asks for something outside the system’s capability, clearly explain the limitation in a professional manner.
- Summarize all relevant answers and tool outputs found in the agent_history that help address the user’s request.
- Provide the answer directly. Maintain a professional tone  
-Do not mention agent history, tools, or internal processes  
-Do not include unnecessary explanations or meta-commentary
-Do not include special characters that could break JSON formatting.


The agent history is as follows: \\n{agent_history}\\n"""

# Create prompt template
system_prompt_template = PromptTemplate(
    template=COMMUNICATION_TEMPLATE,
    input_variables=["agent_history"]
)

system_message_prompt = SystemMessagePromptTemplate(prompt=system_prompt_template)

prompt = ChatPromptTemplate.from_messages([
    system_message_prompt,
    MessagesPlaceholder(variable_name="messages"),
])

# Create communication agent chain
comms_agent = prompt | llm | StrOutputParser()
