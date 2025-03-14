from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, PromptTemplate, SystemMessagePromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import BaseMessage
from typing import List,Annotated
from langgraph.prebuilt.chat_agent_executor import AgentState
from langgraph.graph.message import add_messages
from langchain_openai  import ChatOpenAI

class State(AgentState):
    user_id: str
    room_id: str
    next: str
    messages: Annotated[List[BaseMessage], add_messages]
    agent_history: Annotated[List[BaseMessage],add_messages]

def create_tool_agent(llm: ChatOpenAI, tools: list, system_prompt: str):
    """Helper function to create agents with custom tools and system prompt
    Args:
        llm (ChatOpenAI): LLM for the agent
        tools (list): list of tools the agent will use
        system_prompt (str): text describing specific agent purpose

    Returns:
        executor (AgentExecutor): Runnable for the agent created.
    """
    
    # Each worker node will be given a name and some tools.
    
    system_prompt_template = PromptTemplate(

                template= system_prompt + """
                ONLY respond to the part of query relevant to your purpose.
                IGNORE tasks you can't complete. Don\'t include special symbols in the response which can cause json parse error such as new lines.
                Use the following context to answer your query 
                if available: \n {agent_history} \n
                """,
                input_variables=["agent_history"],
            )

    #define system message
    system_message_prompt = SystemMessagePromptTemplate(prompt=system_prompt_template)

    prompt = ChatPromptTemplate.from_messages(
        [system_message_prompt,
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(agent=agent, tools=tools, 
                return_intermediate_steps= True, verbose = True,handle_parsing_errors=True)
    return executor

