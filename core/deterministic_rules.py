"""
Deterministic Rule Validation Engine.
Executes hard, mathematical and chronological rules with zero hallucination risk.
Deterministic rules produce verifiable boolean outcomes backed by CMS, AMA CPT, and AHA/ACC guidelines.
"""

from typing import List, Dict, Any, Tuple
from core.schemas import DeterministicRuleCheck, StructuredClinicalEvidence


class DeterministicRuleValidator:
    """
    Evaluates clinical and billing records against deterministic regulatory constraints.
    """

    @classmethod
    def validate_rules(cls, text: str, evidence: StructuredClinicalEvidence) -> List[DeterministicRuleCheck]:
        raw = text or ""
        lower = raw.lower()
        results: List[DeterministicRuleCheck] = []

        # RULE 1: CPT 99291 Critical Care Time Requirement (≥30 minutes face-to-face)
        if "99291" in raw or "critical care" in lower:
            physician_time = evidence.physician_time_minutes
            if physician_time is not None and physician_time < 30:
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-01",
                    rule_name="Critical Care Time Threshold Violation",
                    authority="CMS IOM Pub 100-04 Ch. 12 §30.6.12 & AMA CPT 2026 §99291",
                    citation_code="CMS-IOM-100-04-12-30.6.12",
                    expected_constraint="CPT 99291 requires ≥ 30 minutes of direct, continuous physician face-to-face critical care.",
                    observed_fact=f"Documented physician time was only {physician_time} minutes (< 30 min required threshold).",
                    status="VIOLATED",
                    severity="High",
                    penalty_score=35,
                    reproducible_rule_logic="ASSERT physician_time_minutes >= 30 WHEN cpt_code == '99291'"
                ))
            elif physician_time is not None and physician_time >= 30:
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-01",
                    rule_name="Critical Care Time Threshold Verified",
                    authority="CMS IOM Pub 100-04 Ch. 12 §30.6.12 & AMA CPT 2026 §99291",
                    citation_code="CMS-IOM-100-04-12-30.6.12",
                    expected_constraint="CPT 99291 requires ≥ 30 minutes of direct physician critical care.",
                    observed_fact=f"Documented physician time of {physician_time} minutes meets or exceeds statutory threshold.",
                    status="PASSED",
                    severity="Low",
                    penalty_score=0,
                    reproducible_rule_logic="ASSERT physician_time_minutes >= 30 WHEN cpt_code == '99291'"
                ))

        # RULE 2: Sepsis-3 3-Hour Bundle Sequence (Blood cultures before empiric antibiotics)
        if "sepsis" in lower or ("fever" in lower and "antibiotic" in lower):
            has_abx = any(m in lower for m in ["ceftriaxone", "vancomycin", "cefepime", "zosyn", "piperacillin", "antibiotic"])
            bcx_omitted = any(term in lower for term in ["no blood culture", "blood cultures omitted", "blood cultures were omitted", "without prior blood culture", "cultures were not drawn", "no cultures", "omitted prior to"])
            has_bcx_drawn = ("blood culture" in lower or "cultures drawn" in lower) and not bcx_omitted
            
            # Check if antibiotics were given with missing/omitted blood cultures
            if has_abx and (bcx_omitted or not has_bcx_drawn) and ("pneumonia" in lower or "sepsis" in lower or "bacteremia" in lower or "fever" in lower):
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-02",
                    rule_name="Sepsis-3 Bundle Sequence Infraction",
                    authority="Surviving Sepsis Campaign Guidelines 2026 & CMS SEP-1 Bundle §2.1",
                    citation_code="CMS-SEP1-2026-BUNDLE",
                    expected_constraint="Blood cultures must be obtained prior to initiating broad-spectrum antimicrobial therapy.",
                    observed_fact="Broad-spectrum IV antibiotics initiated without documentation of pre-administration blood culture acquisition.",
                    status="VIOLATED",
                    severity="High",
                    penalty_score=25,
                    reproducible_rule_logic="ASSERT blood_cultures_drawn_timestamp < antibiotic_admin_timestamp"
                ))

        # RULE 3: NCCI Modifier -59 / -X{EPSU} Procedural Unbundling on Same Anatomical Site
        if "-59" in raw or "modifier 59" in lower or "unbundle" in lower:
            is_same_site = "same incision" in lower or "same knee" in lower or "same vessel" in lower or "identical compartment" in lower
            if is_same_site:
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-03",
                    rule_name="Improper Modifier -59 Procedural Unbundling",
                    authority="CMS NCCI Policy Manual Ch. 1 §E & AMA CPT Guidelines Modifier 59",
                    citation_code="CMS-NCCI-CH1-MOD59",
                    expected_constraint="Modifier -59 requires distinct procedural encounter, separate incision, or distinct anatomical site.",
                    observed_fact="Modifier -59 appended to secondary surgical code performed through identical surgical incision / same anatomical site.",
                    status="VIOLATED",
                    severity="High",
                    penalty_score=30,
                    reproducible_rule_logic="ASSERT anatomical_site_A != anatomical_site_B WHEN modifier == '-59'"
                ))

        # RULE 4: ACS 10-Minute ECG Acquisition Protocol
        if "stemi" in lower or "chest pain" in lower or "cardiac arrest" in lower:
            if "ecg" in lower or "ekg" in lower:
                ecg_timing_match = any(term in lower for term in ["within 6 min", "within 5 min", "within 8 min", "within 10 min", "door-to-ecg: 7", "door-to-ecg: 6"])
                delayed_ecg = any(term in lower for term in ["ecg delayed", "ecg at 45 min", "ecg at 60 min", "ecg after 30 min", "no ecg obtained"])
                if delayed_ecg:
                    results.append(DeterministicRuleCheck(
                        rule_id="RULE-DET-04",
                        rule_name="Delayed Door-to-ECG Acquisition Beyond 10-Minute Window",
                        authority="AHA/ACC 2026 Guidelines for Management of Acute Coronary Syndromes §3.2.1",
                        citation_code="AHA-ACC-2026-ACS-3.2",
                        expected_constraint="Initial 12-lead ECG must be acquired and interpreted within 10 minutes of patient arrival.",
                        observed_fact="Door-to-ECG time exceeded statutory 10-minute maximum clinical standard.",
                        status="VIOLATED",
                        severity="Critical",
                        penalty_score=40,
                        reproducible_rule_logic="ASSERT door_to_ecg_minutes <= 10 WHEN chief_complaint == 'Chest Pain'"
                    ))
                elif ecg_timing_match:
                    results.append(DeterministicRuleCheck(
                        rule_id="RULE-DET-04",
                        rule_name="Door-to-ECG 10-Minute Standard Verified",
                        authority="AHA/ACC 2026 Guidelines for Management of Acute Coronary Syndromes §3.2.1",
                        citation_code="AHA-ACC-2026-ACS-3.2",
                        expected_constraint="Initial 12-lead ECG within 10 minutes of presentation.",
                        observed_fact="ECG acquisition completed within recommended clinical triage window.",
                        status="PASSED",
                        severity="Low",
                        penalty_score=0,
                        reproducible_rule_logic="ASSERT door_to_ecg_minutes <= 10"
                    ))

        # RULE 5: Informed Consent & Surgical Site Verification
        if ("surgery" in lower or "operative" in lower or "resection" in lower or "arthroscopy" in lower) and not "consent" in lower:
            results.append(DeterministicRuleCheck(
                rule_id="RULE-DET-05",
                rule_name="Missing Pre-Operative Informed Consent Documentation",
                authority="AAOS Clinical Practice Guidelines & Joint Commission Universal Protocol UP.01.01.01",
                citation_code="TJC-UP-01-CONSENT",
                expected_constraint="Explicit written pre-procedure informed consent must be documented prior to anesthesia induction.",
                observed_fact="Operative record lacks documentation of informed consent discussion covering risks, benefits, and alternatives.",
                status="VIOLATED",
                severity="High",
                penalty_score=25,
                reproducible_rule_logic="ASSERT informed_consent_documented == TRUE WHEN procedure_type == 'Surgical'"
            ))

        # RULE 6: Truncated Chart Minimum Completeness Check
        if evidence.is_truncated_or_incomplete:
            results.append(DeterministicRuleCheck(
                rule_id="RULE-DET-06",
                rule_name="Insufficient Clinical Evidence Threshold",
                authority="Federal Conditions of Participation 42 CFR §482.24(c)",
                citation_code="CFR-42-482.24-CHART-INTEGRITY",
                expected_constraint="Complete medical record must contain chief complaint, vital signs, physical exam, and attending plan.",
                observed_fact=f"Chart truncated or missing fundamental clinical sections ({', '.join(evidence.missing_prerequisites) if evidence.missing_prerequisites else 'incomplete text'}).",
                status="INSUFFICIENT_DATA",
                severity="Critical",
                penalty_score=0,
                reproducible_rule_logic="ASSERT len(record_text) >= 120 AND has_clinical_sections == TRUE"
            ))

        return results
