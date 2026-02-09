"""Evaluation runner for LangSmith integration.

Runs the chatbot graph against test datasets and applies custom evaluators,
uploading results to LangSmith for visualization.
"""

import argparse
import os
import sys
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# Enable tracing for evaluation runs
os.environ["LANGCHAIN_TRACING_V2"] = "true"


def run_evaluation(
    dataset_name: str = "chatbot-evaluation-dataset",
    experiment_prefix: str = "chatbot-eval",
    dry_run: bool = False
) -> dict:
    """
    Run evaluation against a LangSmith dataset.
    
    Args:
        dataset_name: Name of the LangSmith dataset
        experiment_prefix: Prefix for the experiment name
        dry_run: If True, run without uploading to LangSmith
        
    Returns:
        Evaluation results summary
    """
    from langsmith import Client, evaluate
    from langchain_core.messages import HumanMessage, AIMessage
    
    # Import here to avoid circular imports
    from src.core.graph import graph
    from src.core.state import State
    from src.evaluation.evaluators import ALL_EVALUATORS
    
    client = Client()
    
    # Define the target function that wraps our graph
    def target_function(inputs: dict) -> dict:
        """Wrapper function to run the chatbot graph."""
        # Convert history to message format
        history = inputs.get("history", [])
        messages = []
        for msg in history:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg["text"]))
            else:
                messages.append(AIMessage(content=msg["text"]))
        
        # Add current message
        messages.append(HumanMessage(content=inputs["message"]))
        
        # Create initial state
        initial_state = State(
            user_id=inputs.get("user_id", ""),
            room_id=inputs.get("room_id", ""),
            messages=messages
        )
        
        # Run the graph
        try:
            result = graph.invoke(initial_state)
            return {
                "messages": [
                    {"content": msg.content, "type": type(msg).__name__}
                    for msg in result.get("messages", [])
                ],
                "agent_history": [
                    {"content": msg.content, "name": getattr(msg, "name", "")}
                    for msg in result.get("agent_history", [])
                ]
            }
        except Exception as e:
            return {"error": str(e), "messages": []}
    
    if dry_run:
        print("DRY RUN MODE - Testing target function with sample input")
        sample_input = {
            "message": "Hello!",
            "user_id": "test",
            "room_id": "",
            "history": []
        }
        result = target_function(sample_input)
        print(f"Sample result: {result}")
        return {"status": "dry_run_complete", "sample_result": result}
    
    # Run evaluation
    print(f"Running evaluation on dataset: {dataset_name}")
    print(f"Experiment prefix: {experiment_prefix}")
    
    results = evaluate(
        target_function,
        data=dataset_name,
        evaluators=ALL_EVALUATORS,
        experiment_prefix=experiment_prefix,
        max_concurrency=2  # Limit concurrency for API rate limits
    )
    
    # Summarize results
    summary = {
        "experiment_name": results.experiment_name if hasattr(results, 'experiment_name') else experiment_prefix,
        "total_examples": 0,
        "evaluator_scores": {}
    }
    
    # Aggregate scores by evaluator
    for result in results:
        summary["total_examples"] += 1
        for eval_result in result.get("evaluation_results", []):
            key = eval_result.get("key", "unknown")
            score = eval_result.get("score", 0)
            
            if key not in summary["evaluator_scores"]:
                summary["evaluator_scores"][key] = {"total": 0, "count": 0}
            
            summary["evaluator_scores"][key]["total"] += score
            summary["evaluator_scores"][key]["count"] += 1
    
    # Calculate averages
    for key, data in summary["evaluator_scores"].items():
        if data["count"] > 0:
            data["average"] = data["total"] / data["count"]
    
    print("\n" + "="*50)
    print("EVALUATION SUMMARY")
    print("="*50)
    print(f"Total examples evaluated: {summary['total_examples']}")
    print("\nScores by evaluator:")
    for key, data in summary["evaluator_scores"].items():
        avg = data.get("average", 0)
        print(f"  {key}: {avg:.2%}")
    print("="*50)
    
    return summary


def setup_dataset():
    """Set up the evaluation dataset with sample test cases."""
    from src.evaluation.datasets import add_examples_to_dataset
    
    print("Setting up evaluation dataset...")
    add_examples_to_dataset()
    print("Dataset setup complete!")


def main():
    parser = argparse.ArgumentParser(
        description="Run LangSmith evaluation for chatbot"
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default="chatbot-evaluation-dataset",
        help="Name of the LangSmith dataset"
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="chatbot-eval",
        help="Experiment prefix"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without uploading to LangSmith"
    )
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Set up dataset with sample test cases"
    )
    
    args = parser.parse_args()
    
    if args.setup:
        setup_dataset()
    else:
        run_evaluation(
            dataset_name=args.dataset,
            experiment_prefix=args.prefix,
            dry_run=args.dry_run
        )


if __name__ == "__main__":
    main()
