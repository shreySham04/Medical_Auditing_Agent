"""
Unit tests for rule grounding and official document retrieval.
"""

import unittest
from retrieval.rule_grounding import RuleGroundingEngine
from retrieval.guidelines_db import OFFICIAL_REGULATORY_DOCUMENTS


class TestRuleGrounding(unittest.TestCase):

    def test_official_documents_count(self):
        self.assertGreaterEqual(len(OFFICIAL_REGULATORY_DOCUMENTS), 7)
        for doc in OFFICIAL_REGULATORY_DOCUMENTS:
            self.assertIn("official_document", doc)
            self.assertIn("citation_code", doc)
            self.assertIn("official_quote", doc)

    def test_retrieve_grounded_rules(self):
        rules = RuleGroundingEngine.retrieve_grounded_rules(
            query="acute chest pain troponin ecg stemi",
            department="Cardiology"
        )
        self.assertTrue(len(rules) > 0)
        self.assertTrue(any("NCD" in r["official_document"] or "Cardiac" in r["official_document"] for r in rules))

    def test_build_evidence_finding_chain(self):
        finding = RuleGroundingEngine.build_evidence_finding(
            finding_id="EV-TEST-01",
            finding_type="Billing Inflation / Upcoding",
            description="CPT 99291 billed with only 12 minutes bedside care",
            severity="High",
            document_evidence="Doctor note: 'Bedside evaluation duration 12 min'",
            department="Emergency Medicine"
        )
        self.assertEqual(finding.id, "EV-TEST-01")
        self.assertTrue(len(finding.official_document) > 0)
        self.assertTrue(len(finding.citation_code) > 0)
        self.assertTrue(len(finding.official_citation_text) > 0)
        self.assertTrue(len(finding.human_readable_explanation) > 0)


if __name__ == "__main__":
    unittest.main()
