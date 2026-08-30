"""
Unit tests for core schemas and structured output parsers.
"""

import unittest
import json
from core.schemas import ClinicalAgentOutput, BillingAgentOutput, DocumentationAgentOutput, TimelineAgentOutput, EvidenceFinding
from core.parser import (
    validate_clinical_output,
    validate_billing_output,
    validate_documentation_output,
    validate_timeline_output,
    extract_structured_json
)


class TestSchemasAndParser(unittest.TestCase):

    def test_extract_structured_json(self):
        raw_text = "Here is the result:\n```json\n{\"clinical_score\": 92, \"clinical_grade\": \"A\"}\n```\nNote: Verified."
        extracted = extract_structured_json(raw_text)
        self.assertIsNotNone(extracted)
        self.assertEqual(extracted.get("clinical_score"), 92)

    def test_validate_clinical_output(self):
        raw_dict = {
            "clinical_score": "88",
            "clinical_grade": "B+",
            "adherence_standard": "AHA/ACC 2026",
            "clinical_gaps": ["Delayed Troponin"],
            "positive_indicators": ["ECG in 6m"]
        }
        res = validate_clinical_output(raw_dict)
        self.assertIsInstance(res, ClinicalAgentOutput)
        self.assertEqual(res.clinical_score, 88)
        self.assertEqual(res.clinical_grade, "B+")
        self.assertEqual(len(res.clinical_gaps), 1)

    def test_validate_billing_output(self):
        raw_dict = {
            "billing_score": 45,
            "billing_grade": "F",
            "billing_anomalies": ["CPT 99291 time travel"]
        }
        res = validate_billing_output(raw_dict)
        self.assertIsInstance(res, BillingAgentOutput)
        self.assertEqual(res.billing_score, 45)
        self.assertEqual(len(res.billing_anomalies), 1)

    def test_evidence_finding_to_dict(self):
        finding = EvidenceFinding(
            id="EV-01",
            type="Clinical Guideline Deviation",
            description="Omitted chest radiograph",
            severity="High",
            official_document="ATS/IDSA CAP Guideline",
            citation_code="ATS/IDSA §3.1",
            human_readable_explanation="Plain explanation."
        )
        d = finding.to_dict()
        self.assertEqual(d["id"], "EV-01")
        self.assertEqual(d["citation_code"], "ATS/IDSA §3.1")


if __name__ == "__main__":
    unittest.main()
