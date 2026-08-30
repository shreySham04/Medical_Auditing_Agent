"""
Referee & Supervisory Agent.
Orchestrates domain agents with Rule Grounding and Expert-Rule Calibration.
"""

import os
import sys
import asyncio
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from orchestration.pipeline import MedicalAuditOrchestrator


async def run_forensic_pipeline(record_text: str, patient_name: str = "Unknown / Not documented") -> dict:
    """
    Main orchestration pipeline empowered by Rule Grounding and Expert-Rule Calibration.

    Architecture:
    - Rule Grounding: Ingests CMS 2026, AHA/ACC, AAOS & AMA CPT official knowledge base.
    - Expert-Rule Calibration: Calibrates scores against clinician advisory consensus to prevent alert fatigue.
    - 5-Step Evidence Chain: Official Document -> Real Retrieval -> Citations -> Finding -> Human Explanation.
    - Produces risk-stratified Audit Recommendations.
    """
    result = await MedicalAuditOrchestrator.audit_patient_record(record_text)
    if patient_name and patient_name != "Unknown / Not documented" and result.get("patientName") in ["Unknown / Not documented", "De-identified Inpatient"]:
        result["patientName"] = patient_name
    return result


if __name__ == "__main__":
    sample_text = "Patient Eleanor Rigby presented to ER with mild dehydration. Doctor visited for 12 minutes. Billed 99291 critical care."
    res = asyncio.run(run_forensic_pipeline(sample_text, "Eleanor Rigby"))
    print("Audit Score:", res.get("complianceScore"))
    print("Audit Recommendation:", res.get("verdict"))
    print("Findings Count:", len(res.get("findings", [])))
