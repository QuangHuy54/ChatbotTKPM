from langchain_core.messages import BaseMessage
from typing import List, Annotated
from langgraph.prebuilt.chat_agent_executor import AgentState
from langgraph.graph.message import add_messages


class State(AgentState):
    user_id: str
    room_id: str
    next: str
    messages: Annotated[List[BaseMessage], add_messages]
    agent_history: Annotated[List[BaseMessage], add_messages]
