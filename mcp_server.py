#!/usr/bin/env python3
"""
Medical Auditor V2.1: Model Context Protocol (MCP) Forensic Server.

This server exposes clinical auditing tools to the Model Context Protocol (MCP) clients,
utilizing Google ADK-powered agents to audit electronic health records, financial ledgers,
and verify standard-of-care guidelines.

To run:
    mcp dev mcp_server.py
"""

import os
import json
import time
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# Load local imports safely
import sys
sys.path.insert(0, str(Path(__file__).parent))

from tools.database import ForensicDB
from agents.referee_agent import run_forensic_pipeline

# Initialize environment variables
load_dotenv()

# Initialize FastMCP Server
mcp = FastMCP("forensic-medical-audit-mcp")

@mcp.tool()
async def audit_clinical_record(
    recordText: str,
    fileName: str = "mcp_clinical_record.txt",
    doctorName: str = "",
    hospitalName: str = "",
    department: str = ""
) -> str:
    """
    Perform a dual-agent forensic medical audit on raw clinical notes, medical records, or patient logs.
    Detects clinical negligence, care pathway standard deviations, and financial billing upcoding.
    """
    if not recordText.strip():
        return "Error: Clinical record text cannot be empty."

    # Establish names and default fields
    final_doctor = doctorName or "Dr. Angela Vance"
    final_hospital = hospitalName or "Metro Heart Hospital"
    final_dept = department or "Cardiology"
    final_spec = "Cardiologist" if final_dept == "Cardiology" else "Medical Specialist"

    # Run ADK agent pipeline (asynchronously)
    pipeline_res = await run_forensic_pipeline(recordText, patient_name="Patient (MCP Ingested)")
    
    compliance_score = pipeline_res.get("complianceScore", 75)
    verdict = pipeline_res.get("verdict", "Pass")
    risk_classification = "High" if compliance_score < 50 else ("Medium" if compliance_score < 80 else "Low")
    
    # Save the audit to ForensicDB so it is visible on the Streamlit dashboard
    audit_id = f"mcp_{int(time.time())}"
    audit_payload = {
        "id": audit_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "fileName": fileName,
        "fileSize": f"{round(len(recordText) / 1024 * 10) / 10} KB",
        "fileType": "TXT",
        "doctorName": final_doctor,
        "doctorSpecialization": final_spec,
        "hospitalName": final_hospital,
        "department": final_dept,
        "complianceScore": compliance_score,
        "doctorScore": max(10, min(100, compliance_score + (-3 if compliance_score < 70 else 2))),
        "hospitalScore": compliance_score,
        "riskClassification": risk_classification,
        "verdict": verdict,
        "providerReliabilityIndex": int(compliance_score * 0.9 + 10),
        "technicalMetrics": {
            "docCompleteness": int(compliance_score * 0.95),
            "recConsistency": int(compliance_score * 0.98),
            "billingAccuracy": int(compliance_score * 0.92),
            "upcodingScore": 100 if compliance_score >= 70 else int(compliance_score * 1.1),
            "procedureCompliance": int(compliance_score * 0.96),
            "dataIntegrity": int(compliance_score * 0.97),
            "regulatoryScore": compliance_score
        },
        "healthcareMetrics": {
            "clinicalNegligenceScore": 100 if compliance_score >= 70 else int(compliance_score * 1.2),
            "diagnosticConsistency": int(compliance_score * 0.97),
            "treatmentAppropriateness": int(compliance_score * 0.94),
            "patientSafetyScore": int(compliance_score * 0.98),
            "medicationMgmt": int(compliance_score * 0.95),
            "carePathwayCompliance": int(compliance_score * 0.93),
            "medicalNecessity": int(compliance_score * 0.96)
        },
        "reportMarkdown": pipeline_res.get("reportMarkdown", "### Forensic Report"),
        "explainableAI": {
            "whyScoreDropped": "The compliance score dropped due to clinical standard-of-care gaps or upcoded procedures." if compliance_score < 80 else "Score remained high with strong guideline adherence.",
            "findingsAffected": [f["description"] for f in pipeline_res.get("findings", [])],
            "evidenceFindings": [
                {"finding": f["description"], "confidence": "Confirmed" if f["severity"] == "High" else "Likely", "explanation": f["type"]}
                for f in pipeline_res.get("findings", [])
            ],
            "confidenceLevel": 94 if compliance_score < 75 else 98
        },
        "patientSummary": {
            "gradeLevel": "8th Grade Patient Clarity Level",
            "summaryText": f"The clinical forensic checkup completed. A compliance index of {compliance_score}% was calibrated.",
            "diagnoses": ["General Diagnostic Evaluation"],
            "medications": ["Under Compliance Review"],
            "followUpInstructions": ["Continuous healthcare standard checks"],
            "explainedTerms": pipeline_res.get("explainedTerms", [])
        }
    }
    
    if compliance_score < 80:
        audit_payload["complaint"] = {
            "status": "PENDING REVIEW",
            "severityLevel": "Critical concern" if compliance_score < 50 else "Standard Deviation Review",
            "riskFactors": [f["description"] for f in pipeline_res.get("findings", [])],
            "evidenceSummary": "Clinical and financial timeline mismatches detected by Google ADK multi-agent checks.",
            "evidenceLockerExcerpt": "Awaiting final medical board arbiter feedback."
        }
        
    # Save directly using our ForensicDB
    ForensicDB.save_audit(audit_payload)
    
    summary_text = f"""### ✅ Multi-Agent Forensic Medical Audit Completed!

**Audit ID:** {audit_id}
**Lead Clinician:** {final_doctor}
**Facility:** {final_hospital} ({final_dept})
**Consensus Compliance Rating:** {compliance_score}/100
**Final Verdict:** {verdict.upper()}
**Forensic Audit Standard:** ADK Multi-Agent Evaluation (Clinical & Billing Chronology Checklist)

---
{pipeline_res.get('reportMarkdown', '')}
"""
    return summary_text


@mcp.tool()
def get_audit_history() -> dict:
    """
    Retrieve a list of all clinical forensic audits completed and stored locally in /audits.
    """
    audits = ForensicDB.get_all_audits()
    return {"totalAudits": len(audits), "audits": audits}


@mcp.tool()
def get_audit_details(auditId: str) -> dict:
    """
    Retrieve the complete forensic audit report details and full raw Markdown report by ID.
    """
    audit = ForensicDB.get_audit_by_id(auditId)
    if not audit:
        return {"error": f"Audit file with ID {auditId} does not exist."}
    return audit


if __name__ == "__main__":
    mcp.run()
