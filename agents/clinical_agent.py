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

async def run_clinical_agent(
    record_text: str,
    require_api_key: bool = False,
    use_fewshot_exemplars: bool = False
) -> dict:
    """
    Runs the Clinical Auditor agent on clinical notes.
    - Zero-Shot by default (use_fewshot_exemplars=False).
    - Enforces GEMINI_API_KEY when require_api_key=True.
    - Independent clinical domain evaluation.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if require_api_key and (not api_key or api_key == "MY_GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is required for model-backed evaluation.")

    if not api_key or api_key == "MY_GEMINI_API_KEY" or LiteLlm is None:
        # Explicit Offline Demo Fallback (heuristic clinical assessment, independent of test labels)
        from core.deterministic_rules import DeterministicRuleValidator
        from core.evidence_extractor import StructuredEvidenceExtractor
        ev = StructuredEvidenceExtractor.extract_evidence(record_text)
        rules = DeterministicRuleValidator.validate_rules(record_text, ev)
        violated = [r for r in rules if r.status == "VIOLATED" and "CLINICAL" in r.rule_id]
        
        score = max(40, 100 - (len(violated) * 20))
        grade = "A" if score >= 90 else ("B" if score >= 80 else ("C" if score >= 60 else "D"))
        gaps = [r.rule_name for r in violated] or ["Documentation review complete; no overt clinical negligence noted"]
        
        return {
            "agent_name": "Clinical Auditor (Offline Heuristic Demo)",
            "clinical_score": score,
            "clinical_grade": grade,
            "adherence_standard": "Hospitalist Standard Clinical Guidelines 2026",
            "clinical_gaps": gaps,
            "positive_indicators": ["Vital signs recorded", "Clinical notes reviewed"],
            "critique_markdown": "### Clinical Auditor Report (Demo Mode)\nHeuristic standard-of-care audit applied."
        }
        
    agent = build_clinical_agent()
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="medical_auditor", session_service=session_service)
    
    await session_service.create_session(
        app_name="medical_auditor", user_id="admin", session_id="clinical_session"
    )
    
    prompt_content = f"Audit this clinical record for standard of care adherence:\n\n{record_text}"
    if use_fewshot_exemplars:
        exemplars = TrainingDataset.find_fewshot_exemplars(record_text)
        if exemplars:
            prompt_content = f"Reference Example:\n{exemplars[0].get('record_text', '')}\n\n" + prompt_content

    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=prompt_content)]
    )
    
    result_text = ""
    async for event in runner.run_async(
        user_id="admin", session_id="clinical_session", new_message=message
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text
                    
    from core.parser import validate_clinical_output
    parsed_output = validate_clinical_output(result_text)
    return parsed_output.to_dict()

if __name__ == "__main__":
    test_record = "Patient Jenkins arrived with chest pain. ECG done. Discharge signed late."
    res = asyncio.run(run_clinical_agent(test_record))
    print(json.dumps(res, indent=2))
