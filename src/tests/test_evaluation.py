"""Tests for the evaluation module.

These tests can run without a LangSmith API key using mocks.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock


class TestEvaluators:
    """Test custom evaluators."""
    
    def test_response_format_evaluator_valid(self):
        """Test response format evaluator with valid response."""
        from src.evaluation.evaluators import response_format_evaluator
        
        # Create mock run and example
        run = Mock()
        run.outputs = {"messages": [{"content": "Hello! How can I help you today?"}]}
        
        example = Mock()
        example.outputs = {}
        
        result = response_format_evaluator(run, example)
        
        assert result["key"] == "response_format"
        assert result["score"] == 1.0
        assert "valid" in result["comment"].lower()
    
    def test_response_format_evaluator_empty(self):
        """Test response format evaluator with empty response."""
        from src.evaluation.evaluators import response_format_evaluator
        
        run = Mock()
        run.outputs = {"messages": [{"content": ""}]}
        
        example = Mock()
        example.outputs = {}
        
        result = response_format_evaluator(run, example)
        
        assert result["key"] == "response_format"
        assert result["score"] < 1.0
        assert "Empty response" in result["comment"]
    
    def test_agent_routing_evaluator_no_expected(self):
        """Test routing evaluator skips when no expected agent."""
        from src.evaluation.evaluators import agent_routing_evaluator
        
        run = Mock()
        run.child_runs = []
        
        example = Mock()
        example.outputs = {}  # No expected_agent
        
        result = agent_routing_evaluator(run, example)
        
        assert result["key"] == "agent_routing"
        assert result["score"] == 1.0
        assert "skipping" in result["comment"].lower()
    
    def test_tool_usage_evaluator_no_expected(self):
        """Test tool evaluator skips when no expected tools."""
        from src.evaluation.evaluators import tool_usage_evaluator
        
        run = Mock()
        run.run_type = "chain"
        run.child_runs = []
        
        example = Mock()
        example.outputs = {}  # No expected_tools
        
        result = tool_usage_evaluator(run, example)
        
        assert result["key"] == "tool_usage"
        assert result["score"] == 1.0


class TestDatasets:
    """Test dataset management."""
    
    def test_sample_test_cases_structure(self):
        """Test that sample test cases have correct structure."""
        from src.evaluation.datasets import SAMPLE_TEST_CASES
        
        assert len(SAMPLE_TEST_CASES) > 0
        
        for case in SAMPLE_TEST_CASES:
            assert "inputs" in case
            assert "outputs" in case
            assert "message" in case["inputs"]
    
    def test_sample_covers_all_agents(self):
        """Test that sample cases cover all agent types."""
        from src.evaluation.datasets import SAMPLE_TEST_CASES
        
        expected_agents = {"database", "guider", "communicate"}
        found_agents = set()
        
        for case in SAMPLE_TEST_CASES:
            agent = case["outputs"].get("expected_agent", "")
            if agent:
                found_agents.add(agent.lower())
        
        assert found_agents == expected_agents


class TestRunner:
    """Test evaluation runner."""
    
    @patch('src.evaluation.runner.graph')
    def test_dry_run_mode(self, mock_graph):
        """Test that dry run doesn't call LangSmith."""
        from src.evaluation.runner import run_evaluation
        
        # Mock graph invoke
        mock_result = {
            "messages": [Mock(content="Test response")],
            "agent_history": []
        }
        mock_graph.invoke.return_value = mock_result
        
        # This should not raise and should return dry run result
        with patch('src.evaluation.runner.Client'):
            result = run_evaluation(dry_run=True)
        
        assert result["status"] == "dry_run_complete"
        assert "sample_result" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
