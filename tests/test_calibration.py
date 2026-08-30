"""
Unit tests for human-feedback calibration, ECE, and Brier score.
"""

import unittest
from core.calibration import HumanFeedbackCalibrator


class TestCalibration(unittest.TestCase):

    def test_calibration_scoring(self):
        findings = [
            {
                "id": "F-01",
                "type": "Clinical Deviation",
                "description": "Standard ED shorthand millivolt omitted on triage 12-lead ECG",
                "severity": "Medium"
            }
        ]
        result = HumanFeedbackCalibrator.calibrate_scores(
            clinical_score=85,
            billing_score=90,
            doc_score=90,
            timeline_score=90,
            findings=findings,
            department="Emergency Medicine"
        )
        self.assertIn("calibrated_score", result)
        self.assertIn("audit_recommendation", result)
        self.assertEqual(result["audit_recommendation"], "Pass")
        self.assertEqual(len(result["suppressed_findings"]), 1)

    def test_expected_calibration_error(self):
        preds = [0.1, 0.2, 0.8, 0.9, 0.85]
        labels = [0, 0, 1, 1, 1]
        ece = HumanFeedbackCalibrator.compute_expected_calibration_error(preds, labels)
        self.assertIsInstance(ece, float)
        self.assertGreaterEqual(ece, 0.0)
        self.assertLessEqual(ece, 1.0)

    def test_brier_score(self):
        preds = [0.1, 0.2, 0.8, 0.9]
        labels = [0, 0, 1, 1]
        brier = HumanFeedbackCalibrator.compute_brier_score(preds, labels)
        self.assertIsInstance(brier, float)
        self.assertLess(brier, 0.1)


if __name__ == "__main__":
    unittest.main()
