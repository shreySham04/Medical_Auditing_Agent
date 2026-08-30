"""
Unit tests for deterministic rule validation and structured evidence extraction.
"""

import unittest
from core.evidence_extractor import StructuredEvidenceExtractor
from core.deterministic_rules import DeterministicRuleValidator


class TestDeterministicRules(unittest.TestCase):

    def test_cpt_99291_time_violation(self):
        text = "Patient evaluated for mild dehydration. Bedside physician evaluation lasted 12 minutes total. Billed for CPT 99291."
        ev = StructuredEvidenceExtractor.extract_evidence(text)
        self.assertEqual(ev.physician_time_minutes, 12)
        rules = DeterministicRuleValidator.validate_rules(text, ev)
        violated_rules = [r for r in rules if r.status == "VIOLATED"]
        self.assertTrue(any(r.rule_id == "RULE-DET-01" for r in violated_rules))

    def test_cpt_99291_time_compliant(self):
        text = "Patient in septic shock. Physician spent 45 minutes direct bedside critical care resuscitating patient. CPT 99291."
        ev = StructuredEvidenceExtractor.extract_evidence(text)
        self.assertEqual(ev.physician_time_minutes, 45)
        rules = DeterministicRuleValidator.validate_rules(text, ev)
        passed_rules = [r for r in rules if r.status == "PASSED"]
        self.assertTrue(any(r.rule_id == "RULE-DET-01" for r in passed_rules))

    def test_sepsis_bundle_missing_blood_cultures(self):
        text = "Patient admitted with fever 39C and severe sepsis. IV Ceftriaxone 2g infused. No blood cultures ordered or drawn."
        ev = StructuredEvidenceExtractor.extract_evidence(text)
        rules = DeterministicRuleValidator.validate_rules(text, ev)
        violated_rules = [r for r in rules if r.status == "VIOLATED"]
        self.assertTrue(any(r.rule_id == "RULE-DET-02" for r in violated_rules))

    def test_modifier_59_unbundling_violation(self):
        text = "Patient underwent knee arthroplasty CPT 27447. Itemized claim submitted with CPT 29881-59 for meniscectomy in the same incision."
        ev = StructuredEvidenceExtractor.extract_evidence(text)
        rules = DeterministicRuleValidator.validate_rules(text, ev)
        violated_rules = [r for r in rules if r.status == "VIOLATED"]
        self.assertTrue(any(r.rule_id == "RULE-DET-03" for r in violated_rules))


if __name__ == '__main__':
    unittest.main()
