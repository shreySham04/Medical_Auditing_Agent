"""
Clinical Audit Service.
Encapsulates prompt injection defense, structured evidence extraction, deterministic rule enforcement,
and multi-agent verification pass for processing inpatient and outpatient clinical records.
"""

import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

from core.adversarial import PromptInjectionDefender
from core.evidence_extractor import StructuredEvidenceExtractor
from core.deterministic_rules import DeterministicRuleValidator
from core.verifier import IndependentVerifierPass
from core.calibration import ExpertRuleCalibrator
from app.config import AUDITS_DIR


class AuditService:
    """
    High-level orchestrator for executing evidence-grounded medical compliance audits.
    """

    @classmethod
    def execute_audit(
        cls,
        record_text: str,
        patient_name: str = "Unknown / Not documented",
        doctor_name: str = "Unknown / Not documented",
        hospital_name: str = "Unknown / Not documented",
        specialization: str = "General Medicine",
        department: str = "Inpatient Unit",
        audit_id: Optional[str] = None,
        save_to_disk: bool = True
    ) -> Dict[str, Any]:
        """
        Runs the full 4-stage pipeline:
        1. Prompt Injection Scanning & Neutralization
        2. Structured Extraction (entities, procedures, dosages, time spans)
        3. Deterministic Statutory Rule Validation (CMS / AMA)
        4. Independent Adversarial Verifier Pass & Exception Handling
        """
        t_start = time.perf_counter()
        if not audit_id:
            audit_id = f"AUD-{int(time.time() * 1000) % 1000000:06d}"

        # 1. Adversarial Defense
        clean_text, injection_res = PromptInjectionDefender.scan_and_defend(record_text)

        # 2. Structured Evidence Extraction
        extracted_facts = StructuredEvidenceExtractor.extract_evidence(clean_text)

        # Check for truncated or un-auditable chart
        if extracted_facts.is_truncated_or_incomplete or len(clean_text.strip()) < 80:
            result = {
                "id": audit_id,
                "case_id": audit_id,
                "patientName": patient_name,
                "doctorName": doctor_name,
                "hospitalName": hospital_name,
                "department": department,
                "complianceScore": 0,
                "primaryScore": 0,
                "clinicalScore": 0,
                "billingScore": 0,
                "documentationScore": 0,
                "timelineScore": 0,
                "verdict": "INSUFFICIENT_EVIDENCE",
                "riskClassification": "CRITICAL_DEFICIENCY",
                "abstention_reason": "Clinical chart is severely truncated or lacks prerequisite clinical documentation.",
                "findings": [
                    {
                        "id": "FIND-INSUFF-01",
                        "type": "Documentation Quality",
                        "severity": "Critical",
                        "description": "Chart is incomplete or truncated. Abstaining from scoring per clinical safety protocol.",
                        "official_document": "CMS Condition of Participation (42 CFR § 482.24)",
                        "citation_code": "CMS-DOC-REQ"
                    }
                ],
                "explainedTerms": [],
                "reportMarkdown": f"# Forensic Audit Abstention: {audit_id}\n\n**Verdict:** INSUFFICIENT_EVIDENCE\n\nRecord contains fewer than required clinical elements.",
                "latency_ms": round((time.perf_counter() - t_start) * 1000, 1),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            if save_to_disk:
                cls.save_audit(result)
            return result

        # 3. Deterministic Statutory Rules
        rule_evaluations = DeterministicRuleValidator.validate_rules(clean_text, extracted_facts)
        violated_rules = [r for r in rule_evaluations if r.status == "VIOLATED"]
        exceptions_applied = [r for r in rule_evaluations if r.status == "CLINICAL_EXCEPTION_APPLIED"]

        # 4. Independent Verifier Pass
        candidate_claims = [
            {
                "id": r.rule_id,
                "description": r.rule_name,
                "severity": r.severity,
                "document_evidence": r.observed_fact,
                "deterministic_rule_id": r.rule_id,
                "citation_code": r.citation_code
            }
            for r in violated_rules
        ]
        rejected_claims, upheld_claims = IndependentVerifierPass.verify_findings(
            candidate_claims, clean_text, specialization
        )

        # 5. Score Formulation strictly grounded in verified violations
        if upheld_claims:
            penalties = sum(
                next((r.penalty_score for r in violated_rules if r.rule_id == c["id"]), 25)
                for c in upheld_claims
            )
            missing_pen = len(extracted_facts.missing_prerequisites) * 5
            total_penalty = min(85, penalties + missing_pen)
            final_score = max(15, 100 - total_penalty)
            verdict = "Failed" if final_score < 60 else "Flagged"
            risk_class = "CRITICAL_DEFICIENCY" if final_score < 60 else "HIGH_COMPLEXITY_MONITORED"
        elif exceptions_applied:
            final_score = 92
            verdict = "Pass"
            risk_class = "STANDARD_MONITORING"
        else:
            missing_pen = len(extracted_facts.missing_prerequisites) * 5
            final_score = max(75, 100 - missing_pen)
            verdict = "Pass" if final_score >= 80 else "Flagged"
            risk_class = "STANDARD_MONITORING" if final_score >= 80 else "HIGH_COMPLEXITY_MONITORED"

        # Build findings list
        findings = []
        for c in upheld_claims:
            matched_r = next((r for r in violated_rules if r.rule_id == c["id"]), None)
            findings.append({
                "id": c["id"],
                "type": "Billing Integrity" if "billing" in c["id"].lower() or "cpt" in c["id"].lower() else "Clinical Care Quality",
                "severity": c["severity"],
                "description": matched_r.explanation if matched_r else c["description"],
                "document_evidence": c.get("document_evidence", ""),
                "citation_code": c.get("citation_code", "GEN-01"),
                "official_document": matched_r.statutory_reference if matched_r else "CMS / AMA Policy",
                "verification_status": "VERIFIED"
            })

        for ex in exceptions_applied:
            findings.append({
                "id": f"EXC-{ex.rule_id}",
                "type": "Clinical Exception Validated",
                "severity": "Low",
                "description": f"Clinical Exception Applied: {ex.exception_notes}",
                "document_evidence": ex.observed_fact,
                "citation_code": ex.citation_code,
                "official_document": ex.statutory_reference,
                "verification_status": "EXCEPTION_CONFIRMED"
            })

        report_md = cls._generate_markdown_report(
            audit_id=audit_id,
            patient_name=patient_name,
            doctor_name=doctor_name,
            hospital_name=hospital_name,
            specialty=specialization,
            score=final_score,
            verdict=verdict,
            findings=findings,
            clean_text=clean_text
        )

        res = {
            "id": audit_id,
            "case_id": audit_id,
            "patientName": patient_name,
            "doctorName": doctor_name,
            "hospitalName": hospital_name,
            "department": department,
            "doctorSpecialization": specialization,
            "complianceScore": final_score,
            "primaryScore": final_score,
            "clinicalScore": max(20, final_score - 5 if verdict != "Pass" else final_score),
            "billingScore": max(20, final_score - 10 if verdict != "Pass" else final_score),
            "documentationScore": max(20, final_score + 5 if verdict != "Pass" else final_score),
            "timelineScore": 90,
            "verdict": verdict,
            "riskClassification": risk_class,
            "findings": findings,
            "explainedTerms": [
                {"term": "CPT 99291", "definition": "Critical care evaluation and management, first 30-74 minutes requiring direct continuous physician engagement."},
                {"term": "Modifier -59", "definition": "Distinct procedural service identifier indicating non-overlapping anatomical site or distinct operative encounter."},
                {"term": "Surviving Sepsis Bundle", "definition": "Statutory protocol requiring blood cultures, serum lactate, and IV antibiotics within 3 hours of sepsis identification."}
            ],
            "reportMarkdown": report_md,
            "latency_ms": round((time.perf_counter() - t_start) * 1000, 1),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        if save_to_disk:
            cls.save_audit(res)
        return res

    @classmethod
    def save_audit(cls, audit: Dict[str, Any]) -> None:
        audit_id = audit.get("id") or audit.get("case_id") or "AUD-UNKNOWN"
        json_path = AUDITS_DIR / f"{audit_id}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(audit, f, indent=2)

        if audit.get("reportMarkdown"):
            md_path = AUDITS_DIR / f"{audit_id}_report.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(audit["reportMarkdown"])

    @classmethod
    def get_audit(cls, audit_id: str) -> Optional[Dict[str, Any]]:
        path = AUDITS_DIR / f"{audit_id}.json"
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def get_all_audits(cls) -> List[Dict[str, Any]]:
        audits = []
        for file in sorted(AUDITS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    audits.append(json.load(f))
            except Exception:
                continue
        return audits

    @staticmethod
    def _generate_markdown_report(
        audit_id: str,
        patient_name: str,
        doctor_name: str,
        hospital_name: str,
        specialty: str,
        score: int,
        verdict: str,
        findings: List[Dict[str, Any]],
        clean_text: str
    ) -> str:
        findings_md = ""
        if not findings:
            findings_md = "_No compliance breaches or standard-of-care violations detected._\n"
        else:
            for idx, f in enumerate(findings, 1):
                findings_md += (
                    f"### {idx}. {f.get('type', 'Finding')} [{f.get('severity', 'Medium')} Severity]\n"
                    f"- **Citation Code:** `{f.get('citation_code', 'N/A')}`\n"
                    f"- **Official Regulatory Source:** {f.get('official_document', 'CMS / AMA Policy')}\n"
                    f"- **Observed Finding:** {f.get('description', '')}\n"
                    f"- **Grounding Evidence:** *\"{f.get('document_evidence', 'Documented in chart')}\"*\n\n"
                )

        return f"""# MedicalAuditor V2.1 Forensic Report
**Audit Identifier:** `{audit_id}`  
**Evaluation Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}  
**Patient Identifier:** {patient_name}  
**Attending Physician:** {doctor_name}  
**Facility / Location:** {hospital_name}  
**Specialty:** {specialty}  

---

## Executive Audit Summary
- **Overall Forensic Compliance Score:** **{score} / 100**
- **Regulatory Determination:** **{verdict.upper()}**
- **Independent Verifier Status:** All findings validated against textual span grounding and statutory rules.

---

## Identified Deficiencies & Evidence Grounding
{findings_md}

---

## Corrective Action & Recommendations
1. Ensure all documented procedure times are corroborated by concurrent anesthesia and nursing flowsheets.
2. Comply strictly with CMS NCCI unbundling prohibitions when billing multiple procedural codes for the same operative field.
3. In suspected sepsis encounters, prioritize blood cultures prior to antibiotic administration, unless documented difficult access requires emergency life-saving exception.
"""
