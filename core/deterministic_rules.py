"""
Deterministic Rule Validation Engine.
Executes hard, mathematical and chronological rules with zero hallucination risk.
Deterministic rules produce verifiable boolean outcomes backed by CMS, AMA CPT, and AHA/ACC guidelines,
distinguishing statutory coding rules from clinical practice guidelines, and evaluating clinical exceptions.
"""

from typing import List, Dict, Any, Optional
from core.schemas import DeterministicRuleCheck, StructuredClinicalEvidence, RegulatorySourceProvenance
from retrieval.guidelines_db import OFFICIAL_REGULATORY_DOCUMENTS


class DeterministicRuleValidator:
    """
    Evaluates clinical and billing records against deterministic regulatory constraints
    with source provenance and clinical exception handling.
    """

    @classmethod
    def _get_provenance(cls, doc_id: str) -> Optional[RegulatorySourceProvenance]:
        for doc in OFFICIAL_REGULATORY_DOCUMENTS:
            if doc.get("id") == doc_id and "provenance" in doc:
                p = doc["provenance"]
                return RegulatorySourceProvenance(
                    source_organization=p.get("source_organization", "Regulatory Body"),
                    document_title=p.get("document_title", ""),
                    version_or_edition=p.get("version_or_edition", ""),
                    publication_date=p.get("publication_date", ""),
                    effective_date=p.get("effective_date", ""),
                    section=p.get("section", ""),
                    canonical_identifier=p.get("canonical_identifier", ""),
                    jurisdiction=p.get("jurisdiction", ""),
                    last_verified_date=p.get("last_verified_date", ""),
                    rule_reviewer=p.get("rule_reviewer", ""),
                    rule_type=p.get("rule_type", "STATUTORY_CODING_RULE"),
                    clinical_exceptions=p.get("clinical_exceptions", [])
                )
        return None

    @classmethod
    def validate_rules(cls, text: str, evidence: StructuredClinicalEvidence) -> List[DeterministicRuleCheck]:
        raw = text or ""
        lower = raw.lower()
        results: List[DeterministicRuleCheck] = []

        coding = evidence.coding_predicates or {}
        procedural = evidence.procedural_predicates or {}
        timing = evidence.timing_milestones or {}
        labs = evidence.lab_values or {}
        assertions = {a.concept: a for a in evidence.clinical_assertions}
        exceptions = evidence.documented_exceptions or []

        # RULE 1: CPT 99291 Critical Care Time Requirement (≥30 minutes face-to-face)
        # Type: STATUTORY_CODING_RULE
        prov_99291 = cls._get_provenance("DOC-AMA-CPT-99291")
        if coding.get("cpt_99291_critical_care") or "99291" in raw or "critical care" in lower:
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
                    reproducible_rule_logic="ASSERT physician_time_minutes >= 30 WHEN cpt_code == '99291'",
                    rule_type="STATUTORY_CODING_RULE",
                    provenance=prov_99291
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
                    reproducible_rule_logic="ASSERT physician_time_minutes >= 30 WHEN cpt_code == '99291'",
                    rule_type="STATUTORY_CODING_RULE",
                    provenance=prov_99291
                ))

        # RULE 2: Sepsis-3 Bundle Sequence (Blood cultures before empiric antibiotics)
        # Type: CLINICAL_PRACTICE_GUIDELINE (with clinical exceptions for difficult access or emergent threat)
        prov_sepsis = cls._get_provenance("DOC-SURVIVING-SEPSIS")
        has_abx = (
            any(m in ["Ceftriaxone", "Vancomycin", "Cefepime", "Zosyn", "Piperacillin", "Azithromycin"] for m in evidence.medications_ordered)
            or any(abx in lower for abx in ["ceftriaxone", "vancomycin", "cefepime", "zosyn", "piperacillin", "azithromycin", "antibiotic", "antibiotics"])
        )
        if "sepsis" in lower or ("fever" in lower and has_abx):
            bc_assertion = assertions.get("blood_cultures")
            has_bcx_drawn = procedural.get("has_blood_cultures_drawn", False)
            
            if bc_assertion and bc_assertion.assertion_status == "EXCEPTION_IDENTIFIED":
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-02",
                    rule_name="Sepsis Bundle Clinical Exception Applied",
                    authority="Surviving Sepsis Campaign Guidelines 2026 §Hour-1 Bundle",
                    citation_code="SSC-GUIDELINE-2026-EXCEPTION",
                    expected_constraint="Blood cultures prior to antimicrobials unless emergency threat or severe access limitation.",
                    observed_fact=f"Clinical exception documented: {bc_assertion.exception_notes or 'Difficult access priority.'}",
                    status="CLINICAL_EXCEPTION_APPLIED",
                    severity="Low",
                    penalty_score=0,
                    reproducible_rule_logic="IF exception_documented THEN status = EXCEPTION_APPLIED",
                    rule_type="CLINICAL_PRACTICE_GUIDELINE",
                    provenance=prov_sepsis,
                    clinical_exception_noted=bc_assertion.exception_notes
                ))
            elif has_abx and not has_bcx_drawn and ("pneumonia" in lower or "sepsis" in lower or "bacteremia" in lower or "fever" in lower):
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
                    reproducible_rule_logic="ASSERT blood_cultures_drawn_timestamp < antibiotic_admin_timestamp",
                    rule_type="CLINICAL_PRACTICE_GUIDELINE",
                    provenance=prov_sepsis
                ))

        # RULE 3: NCCI Modifier -59 / -X{EPSU} Procedural Unbundling on Same Anatomical Site
        # Type: STATUTORY_CODING_RULE
        prov_ncci = cls._get_provenance("DOC-CMS-NCCI-MOD59")
        if procedural.get("has_modifier_59") or "-59" in raw or "modifier 59" in lower:
            is_same_site = procedural.get("is_same_incision", False) or "same incision" in lower or "same knee" in lower
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
                    reproducible_rule_logic="ASSERT anatomical_site_A != anatomical_site_B WHEN modifier == '-59'",
                    rule_type="STATUTORY_CODING_RULE",
                    provenance=prov_ncci
                ))

        # RULE 4: ACS 10-Minute ECG Acquisition Protocol
        # Type: CLINICAL_PRACTICE_GUIDELINE
        prov_ncd = cls._get_provenance("DOC-CMS-NCD-20.4")
        if "stemi" in lower or "chest pain" in lower or "cardiac arrest" in lower or "troponin" in labs:
            door_to_ecg = timing.get("door_to_ecg_minutes")
            if door_to_ecg is not None:
                if door_to_ecg > 10:
                    results.append(DeterministicRuleCheck(
                        rule_id="RULE-DET-04",
                        rule_name="Delayed Door-to-ECG Acquisition Beyond 10-Minute Window",
                        authority="AHA/ACC 2026 Guidelines for Management of Acute Coronary Syndromes §3.2.1",
                        citation_code="AHA-ACC-2026-ACS-3.2",
                        expected_constraint="Initial 12-lead ECG must be acquired and interpreted within 10 minutes of patient arrival.",
                        observed_fact=f"Door-to-ECG time of {door_to_ecg} min exceeded statutory 10-minute maximum clinical standard.",
                        status="VIOLATED",
                        severity="Critical",
                        penalty_score=40,
                        reproducible_rule_logic="ASSERT door_to_ecg_minutes <= 10 WHEN chief_complaint == 'Chest Pain'",
                        rule_type="CLINICAL_PRACTICE_GUIDELINE",
                        provenance=prov_ncd
                    ))
                else:
                    results.append(DeterministicRuleCheck(
                        rule_id="RULE-DET-04",
                        rule_name="Door-to-ECG 10-Minute Standard Verified",
                        authority="AHA/ACC 2026 Guidelines for Management of Acute Coronary Syndromes §3.2.1",
                        citation_code="AHA-ACC-2026-ACS-3.2",
                        expected_constraint="Initial 12-lead ECG within 10 minutes of presentation.",
                        observed_fact=f"ECG acquisition completed within {door_to_ecg} minutes (concordant with clinical triage standard).",
                        status="PASSED",
                        severity="Low",
                        penalty_score=0,
                        reproducible_rule_logic="ASSERT door_to_ecg_minutes <= 10",
                        rule_type="CLINICAL_PRACTICE_GUIDELINE",
                        provenance=prov_ncd
                    ))

        # RULE 5: Informed Consent & Surgical Site Verification
        # Type: DOCUMENTATION_STANDARD
        prov_aaos = cls._get_provenance("DOC-AAOS-ARTHROPLASTY")
        is_surgical = bool(evidence.procedures_identified) or any(t in lower for t in ["surgery", "operative", "resection", "arthroscopy"])
        has_consent = procedural.get("has_informed_consent", False)
        if is_surgical and not has_consent:
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
                reproducible_rule_logic="ASSERT informed_consent_documented == TRUE WHEN procedure_type == 'Surgical'",
                rule_type="DOCUMENTATION_STANDARD",
                provenance=prov_aaos
            ))

        # RULE 6: Diagnostic Radiographic Confirmation for Inpatient Pneumonia
        # Type: CLINICAL_PRACTICE_GUIDELINE
        prov_cap = cls._get_provenance("DOC-ATS-IDSA-PNEUMONIA")
        if "pneumonia" in lower and ("admitted" in lower or "inpatient" in lower):
            cxr_assertion = assertions.get("chest_radiograph")
            has_imaging = procedural.get("has_radiograph_confirmed", False)
            if cxr_assertion and cxr_assertion.assertion_status == "EXCEPTION_IDENTIFIED":
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-07",
                    rule_name="Pneumonia Imaging Exception Applied",
                    authority="ATS/IDSA Community-Acquired Pneumonia Guidelines §3.1",
                    citation_code="ATS-IDSA-CAP-EXCEPTION",
                    expected_constraint="Chest imaging required unless clinical exception or alternate bedside ultrasound documented.",
                    observed_fact=f"Clinical exception documented: {cxr_assertion.exception_notes or 'Bedside ultrasound / acute stabilization exception.'}",
                    status="CLINICAL_EXCEPTION_APPLIED",
                    severity="Low",
                    penalty_score=0,
                    reproducible_rule_logic="IF exception_documented THEN status = EXCEPTION_APPLIED",
                    rule_type="CLINICAL_PRACTICE_GUIDELINE",
                    provenance=prov_cap,
                    clinical_exception_noted=cxr_assertion.exception_notes
                ))
            elif not has_imaging and ("no chest x-ray" in lower or "without radiographic" in lower or "no imaging" in lower):
                results.append(DeterministicRuleCheck(
                    rule_id="RULE-DET-07",
                    rule_name="Unconfirmed Pneumonia Diagnosis Without Radiography",
                    authority="ATS/IDSA Community-Acquired Pneumonia Guidelines §3.1 & CMS QM #067",
                    citation_code="ATS-IDSA-CAP-3.1",
                    expected_constraint="Mandatory chest radiograph or CT imaging to confirm parenchymal infiltrate prior to definitive inpatient diagnosis.",
                    observed_fact="Inpatient admission and broad-spectrum antimicrobial management for pneumonia without documented radiographic confirmation.",
                    status="VIOLATED",
                    severity="High",
                    penalty_score=30,
                    reproducible_rule_logic="ASSERT chest_radiography_documented == TRUE WHEN diagnosis == 'Pneumonia'",
                    rule_type="CLINICAL_PRACTICE_GUIDELINE",
                    provenance=prov_cap
                ))

        # RULE 7: Truncated Chart Minimum Completeness Check
        # Type: DOCUMENTATION_STANDARD
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
                reproducible_rule_logic="ASSERT len(record_text) >= 120 AND has_clinical_sections == TRUE",
                rule_type="DOCUMENTATION_STANDARD"
            ))

        return results
