"""Dataset management for LangSmith evaluation.

Provides utilities to create and manage test datasets in LangSmith
with sample test cases covering each agent type.
"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


# Sample test cases for evaluation
SAMPLE_TEST_CASES = [
    # Database Agent queries
    {
        "inputs": {
            "message": "How many members are in this room?",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "WVo9e2P9zgJMQddmZzRC",
            "history": []
        },
        "outputs": {
            "expected_agent": "database",
            "expected_tools": ["get_number_of_members"],
            "expected_response": ""  # Will vary based on database
        }
    },
    {
        "inputs": {
            "message": "How many tasks are there in this room?",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "WVo9e2P9zgJMQddmZzRC",
            "history": []
        },
        "outputs": {
            "expected_agent": "database",
            "expected_tools": ["get_number_of_tasks"],
            "expected_response": ""
        }
    },
    {
        "inputs": {
            "message": "Show me all my pending tasks",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "WVo9e2P9zgJMQddmZzRC",
            "history": []
        },
        "outputs": {
            "expected_agent": "database",
            "expected_tools": ["get_specific_status_task"],
            "expected_response": ""
        }
    },
    # Guider Agent queries (RAG)
    {
        "inputs": {
            "message": "How do I use this platform?",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "",
            "history": []
        },
        "outputs": {
            "expected_agent": "guider",
            "expected_tools": ["retrieval_information"],
            "expected_response": ""
        }
    },
    {
        "inputs": {
            "message": "What features does this platform have?",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "",
            "history": []
        },
        "outputs": {
            "expected_agent": "guider",
            "expected_tools": ["retrieval_information"],
            "expected_response": ""
        }
    },
    # Simple greetings (should go to Communicate after Supervisor)
    {
        "inputs": {
            "message": "Hello!",
            "user_id": "z3QKg4lNwdi9ZySG0QfJ",
            "room_id": "",
            "history": []
        },
        "outputs": {
            "expected_agent": "communicate",
            "expected_tools": [],
            "expected_response": ""
        }
    }
]


def get_langsmith_client():
    """Get the LangSmith client."""
    from langsmith import Client
    return Client()


def create_dataset(
    dataset_name: str = "chatbot-evaluation-dataset",
    description: str = "Evaluation dataset for multi-agent chatbot"
) -> str:
    """
    Create a new dataset in LangSmith or return existing one.
    
    Args:
        dataset_name: Name of the dataset
        description: Description of the dataset
        
    Returns:
        Dataset ID
    """
    client = get_langsmith_client()
    
    # Check if dataset already exists
    try:
        datasets = list(client.list_datasets(dataset_name=dataset_name))
        if datasets:
            print(f"Dataset '{dataset_name}' already exists")
            return datasets[0].id
    except Exception:
        pass
    
    # Create new dataset
    dataset = client.create_dataset(
        dataset_name=dataset_name,
        description=description
    )
    print(f"Created dataset '{dataset_name}' with ID: {dataset.id}")
    return dataset.id


def add_examples_to_dataset(
    dataset_name: str = "chatbot-evaluation-dataset",
    examples: Optional[list] = None
):
    """
    Add test examples to a LangSmith dataset.
    
    Args:
        dataset_name: Name of the dataset
        examples: List of examples (uses SAMPLE_TEST_CASES if None)
    """
    if examples is None:
        examples = SAMPLE_TEST_CASES
    
    client = get_langsmith_client()
    
    # Get or create dataset
    dataset_id = create_dataset(dataset_name)
    
    # Add examples
    for example in examples:
        client.create_example(
            inputs=example["inputs"],
            outputs=example.get("outputs"),
            dataset_id=dataset_id
        )
    
    print(f"Added {len(examples)} examples to dataset '{dataset_name}'")


def list_datasets():
    """List all available datasets."""
    client = get_langsmith_client()
    datasets = list(client.list_datasets())
    
    print(f"Found {len(datasets)} datasets:")
    for ds in datasets:
        print(f"  - {ds.name} (ID: {ds.id})")
    
    return datasets


def get_dataset_examples(dataset_name: str = "chatbot-evaluation-dataset") -> list:
    """
    Get all examples from a dataset.
    
    Args:
        dataset_name: Name of the dataset
        
    Returns:
        List of examples
    """
    client = get_langsmith_client()
    
    # Find dataset
    datasets = list(client.list_datasets(dataset_name=dataset_name))
    if not datasets:
        raise ValueError(f"Dataset '{dataset_name}' not found")
    
    # Get examples
    examples = list(client.list_examples(dataset_id=datasets[0].id))
    return examples


if __name__ == "__main__":
    # Quick test - create dataset with sample data
    print("Creating evaluation dataset with sample test cases...")
    add_examples_to_dataset()
    print("Done!")
