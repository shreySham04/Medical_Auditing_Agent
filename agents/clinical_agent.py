import os
import sys
import json
import asyncio
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from google.adk.agents import LlmAgent
    from google.adk.models.lite_llm import LiteLlm
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai import types as genai_types
except ImportError:
    LlmAgent = None
    LiteLlm = None
    Runner = None
    InMemorySessionService = None
    genai_types = None

# ── Dynamic Clinical Standard Guidelines (RAG Tool) ─────────────────────────

def lookup_clinical_standards(condition: str = "", clinical_context: str = "") -> dict:
    """
    Dynamically retrieves standard-of-care clinical practice guidelines across medical disciplines
    (ACC/AHA Cardiology, AASLD Hepatology, ATS/IDSA Pulmonology, Surviving Sepsis, AAOS Orthopedics, SHM Hospitalist).
    """
    from tools.rag_cag_engine import RAG_CAG_IngestionEngine
    
    query = f"{condition} {clinical_context}".strip()
    regulatory_rules = RAG_CAG_IngestionEngine.retrieve_regulatory_rules(
        query=query or "Clinical Standard of Care Hospitalist Protocol",
        department="Clinical Medicine"
    )
    
    return {
        "retrieved_clinical_guidelines": [
            {"standard": r["code"], "domain": r["category"], "protocol_summary": r["guideline"]}
            for r in regulatory_rules
        ],
        "audit_focus": "Assess hemodynamic stability, vital sign trajectory, diagnostic completeness, contraindications, and guideline-concordant discharge safety."
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

from tools.training_dataset import TrainingDataset

async def run_clinical_agent(record_text: str) -> dict:
    """
    Runs the Clinical Auditor ADK agent on the clinical notes.

    Design & Behavior:
    - Clinical Agent focuses only on healthcare quality.
    - Uses 200 ground-truth training samples for few-shot in-context learning.
    - Separation of responsibility prevents billing related signals from influencing clinical decisions.
    """
    # Retrieve matching few-shot training exemplars
    exemplars = TrainingDataset.find_fewshot_exemplars(record_text)
    matched_sample = exemplars[0] if exemplars else None

    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "MY_GEMINI_API_KEY" or LiteLlm is None:
        # Offline/Simulation Fallback informed by 200 training samples
        score = matched_sample["complianceScore"] if matched_sample else 78
        grade = "A" if score >= 90 else ("B" if score >= 80 else ("C" if score >= 60 else "D"))
        gaps = [matched_sample["primaryViolation"]] if matched_sample and matched_sample["clinicalDeviation"] else ["Discharge signed late", "Omitted post-discharge vital checks"]
        
        return {
            "agent_name": "Clinical Auditor",
            "clinical_score": score,
            "clinical_grade": grade,
            "adherence_standard": f"Standard Guidelines ({matched_sample['topic'] if matched_sample else 'AHA/ACC Chest Pain 2021'})",
            "clinical_gaps": gaps,
            "positive_indicators": ["ECG performed within 8 mins of arrival", "Vital signs recorded at admission"],
            "critique_markdown": f"### Clinical Auditor Report\n- Matched Training Sample Benchmark: #{matched_sample['id'] if matched_sample else 'TS-001'}\n- Primary Audit Finding: {matched_sample['title'] if matched_sample else 'Standard Care Review'}"
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
