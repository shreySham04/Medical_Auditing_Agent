"""
Unit tests for end-to-end multi-agent orchestration pipeline.
"""

import unittest
import asyncio
from orchestration.pipeline import MedicalAuditOrchestrator


class TestPipeline(unittest.TestCase):

    def test_audit_pipeline_execution(self):
        record_text = (
            "Patient Eleanor Rigby presented to ER with mild dehydration. "
            "Doctor visited bedside for 12 minutes. "
            "Billed for CPT 99291 critical care and unbundled kit."
        )
        res = asyncio.run(MedicalAuditOrchestrator.audit_patient_record(record_text))
        self.assertIn("complianceScore", res)
        self.assertIn("verdict", res)
        self.assertIn("findings", res)
        self.assertIn("reportMarkdown", res)
        self.assertGreaterEqual(len(res["findings"]), 1)


if __name__ == "__main__":
    unittest.main()
