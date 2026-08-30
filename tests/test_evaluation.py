"""
Unit tests for benchmark evaluation and metric computations.
"""

import unittest
from evaluation.benchmark import ALL_BENCHMARK_CASES
from evaluation.evaluator import BenchmarkEvaluator


class TestBenchmarkEvaluation(unittest.TestCase):

    def test_benchmark_cases_count(self):
        self.assertGreaterEqual(len(ALL_BENCHMARK_CASES), 100)
        first_case = ALL_BENCHMARK_CASES[0]
        self.assertIn("specialty", first_case.to_dict())
        self.assertIn("expected_score", first_case.to_dict())
        self.assertIn("expected_verdict", first_case.to_dict())
        self.assertIn("evidence_citation", first_case.to_dict())

    def test_evaluate_benchmark_metrics(self):
        metrics = BenchmarkEvaluator.evaluate_benchmark(ALL_BENCHMARK_CASES[:25])
        self.assertEqual(metrics.total_cases, 25)
        self.assertGreaterEqual(metrics.precision, 0.0)
        self.assertGreaterEqual(metrics.recall, 0.0)
        self.assertGreaterEqual(metrics.f1_score, 0.0)
        self.assertGreaterEqual(metrics.accuracy, 0.0)


if __name__ == "__main__":
    unittest.main()
