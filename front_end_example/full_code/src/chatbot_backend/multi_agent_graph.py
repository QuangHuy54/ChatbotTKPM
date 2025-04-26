from langchain_core.messages import AIMessage
from communicate_agent import comms_agent
from langchain_core.messages import AIMessage
from langgraph.graph import StateGraph, END
import functools
import pprint
from database_agent import database_agent
from guider_agent import guider_agent
from supervisor_agent import supervisor_chain, member_options
from helper import State

# For agents in the crew 
def crew_nodes(state, crew_member, name):
    #read the last message in the message history.
    input = {'messages': [state['messages'][-1]], 
                'agent_history' : state['agent_history'],
                'user_id': state['user_id'],
                'room_id': state['room_id']}
    print("State being passed:", input)
    result = crew_member.invoke(input)
    print('Crew result:', result)
    print('\n Reuslt type',type(result),'\n')
    print('\n Reuslt',result,'\n')
    pprint.pprint(result)
    #add response to the agent history.
    if name=='DatabaseOperator':
        return {"agent_history": [AIMessage(content= result["messages"][-1].content,
                name=name)],
                'user_id': state['user_id'],
                'room_id': state['room_id']}        
    else:
        return {"agent_history": [AIMessage(content= result["messages"][-1].content, 
                name=name)],
                'user_id': state['user_id'],
                'room_id': state['room_id']}

def comms_node(state):
    #read the last message in the message history.
    input = {'messages': [state['messages'][-1]],
                     'agent_history' : state['agent_history']}
    result = comms_agent.invoke(input)
    #respond back to the user.
    return {"messages": [result]}

workflow = StateGraph(State)

database_node = functools.partial(crew_nodes, crew_member=database_agent, name="DatabaseOperator")

guider_node = functools.partial(crew_nodes, crew_member=guider_agent, name="Guider")



workflow.add_node("DatabaseOperator", database_node)
workflow.add_node("Guider", guider_node)

workflow.add_node("Communicate", comms_node )

workflow.add_node("Supervisor", supervisor_chain)
#set it as entrypoint to the graph.
workflow.set_entry_point("Supervisor")

workflow.add_edge('DatabaseOperator', "Supervisor") 
# add one edge for each of the tool agents
workflow.add_edge('Guider', "Supervisor") 
# add one edge for each of the tool agents

workflow.add_edge('Communicate', END) 
# end loop at communication agent.

# The supervisor populates the "next" field in the graph state
# which routes to a node or finishes

workflow.add_conditional_edges("Supervisor", lambda x: x["next"], member_options)

graph = workflow.compile(debug=True)