"""Custom evaluators for multi-agent chatbot evaluation using LangSmith.

This module provides evaluators tailored to the chatbot's 4-agent architecture:
- Response Quality: LLM-as-judge scoring for helpfulness and accuracy
- Agent Routing: Validates supervisor routes to correct agent
- RAG Relevance: Checks guider agent retrieves relevant documents
- Tool Usage: Verifies database agent uses correct tools
"""

import os
from typing import Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langsmith.schemas import Example, Run

load_dotenv()


def get_llm():
    """Get the LLM instance for evaluation."""
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv('API_OPENAI')
    )


def response_quality_evaluator(run: Run, example: Example) -> dict:
    """
    LLM-as-judge evaluator for response quality.
    
    Scores the response on:
    - Helpfulness (0-1): Does the response address the user's question?
    - Clarity (0-1): Is the response clear and well-structured?
    - Accuracy (0-1): Is the information correct based on expected output?
    
    Returns:
        dict with 'key', 'score', and 'comment'
    """
    llm = get_llm()
    
    # Extract the final response from the run
    outputs = run.outputs or {}
    response = outputs.get("messages", [{}])
    if isinstance(response, list) and len(response) > 0:
        final_response = response[-1].get("content", "") if isinstance(response[-1], dict) else str(response[-1])
    else:
        final_response = str(response)
    
    # Get expected output if available
    expected = example.outputs.get("expected_response", "") if example.outputs else ""
    user_query = example.inputs.get("message", "")
    
    evaluation_prompt = f"""You are an expert evaluator for a work management chatbot.

User Query: {user_query}

Chatbot Response: {final_response}

Expected Response (if available): {expected}

Evaluate the chatbot response on these criteria:
1. Helpfulness (0-10): Does it address the user's question appropriately?
2. Clarity (0-10): Is it clear, professional, and well-structured?
3. Accuracy (0-10): Is the information correct (if expected response available, compare against it)?

Respond with ONLY a JSON object:
{{"helpfulness": <score>, "clarity": <score>, "accuracy": <score>, "reasoning": "<brief explanation>"}}
"""
    
    try:
        result = llm.invoke(evaluation_prompt)
        import json
        scores = json.loads(result.content)
        
        # Calculate average score normalized to 0-1
        avg_score = (scores["helpfulness"] + scores["clarity"] + scores["accuracy"]) / 30.0
        
        return {
            "key": "response_quality",
            "score": avg_score,
            "comment": scores.get("reasoning", "")
        }
    except Exception as e:
        return {
            "key": "response_quality",
            "score": 0.0,
            "comment": f"Evaluation failed: {str(e)}"
        }


def agent_routing_evaluator(run: Run, example: Example) -> dict:
    """
    Evaluates if the supervisor routed to the correct agent.
    
    Checks the trace to see which agents were invoked and validates
    against the expected routing based on query type.
    """
    # Get expected agent from example
    expected_agent = example.outputs.get("expected_agent", "") if example.outputs else ""
    
    if not expected_agent:
        return {
            "key": "agent_routing",
            "score": 1.0,
            "comment": "No expected agent specified, skipping routing check"
        }
    
    # Recursively check all runs to find which agents were invoked
    invoked_agents = []
    
    def extract_agents(run_obj):
        """Recursively extract agent node names from the trace."""
        # Check if this run is an agent node
        if run_obj.name in ["DatabaseOperator", "Guider", "Communicate"]:
            if run_obj.name not in invoked_agents:
                invoked_agents.append(run_obj.name)
        
        # Recursively check child runs
        for child in (run_obj.child_runs or []):
            extract_agents(child)
    
    extract_agents(run)
    
    # Map expected agent names
    agent_mapping = {
        "database": "DatabaseOperator",
        "guider": "Guider",
        "rag": "Guider",
        "communicate": "Communicate"
    }
    
    expected_normalized = agent_mapping.get(expected_agent.lower(), expected_agent)
    
    if expected_normalized in invoked_agents:
        return {
            "key": "agent_routing",
            "score": 1.0,
            "comment": f"Correctly routed to {expected_normalized}"
        }
    else:
        return {
            "key": "agent_routing",
            "score": 0.0,
            "comment": f"Expected {expected_normalized}, but invoked: {invoked_agents}"
        }



def tool_usage_evaluator(run: Run, example: Example) -> dict:
    """
    Evaluates if the database agent used the correct tools.
    
    Checks the trace for tool calls and validates against expected tools.
    """
    expected_tools = example.outputs.get("expected_tools", []) if example.outputs else []
    
    if not expected_tools:
        return {
            "key": "tool_usage",
            "score": 1.0,
            "comment": "No expected tools specified, skipping tool check"
        }
    
    # Find tool calls in the run
    used_tools = []
    
    def extract_tools(run_obj):
        if run_obj.run_type == "tool":
            used_tools.append(run_obj.name)
        for child in (run_obj.child_runs or []):
            extract_tools(child)
    
    extract_tools(run)
    
    # Check if expected tools were used
    expected_set = set(expected_tools)
    used_set = set(used_tools)
    
    if expected_set.issubset(used_set):
        return {
            "key": "tool_usage",
            "score": 1.0,
            "comment": f"All expected tools used: {expected_tools}"
        }
    else:
        missing = expected_set - used_set
        return {
            "key": "tool_usage",
            "score": len(used_set & expected_set) / len(expected_set),
            "comment": f"Missing tools: {list(missing)}, Used: {list(used_set)}"
        }


def response_format_evaluator(run: Run, example: Example) -> dict:
    """
    Validates the response format (no JSON parse errors, special chars).
    
    Checks for common issues like newlines that could break JSON parsing.
    """
    outputs = run.outputs or {}
    response = outputs.get("messages", [{}])
    
    if isinstance(response, list) and len(response) > 0:
        final_response = response[-1].get("content", "") if isinstance(response[-1], dict) else str(response[-1])
    else:
        final_response = str(response)
    
    issues = []
    
    # Check for problematic characters
    if "\\n" in final_response:
        issues.append("Contains escaped newlines")
    
    # Check for empty response
    if not final_response.strip():
        issues.append("Empty response")
    
    # Calculate score
    if not issues:
        return {
            "key": "response_format",
            "score": 1.0,
            "comment": "Response format is valid"
        }
    else:
        return {
            "key": "response_format",
            "score": max(0, 1.0 - (len(issues) * 0.25)),
            "comment": f"Format issues: {', '.join(issues)}"
        }


# List of all evaluators for easy import
ALL_EVALUATORS = [
    response_quality_evaluator,
    agent_routing_evaluator,
    tool_usage_evaluator,
    response_format_evaluator
]
