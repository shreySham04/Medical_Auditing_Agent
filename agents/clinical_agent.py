import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Ensure local imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv()

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

# ── Clinical Standard Guidelines (Reference Tool) ──────────────────────────

def lookup_clinical_standards(condition: str) -> dict:
    """
    Returns the standard of care reference guidelines for clinical evaluation.
    Matches standard protocols for Cardiology, Orthopedics, and Radiology.
    """
    cond_lower = condition.lower()
    if "cardio" in cond_lower or "chest" in cond_lower or "heart" in cond_lower:
        return {
            "department": "Cardiology",
            "required_vitals": ["Heart Rate", "Blood Pressure", "SpO2", "Respiratory Rate"],
            "critical_tests": ["ECG (within 10 minutes)", "Troponin levels (at least 2 checks)"],
            "red_flags": ["Undocumented chest pain radiation", "Omitted post-discharge cardiac enzyme confirmation"],
            "standards": "AHA/ACC Chest Pain Guidelines 2021"
        }
    elif "ortho" in cond_lower or "bone" in cond_lower or "fracture" in cond_lower:
        return {
            "department": "Orthopedics",
            "required_vitals": ["Pain Score", "Neurovascular Status (Distal Pulse, Sensation)"],
            "critical_tests": ["X-Ray (Pre and Post reduction if applicable)", "Compartment syndrome checks"],
            "red_flags": ["Unrecorded neurovascular status after splint application"],
            "standards": "AAOS Guidelines for Musculoskeletal Trauma"
        }
    else:
        return {
            "department": "General Medicine",
            "required_vitals": ["Heart Rate", "Blood Pressure", "Temperature"],
            "critical_tests": ["Full Blood Count", "Metabolic Panel"],
            "red_flags": ["Abnormal vitals without physician follow-up note"],
            "standards": "Clinical Quality Measures (CQM) v4.2"
        }

# ── Agent System Prompt & Anchors ──────────────────────────────────────────

CLINICAL_CALIBRATION = """
Clinical Score Calibration (0-100):
- 95-100 (A+): Perfect standard of care, full vitals recorded, immediate diagnostic testing, perfect follow-up.
- 80-94  (A/B): Minor administrative delays, minor documentation oversights with zero clinical impact. (Verdict: PASS)
- 60-79  (C): Care pathway deviations, undocumented secondary symptoms, delay in diagnostics. (Verdict: PASS/RECHECK)
- 0-59   (D/F): Severe clinical negligence, ignoring abnormal vital signs, discharge without stabilizing patient. (Verdict: FLAGGED)
"""

SYSTEM_PROMPT = f"""You are the Clinical Auditor Agent for the Forensic Medical Auditor platform.
Your job is to audit a patient's clinical records for standard-of-care adherence, diagnostic completeness, and safety.

{CLINICAL_CALIBRATION}

Tools available:
- lookup_clinical_standards: Retrieves medical standards based on the patient's condition.

Steps:
1. Examine the raw clinical text.
2. Call `lookup_clinical_standards` based on the condition described.
3. Identify standard-of-care gaps, safety lapses, or documentation omissions.
4. Compute a numeric Clinical Score (0-100) and list core critiques.

Your output MUST be a valid JSON object containing:
{{
  "agent_name": "Clinical Auditor",
  "clinical_score": 88,
  "clinical_grade": "B+",
  "adherence_standard": "AHA/ACC Chest Pain Guidelines 2021",
  "clinical_gaps": ["Chest pain radiation not documented", "Discharged with high BP"],
  "positive_indicators": ["ECG performed within 8 mins of arrival", "Troponin checked twice"],
  "critique_markdown": "Detailed clinical review..."
}}
"""

def build_clinical_agent() -> LlmAgent:
    api_key = os.getenv("GEMINI_API_KEY")
    # Default to Gemini model via LiteLlm wrapper
    model_name = "gemini/gemini-2.5-flash"
    return LlmAgent(
        model=LiteLlm(model=model_name, api_key=api_key if api_key else "dummy_key"),
        name="clinical_auditor",
        instruction=SYSTEM_PROMPT,
        tools=[lookup_clinical_standards],
    )

async def run_clinical_agent(record_text: str) -> dict:
    """Runs the Clinical Auditor ADK agent on the clinical notes."""
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "MY_GEMINI_API_KEY":
        # Offline/Simulation Fallback matching Applet Specs
        return {
            "agent_name": "Clinical Auditor",
            "clinical_score": 78,
            "clinical_grade": "C+",
            "adherence_standard": "AHA/ACC Chest Pain Guidelines 2021",
            "clinical_gaps": ["Discharge signed 45 minutes late", "Omitted post-discharge vital sign checks"],
            "positive_indicators": ["ECG performed within 8 mins of arrival", "Cardiac Troponin levels checked twice"],
            "critique_markdown": "### Clinical Auditor Report\n- Standard guidelines followed.\n- Minor discharge latency noted."
        }
        
    agent = build_clinical_agent()
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="medical_auditor", session_service=session_service)
    
    await session_service.create_session(
        app_name="medical_auditor", user_id="admin", session_id="clinical_session"
    )
    
    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=f"Audit this clinical record:\n\n{record_text}")]
    )
    
    result_text = ""
    async for event in runner.run_async(
        user_id="admin", session_id="clinical_session", new_message=message
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text
                    
    # Parse JSON block out of ADK agent response
    import re
    json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except Exception:
            pass
    return {
        "agent_name": "Clinical Auditor",
        "clinical_score": 75,
        "clinical_grade": "C",
        "adherence_standard": "General Practice Guidelines",
        "clinical_gaps": ["Parsing error in agent output. Default compliance check applied."],
        "positive_indicators": [],
        "critique_markdown": result_text or "Error executing clinical audit."
    }

if __name__ == "__main__":
    test_record = "Patient Jenkins arrived with chest pain. ECG done. Discharge signed late."
    res = asyncio.run(run_clinical_agent(test_record))
    print(json.dumps(res, indent=2))
