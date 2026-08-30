"""
Unit tests for Independent Verifier Pass, Cross-Agent Disagreement Detector, and Cryptographic Audit Trace.
"""

import unittest
from core.verifier import IndependentVerifierPass
from core.disagreement_detector import CrossAgentDisagreementDetector
from core.trace import CryptographicAuditTraceEngine


class TestVerifierDisagreementAndTrace(unittest.TestCase):

    def test_verifier_pass_rejects_hallucinations(self):
        source_text = "Patient presenting with mild headache and normal neurological exam."
        hallucinated_finding = {
            "id": "EV-CLIN-99",
            "type": "Clinical Guideline Deviation",
            "description": "Failure to perform emergency craniotomy for subdural hematoma with midline shift.",
            "document_evidence": "Emergency craniotomy not performed for massive acute hemorrhage.",
            "severity": "Critical",
            "official_document": "Neurosurgical Trauma Guidelines",
            "citation_code": "NEURO-01"
        }
        logs, final_findings = IndependentVerifierPass.verify_findings([hallucinated_finding], source_text)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].verification_status, "HALLUCINATION_REJECTED")
        self.assertEqual(len(final_findings), 0)

    def test_verifier_pass_upholds_grounded_finding(self):
        source_text = "Patient evaluated for dehydration with only 12 minutes bedside time. Billed CPT 99291 critical care."
        grounded_finding = {
            "id": "EV-BILL-01",
            "type": "Billing Inflation",
            "description": "CPT 99291 billed with only 12 minutes bedside time.",
            "document_evidence": "only 12 minutes bedside time",
            "severity": "High",
            "official_document": "AMA CPT 2026",
            "citation_code": "CPT-99291"
        }
        logs, final_findings = IndependentVerifierPass.verify_findings([grounded_finding], source_text)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].verification_status, "VERIFIED")
        self.assertEqual(len(final_findings), 1)

    def test_cross_agent_disagreement_detection(self):
        clinical = {"clinical_score": 90, "clinical_grade": "A", "clinical_gaps": []}
        billing = {"billing_score": 40, "billing_grade": "F", "billing_anomalies": ["Severe upcoding CPT 99291"]}
        doc = {"documentation_score": 90, "documentation_grade": "A", "missing_required_fields": []}
        timeline = {"timeline_score": 90, "timeline_grade": "A", "timeline_inconsistencies": []}

        consensus_idx, disagreements = CrossAgentDisagreementDetector.evaluate_consensus(
            clinical, billing, doc, timeline, "Test chart"
        )
        self.assertTrue(len(disagreements) > 0)
        self.assertTrue(consensus_idx < 90.0)

    def test_cryptographic_trace_generation(self):
        trace = CryptographicAuditTraceEngine.generate_trace_manifest(
            case_id="TEST-001",
            input_text="Sample patient text",
            structured_evidence={},
            deterministic_rules=[],
            agent_results={},
            verifier_results=[],
            final_verdict="Pass",
            final_score=95
        )
        self.assertIsNotNone(trace.sha256_bundle_hash)
        self.assertEqual(len(trace.sha256_bundle_hash), 64)
        self.assertTrue(trace.reproducibility_token.startswith("MAUD-TRACE-"))


if __name__ == '__main__':
    unittest.main()
