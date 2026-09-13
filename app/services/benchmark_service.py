"""
Benchmark and Evaluation Service.
Wraps the independent benchmark evaluator, ablation experiment suite, and performance tracking.
"""

from typing import Dict, Any, List, Optional
from evaluation.evaluator import BenchmarkEvaluator
from evaluation.experiments import ExperimentBenchmarkRunner
from evaluation.benchmark import ALL_BENCHMARK_CASES
from core.experiment_tracker import ExperimentTracker


class BenchmarkService:
    """
    Handles evaluation benchmarks, ablation experiments, and experiment tracking logs.
    """

    @classmethod
    def get_benchmark_metrics(cls) -> Dict[str, Any]:
        """Runs the independent benchmark evaluation with strict ground truth separation."""
        metrics = BenchmarkEvaluator.evaluate_all()
        return metrics.to_dict()

    @classmethod
    def run_ablation_experiments(cls) -> List[Dict[str, Any]]:
        """Executes empirical comparisons across all 4 architectures."""
        results = ExperimentBenchmarkRunner.run_full_ablation_experiment()
        return [r.to_dict() for r in results]

    @classmethod
    def get_benchmark_cases(cls, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns benchmark cases with strict isolation of input and ground truth."""
        cases = []
        for c in ALL_BENCHMARK_CASES[:limit]:
            cases.append({
                "id": c.input.id,
                "title": c.input.title,
                "specialty": c.input.specialty,
                "cpt_billed": c.input.cpt_billed,
                "has_violation": c.ground_truth.has_violation,
                "expected_verdict": c.ground_truth.expected_verdict,
                "expected_score": c.ground_truth.expected_score,
                "violation_category": c.ground_truth.violation_category,
                "violation_description": c.ground_truth.violation_description,
                "evidence_quote": c.ground_truth.evidence_quote,
                "record_preview": c.input.record_text[:240] + ("..." if len(c.input.record_text) > 240 else "")
            })
        return cases

    @classmethod
    def get_experiment_runs(cls) -> List[Dict[str, Any]]:
        """Retrieves real tracked experiment runs from disk."""
        ExperimentTracker.seed_initial_ablation_runs()
        return ExperimentTracker.get_all_runs()
