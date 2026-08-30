"""
Multi-Agent Orchestration Pipeline.
Executes the comprehensive automated verification and evidence grounding audit workflow:
1. Adversarial Robustness & Prompt Injection Scan
2. Structured Clinical Evidence Extraction
3. Insufficient Evidence / Truncated Chart Detection
4. Real Source-Backed Regulatory Document Retrieval
5. Deterministic Rule Validation (Zero-Hallucination Constraints)
6. Multi-Agent Domain Inferences (Clinical, Billing, Documentation, Timeline)
7. Cross-Agent Disagreement & Consensus Detection
8. Independent Verifier 2nd-Stage Grounding Pass
9. Human-Feedback Calibration & Score Synthesis
10. Cryptographic SHA-256 Audit Trace Manifest Generation
"""

import os
import sys
import asyncio
from pathlib import Path
from typing import Dict, Any, List

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from core.schemas import (
    EvidenceFinding,
    DeterministicRuleCheck,
    CrossAgentDisagreement,
    VerifierPassFinding,
    PromptInjectionScanResult,
    AuditTraceManifest,
    StructuredClinicalEvidence
)
from core.config import REGULATORY_KB_VERSION, PROJECT_FRAMEWORK_TIER
from core.calibration import ExpertRuleCalibrator
from core.evidence_extractor import StructuredEvidenceExtractor
from core.deterministic_rules import DeterministicRuleValidator
from core.disagreement_detector import CrossAgentDisagreementDetector
from core.verifier import IndependentVerifierPass
from core.adversarial import PromptInjectionDefender
from core.trace import CryptographicAuditTraceEngine
from core.insufficient_evidence import InsufficientEvidenceAssessor
from retrieval.rule_grounding import RuleGroundingEngine

from agents.clinical_agent import run_clinical_agent
from agents.billing_agent import run_billing_agent
from agents.documentation_agent import run_documentation_agent
from agents.timeline_agent import run_timeline_agent
from agents.document_agent import run_document_agent


class MedicalAuditOrchestrator:
    """
    Supervises multi-agent execution, evidence citation binding,
    independent verifier pass, deterministic rules, and audit trace generation.
    """

    @classmethod
    async def audit_patient_record(cls, record_text: str, department_hint: str = "", case_id: str = "") -> Dict[str, Any]:
        cid = case_id or f"CASE-{hash(record_text) % 100000:05d}"
        
        # STEP 1: Adversarial Robustness & Prompt Injection Scan
        clean_text, injection_scan = PromptInjectionDefender.scan_and_defend(record_text)

        # STEP 2: Structured Evidence & Fact Extraction
        structured_evidence = StructuredEvidenceExtractor.extract_evidence(clean_text)

        # STEP 3: Insufficient Evidence & Truncated Record Assessment
        is_insufficient, missing_elements, insuff_details = InsufficientEvidenceAssessor.evaluate_sufficiency(
            clean_text, structured_evidence
        )

        # Ingestion metadata
        doc_parsed = await run_document_agent(clean_text)
        patient_name = structured_evidence.patient_name if structured_evidence.patient_name != "Unknown / Not documented" else (doc_parsed.get("patient_name") or "Unknown / Not documented")
        doctor_name = structured_evidence.doctor_name if structured_evidence.doctor_name != "Unknown / Not documented" else (doc_parsed.get("doctor_name") or "Unknown / Not documented")
        hospital_name = structured_evidence.hospital_name if structured_evidence.hospital_name != "Unknown / Not documented" else (doc_parsed.get("hospital_name") or "Unknown / Not documented")
        department = department_hint if department_hint != "Unknown / Not documented" else (doc_parsed.get("department") or "Unknown / Not documented")

        # If chart is truncated or lacks minimum clinical evidence, produce explicit INSUFFICIENT_EVIDENCE verdict
        if is_insufficient:
            trace_manifest = CryptographicAuditTraceEngine.generate_trace_manifest(
                case_id=cid,
                input_text=record_text,
                structured_evidence=structured_evidence.to_dict(),
                deterministic_rules=[],
                agent_results={},
                verifier_results=[],
                final_verdict="INSUFFICIENT_EVIDENCE",
                final_score=0
            )

            report_md = cls._generate_insufficient_evidence_report(
                patient_name=patient_name,
                doctor_name=doctor_name,
                hospital_name=hospital_name,
                department=department,
                missing_elements=missing_elements,
                insuff_details=insuff_details,
                trace_manifest=trace_manifest
            )

            return {
                "id": cid,
                "case_id": cid,
                "patientName": patient_name,
                "doctorName": doctor_name,
                "hospitalName": hospital_name,
                "department": department,
                "complianceScore": 0,
                "primaryScore": 0,
                "rawScore": 0,
                "verdict": "INSUFFICIENT_EVIDENCE",
                "riskClassification": "CRITICAL_DEFICIENCY",
                "clinicalScore": 0,
                "billingScore": 0,
                "documentationScore": 0,
                "timelineScore": 0,
                "consensusIndex": 100.0,
                "is_insufficient_evidence": True,
                "missing_prerequisites": missing_elements,
                "required_actions": insuff_details.get("required_actions", []),
                "findings": [
                    {
                        "id": "EV-INSUFF-01",
                        "type": "Record Completeness Gap",
                        "description": f"Insufficient clinical text to conduct compliance audit: {'; '.join(missing_elements)}",
                        "severity": "Critical",
                        "official_document": "Federal Conditions of Participation 42 CFR §482.24(c)",
                        "citation_code": "CFR-42-482.24-CHART-INTEGRITY",
                        "official_citation_text": "The medical record must contain information to justify admission and continued hospitalization, support the diagnosis, and describe the patient's progress and response to medications and services.",
                        "document_evidence": f"Ingested text length: {len(clean_text)} characters.",
                        "human_readable_explanation": "Mauditor requires complete clinical notes and objective flowsheets to render safe compliance determinations.",
                        "verification_status": "UPHELD_DETERMINISTIC"
                    }
                ],
                "deterministic_rules": [],
                "cross_agent_disagreements": [],
                "verifier_pass_logs": [],
                "prompt_injection_scan": injection_scan.to_dict(),
                "structured_evidence": structured_evidence.to_dict(),
                "trace_manifest": trace_manifest.to_dict(),
                "reportMarkdown": report_md
            }

        # STEP 4: Real Regulatory Retrieval & Source Grounding
        grounded_rules = RuleGroundingEngine.retrieve_grounded_rules(
            query=f"{department} {clean_text[:250]}",
            department=department,
            limit=4
        )

        # STEP 5: Deterministic Rule Validation (Zero-Hallucination Hard Constraints)
        deterministic_checks = DeterministicRuleValidator.validate_rules(clean_text, structured_evidence)

        # STEP 6: Multi-Agent Parallel Domain Execution
        clinical_task = run_clinical_agent(clean_text)
        billing_task = run_billing_agent(clean_text)
        doc_task = run_documentation_agent(clean_text)
        timeline_task = run_timeline_agent(clean_text)

        clinical_res, billing_res, doc_res, timeline_res = await asyncio.gather(
            clinical_task, billing_task, doc_task, timeline_task
        )

        # Apply deterministic rule penalties to agent baseline scores
        det_penalty = sum(r.penalty_score for r in deterministic_checks if r.status == "VIOLATED")
        
        c_score = max(10, clinical_res.get("clinical_score", 85) - (det_penalty // 2 if any(r.rule_id in ["RULE-DET-02", "RULE-DET-04"] and r.status == "VIOLATED" for r in deterministic_checks) else 0))
        b_score = max(10, billing_res.get("billing_score", 85) - (det_penalty if any(r.rule_id in ["RULE-DET-01", "RULE-DET-03"] and r.status == "VIOLATED" for r in deterministic_checks) else 0))
        d_score = max(10, doc_res.get("documentation_score", 90) - (det_penalty // 2 if any(r.rule_id in ["RULE-DET-05"] and r.status == "VIOLATED" for r in deterministic_checks) else 0))
        t_score = max(10, timeline_res.get("timeline_score", 90))

        # STEP 7: Cross-Agent Disagreement & Consensus Detection
        consensus_index, disagreements = CrossAgentDisagreementDetector.evaluate_consensus(
            clinical=clinical_res,
            billing=billing_res,
            documentation=doc_res,
            timeline=timeline_res,
            raw_text=clean_text
        )

        # STEP 8: Construct 5-Step Evidence Findings
        candidate_findings: List[Dict[str, Any]] = []

        # Add deterministic violations as primary findings
        for r in deterministic_checks:
            if r.status == "VIOLATED":
                candidate_findings.append({
                    "id": f"EV-DET-{r.rule_id.split('-')[-1]}",
                    "type": "Deterministic Regulatory Violation",
                    "description": f"{r.rule_name}: {r.observed_fact}",
                    "severity": r.severity,
                    "official_document": r.authority,
                    "citation_code": r.citation_code,
                    "official_citation_text": r.expected_constraint,
                    "document_evidence": r.observed_fact,
                    "human_readable_explanation": f"Automated deterministic constraint check failed: {r.expected_constraint}",
                    "is_suppressed_by_calibration": False,
                    "deterministic_rule_id": r.rule_id,
                    "verification_status": "UPHELD_DETERMINISTIC"
                })

        # Add clinical gaps
        for idx, gap in enumerate(clinical_res.get("clinical_gaps", [])):
            ev_finding = RuleGroundingEngine.build_evidence_finding(
                finding_id=f"EV-CLIN-{idx+1:02d}",
                finding_type="Clinical Guideline Deviation",
                description=gap,
                severity="High" if any(k in gap.lower() for k in ["discharg", "vital", "negligen", "perforat", "arrest"]) else "Medium",
                document_evidence=f"Clinical note excerpt: '{gap}'",
                department=department
            )
            candidate_findings.append(ev_finding.to_dict())

        # Add billing anomalies
        for idx, anom in enumerate(billing_res.get("billing_anomalies", [])):
            ev_finding = RuleGroundingEngine.build_evidence_finding(
                finding_id=f"EV-BILL-{idx+1:02d}",
                finding_type="Billing Inflation / Upcoding",
                description=anom,
                severity="High" if any(k in anom.lower() for k in ["upcode", "fraud", "99291", "unbundle"]) else "Medium",
                document_evidence=f"Financial ledger entry: '{anom}'",
                department=department
            )
            candidate_findings.append(ev_finding.to_dict())

        # Add documentation gaps
        for idx, miss in enumerate(doc_res.get("missing_required_fields", [])):
            ev_finding = RuleGroundingEngine.build_evidence_finding(
                finding_id=f"EV-DOC-{idx+1:02d}",
                finding_type="Record Completeness Gap",
                description=miss,
                severity="Medium",
                document_evidence=f"Chart administrative review: '{miss}'",
                department=department
            )
            candidate_findings.append(ev_finding.to_dict())

        # Add timeline inconsistencies
        for idx, inc in enumerate(timeline_res.get("timeline_inconsistencies", [])):
            ev_finding = RuleGroundingEngine.build_evidence_finding(
                finding_id=f"EV-TIME-{idx+1:02d}",
                finding_type="Temporal Inconsistency",
                description=inc,
                severity="High" if any(k in inc.lower() for k in ["velocity", "time-travel", "minutes"]) else "Medium",
                document_evidence=f"Reconstructed timeline disparity: '{inc}'",
                department=department
            )
            candidate_findings.append(ev_finding.to_dict())

        # Default clean finding if no issues
        if not candidate_findings:
            clean_finding = RuleGroundingEngine.build_evidence_finding(
                finding_id="EV-SAFE-01",
                finding_type="Standard of Care Confirmed",
                description="All clinical treatment milestones and billing codes are substantiated by official practice guidelines.",
                severity="Low",
                document_evidence="Full patient chart audit completed with zero non-compliant deviations.",
                department=department
            )
            candidate_findings.append(clean_finding.to_dict())

        # STEP 9: Independent Verifier 2nd-Stage Pass
        verifier_logs, verified_findings = IndependentVerifierPass.verify_findings(
            findings=candidate_findings,
            source_text=clean_text,
            department=department
        )

        # STEP 10: Expert-Rule Calibration & Score Synthesis
        calibration_result = ExpertRuleCalibrator.calibrate_scores(
            clinical_score=c_score,
            billing_score=b_score,
            doc_score=d_score,
            timeline_score=t_score,
            findings=verified_findings,
            department=department
        )

        calibrated_score = calibration_result["calibrated_score"]
        raw_weighted_score = calibration_result["raw_weighted_score"]
        verdict = calibration_result["audit_recommendation"]
        risk = calibration_result["risk_classification"]
        calibrated_findings = calibration_result["calibrated_findings"]
        suppressed_findings = calibration_result["suppressed_findings"]

        # If any Critical deterministic rule was violated, ensure score reflects failure
        has_critical_violation = any(r.status == "VIOLATED" and r.severity in ["High", "Critical"] for r in deterministic_checks)
        if has_critical_violation and calibrated_score > 65:
            calibrated_score = min(60, calibrated_score)
            verdict = "Failed"
            risk = "CRITICAL_DEFICIENCY"

        # STEP 11: Cryptographic Audit Trace Generation
        trace_manifest = CryptographicAuditTraceEngine.generate_trace_manifest(
            case_id=cid,
            input_text=record_text,
            structured_evidence=structured_evidence.to_dict(),
            deterministic_rules=[r.to_dict() for r in deterministic_checks],
            agent_results={
                "clinical": clinical_res,
                "billing": billing_res,
                "documentation": doc_res,
                "timeline": timeline_res
            },
            verifier_results=[v.to_dict() for v in verifier_logs],
            final_verdict=verdict,
            final_score=calibrated_score
        )

        # Generate Comprehensive Markdown Forensic Report
        report_md = cls._generate_full_markdown_report(
            patient_name=patient_name,
            doctor_name=doctor_name,
            hospital_name=hospital_name,
            department=department,
            calibrated_score=calibrated_score,
            verdict=verdict,
            risk=risk,
            consensus_index=consensus_index,
            grounded_rules=grounded_rules,
            deterministic_checks=deterministic_checks,
            disagreements=disagreements,
            verifier_logs=verifier_logs,
            calibrated_findings=calibrated_findings,
            suppressed_findings=suppressed_findings,
            injection_scan=injection_scan,
            trace_manifest=trace_manifest,
            clinical_res=clinical_res,
            billing_res=billing_res,
            doc_res=doc_res,
            timeline_res=timeline_res
        )

        return {
            "id": cid,
            "case_id": cid,
            "patientName": patient_name,
            "doctorName": doctor_name,
            "hospitalName": hospital_name,
            "department": department,
            "complianceScore": calibrated_score,
            "primaryScore": calibrated_score,
            "rawScore": raw_weighted_score,
            "verdict": verdict,
            "riskClassification": risk,
            "consensusIndex": consensus_index,
            "clinicalScore": c_score,
            "billingScore": b_score,
            "documentationScore": d_score,
            "timelineScore": t_score,
            "findings": calibrated_findings,
            "suppressed_false_positives": suppressed_findings,
            "deterministic_rules": [r.to_dict() for r in deterministic_checks],
            "cross_agent_disagreements": [d.to_dict() for d in disagreements],
            "verifier_pass_logs": [v.to_dict() for v in verifier_logs],
            "prompt_injection_scan": injection_scan.to_dict(),
            "structured_evidence": structured_evidence.to_dict(),
            "trace_manifest": trace_manifest.to_dict(),
            "reconstructed_timeline": timeline_res.get("reconstructed_timeline", []),
            "reportMarkdown": report_md,
            "explainedTerms": [
                {"term": "Deterministic Rule Engine", "definition": "Mathematically reproducible statutory constraints (e.g., CPT 99291 time bounds) evaluated without LLM hallucination."},
                {"term": "Independent Verifier Pass", "definition": "Second-stage auditor validating that all cited excerpts exist in patient chart before penalties are levied."},
                {"term": "Cross-Agent Consensus", "definition": "Quantified agreement metric between Clinical, Billing, Documentation, and Timeline auditors."},
                {"term": "Cryptographic Audit Trace", "definition": "SHA-256 hashed verifiable bundle guaranteeing 100% audit reproducibility."}
            ]
        }

    @classmethod
    def _generate_insufficient_evidence_report(
        cls,
        patient_name: str,
        doctor_name: str,
        hospital_name: str,
        department: str,
        missing_elements: List[str],
        insuff_details: Dict[str, Any],
        trace_manifest: AuditTraceManifest
    ) -> str:
        missing_bullets = "\n".join([f"- ⚠️ **Missing Prerequisite:** {m}" for m in missing_elements])
        actions_bullets = "\n".join([f"1. {a}" for a in insuff_details.get("required_actions", [])])

        return f"""# 🛡️ Medical Auditor — Audit Verdict: INSUFFICIENT EVIDENCE
**Facility:** {hospital_name} | **Department:** {department} | **Lead Physician:** {doctor_name}
**Patient:** {patient_name}
**Audit Score:** N/A (0/100) — **INSUFFICIENT EVIDENCE**
**Reproducibility Token:** `{trace_manifest.reproducibility_token}`

---

### 🚫 Clinical Audit Prerequisite Check Failed
The submitted document does not contain sufficient clinical narrative, objective vitals, or itemized billing context to conduct an ethical, evidence-grounded audit.

#### Identified Missing Elements:
{missing_bullets}

#### Required Remediation Steps:
{actions_bullets}

---
*Audit halted safely by Mauditor Automated Verification Pipeline to prevent hallucinated compliance scores.*
"""

    @classmethod
    def _generate_full_markdown_report(
        cls,
        patient_name: str,
        doctor_name: str,
        hospital_name: str,
        department: str,
        calibrated_score: int,
        verdict: str,
        risk: str,
        consensus_index: float,
        grounded_rules: List[Dict[str, Any]],
        deterministic_checks: List[DeterministicRuleCheck],
        disagreements: List[CrossAgentDisagreement],
        verifier_logs: List[VerifierPassFinding],
        calibrated_findings: List[Dict[str, Any]],
        suppressed_findings: List[Dict[str, Any]],
        injection_scan: PromptInjectionScanResult,
        trace_manifest: AuditTraceManifest,
        clinical_res: Dict[str, Any],
        billing_res: Dict[str, Any],
        doc_res: Dict[str, Any],
        timeline_res: Dict[str, Any]
    ) -> str:
        rules_text = "\n".join([
            f"- **{r['citation_code']}** ({r['issuing_body']}): *\"{r['official_quote']}\"*"
            for r in grounded_rules
        ]) if grounded_rules else "- *Standard CMS / AMA 2026 practice rules indexed.*"

        det_text = "\n".join([
            f"- `[{d.status}]` **{d.rule_name}** ({d.citation_code}): {d.observed_fact} *(Penalty: -{d.penalty_score} pts)*"
            for d in deterministic_checks
        ]) if deterministic_checks else "- *All deterministic constraint checks passed.*"

        disagree_text = "\n".join([
            f"- **{d.topic}** ({', '.join(d.agents_involved)}): {d.severity_disparity}\n  *Resolution:* {d.resolution_applied}"
            for d in disagreements
        ]) if disagreements else "- *High inter-agent consensus established (no major cross-agent contradictions).* "

        verifier_text = "\n".join([
            f"- `[{v.verification_status}]` **{v.finding_id}**: {v.verification_notes} *(Grounding Confidence: {int(v.grounding_confidence * 100)}%)*"
            for v in verifier_logs
        ]) if verifier_logs else "- *All candidate findings corroborated by 2nd-stage verifier pass.*"

        findings_text = "\n".join([
            f"#### [{f.get('id', 'EV-01')}] {f.get('type')} — Severity: {f.get('severity', 'Medium')}\n"
            f"- **Official Standard:** {f.get('official_document')} (`{f.get('citation_code')}`)\n"
            f"- **Official Quote:** *\"{f.get('official_citation_text', '')}\"*\n"
            f"- **Document Evidence:** {f.get('document_evidence', '')}\n"
            f"- **Explanation:** {f.get('human_readable_explanation', '')}\n"
            f"- **Verifier Status:** `{f.get('verification_status', 'VERIFIED')}`\n"
            for f in calibrated_findings
        ])

        return f"""# 🛡️ Medical Auditor — Forensic Compliance Audit Report
**Facility:** {hospital_name} | **Department:** {department} | **Lead Physician:** {doctor_name}
**Patient:** {patient_name}
**Audit Score:** {calibrated_score}/100 (**{verdict}**)
**Risk Classification:** {risk}
**Inter-Agent Consensus Index:** {consensus_index}%
**Cryptographic Token:** `{trace_manifest.reproducibility_token}`
**SHA-256 Bundle Hash:** `{trace_manifest.sha256_bundle_hash}`

---

### 1️⃣ Adversarial Robustness & Prompt Injection Scan
- **Status:** `{'⚠️ THREAT NEUTRALIZED' if injection_scan.is_injection_detected else '✅ CLEAN / SAFE'}` (Risk Level: `{injection_scan.risk_level}`)
- **Defense Rationale:** {injection_scan.injection_defense_rationale}

---

### 2️⃣ Deterministic Rule Validation (Zero-Hallucination Constraints)
{det_text}

---

### 3️⃣ Real Regulatory Retrieval & Source Grounding
- **Knowledge Base Version:** {REGULATORY_KB_VERSION}
{rules_text}

---

### 4️⃣ Cross-Agent Disagreement & Consensus
- **Consensus Score:** {consensus_index}%
{disagree_text}

---

### 5️⃣ Independent Verifier 2nd-Stage Pass
{verifier_text}

---

### 6️⃣ Verified 5-Step Evidence Findings
{findings_text}

---

### 7️⃣ Reproducible Cryptographic Execution DAG
- **Trace ID:** `{trace_manifest.trace_id}`
- **Execution Timestamp:** `{trace_manifest.timestamp}`
- **Total Pipeline Execution Steps:** {len(trace_manifest.execution_steps)} verified stages
"""
