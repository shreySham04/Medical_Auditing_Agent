"""
Unit tests for modular application services, experiment tracking, and un-leaked evaluation.
"""

import unittest
from app.services.audit_service import AuditService
from app.services.benchmark_service import BenchmarkService
from app.services.report_service import ReportService
from core.experiment_tracker import ExperimentTracker
from evaluation.benchmark import ALL_BENCHMARK_CASES
from evaluation.evaluator import BenchmarkEvaluator


class TestServicesAndExperiments(unittest.TestCase):

    def test_audit_service_compliant_case(self):
        text = "Patient evaluated for routine outpatient consult. BP 120/80, HR 72, SpO2 98%. Informed consent obtained. Attending Dr. Smith MD, electronically signed."
        res = AuditService.execute_audit(text, save_to_disk=False)
        self.assertIn("complianceScore", res)
        self.assertIn(res["verdict"], ["Pass", "Flagged"])
        self.assertGreaterEqual(res["complianceScore"], 70)

    def test_audit_service_truncated_abstention(self):
        text = "Follow up note."
        res = AuditService.execute_audit(text, save_to_disk=False)
        self.assertEqual(res["verdict"], "INSUFFICIENT_EVIDENCE")
        self.assertEqual(res["complianceScore"], 0)

    def test_benchmark_service_metrics(self):
        metrics = BenchmarkService.get_benchmark_metrics()
        self.assertIn("precision", metrics)
        self.assertIn("recall", metrics)
        self.assertIn("f1_score", metrics)
        self.assertIn("score_mae", metrics)
        # Verify score_mae is not zero (no label leakage)
        self.assertGreater(metrics["score_mae"], 0.0)

    def test_ablation_experiments_runner(self):
        ablations = BenchmarkService.run_ablation_experiments()
        self.assertEqual(len(ablations), 4)
        arch_names = [a["architecture_name"] for a in ablations]
        self.assertIn("Baseline LLM (Zero-Shot)", arch_names)
        self.assertIn("Multi-Agent + Rules + Adversarial Verifier (Full Pipeline)", arch_names)

    def test_experiment_tracker(self):
        runs = BenchmarkService.get_experiment_runs()
        self.assertGreaterEqual(len(runs), 4)
        first_run = runs[0]
        self.assertIn("run_id", first_run)
        self.assertIn("model_version", first_run)
        self.assertIn("prompt_version", first_run)
        self.assertIn("latency_ms", first_run)

    def test_report_service_generation(self):
        audit = {
            "id": "AUD-TEST-99",
            "patientName": "Unknown / Not documented",
            "doctorName": "Unknown / Not documented",
            "hospitalName": "Facility A",
            "complianceScore": 88,
            "verdict": "Pass",
            "findings": []
        }
        html = ReportService.generate_html_report(audit)
        self.assertIn("AUD-TEST-99", html)
        self.assertIn("88 / 100", html)

    def test_zero_label_leakage_invariance(self):
        """
        Verify that changing expected_score in ground truth does NOT alter predicted score.
        """
        test_case = ALL_BENCHMARK_CASES[0]
        # Mutate expected_score artificially in ground truth
        original_expected = test_case.expected_score
        test_case.expected_score = 12

        metrics = BenchmarkEvaluator.evaluate_all([test_case])
        # Revert
        test_case.expected_score = original_expected

        # If system relied on expected_score, MAE would be 0; with mutation, predicted score is independent!
        self.assertGreater(metrics.score_mae, 0.0)


if __name__ == "__main__":
    unittest.main()
