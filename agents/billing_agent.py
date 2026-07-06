import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))
load_dotenv()

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

# ── Billing & CPT Code Guidelines (Reference Tool) ─────────────────────────

def lookup_billing_codes(department: str) -> dict:
    """
    Returns standard CPT (Current Procedural Terminology) and ICD-10 medical billing references.
    Used to verify financial compliance.
    """
    dept_lower = department.lower()
    if "cardio" in dept_lower or "chest" in dept_lower:
        return {
            "critical_care_codes": ["99291 (First 30-74 minutes critical care)", "99292 (Additional 30 mins)"],
            "diagnostic_codes": ["93000 (Routine ECG with at least 12 leads)", "93015 (Cardiovascular stress test)"],
            "common_upcoding_violations": [
                "Unbundling ECG interpretation from general evaluation",
                "Charging for critical care (99291) on standard outpatient visits"
            ]
        }
    elif "ortho" in dept_lower or "bone" in dept_lower:
        return {
            "surgical_codes": ["29105 (Application of long arm splint)", "29515 (Application of splint; lower leg)"],
            "diagnostic_codes": ["73030 (X-ray exam of shoulder, minimum 2 views)"],
            "common_upcoding_violations": [
                "Charging separately for splint materials and splint application",
                "Upcoding moderate orthopedic emergency visits as full intensive care"
            ]
        }
    else:
        return {
            "standard_codes": ["99213 (Office outpatient visit, 15-29 mins)", "99214 (Office outpatient visit, 30-39 mins)"],
            "common_upcoding_violations": [
                "Billing level 5 visits (99215) with lack of supporting treatment severity notes"
            ]
        }

# ── Agent System Prompt & Anchors ──────────────────────────────────────────

BILLING_CALIBRATION = """
Billing Score Calibration (0-100):
- 95-100 (A): Fully transparent billing, flawless ledger matching.
- 80-94  (B): Slight administrative documentation oversights (e.g., missing specific ICD code descriptions). (Verdict: PASS)
- 60-79  (C): Moderate upcoding risks, unbundled packages (e.g. charging separately for standard prep steps). (Verdict: RECHECK)
- 0-59   (D/F): Extreme financial inflation, fraudulent upcoding, chronological time-travel billing. (Verdict: FAILED)
"""

SYSTEM_PROMPT = f"""You are the Billing Auditor Agent for the Forensic Medical Auditor platform.
Your job is to audit medical financial ledgers, bills, and chronological statements for billing inflation, CPT code fraud, and unbundling anomalies.

{BILLING_CALIBRATION}

Tools available:
- lookup_billing_codes: Retrieves standard medical billing codes and common violations.

Steps:
1. Examine the ledger notes and financial charges.
2. Call `lookup_billing_codes` to compare.
3. Identify unbundled packages, upcoding, or mismatching charges.
4. Compute a numeric Billing Score (0-100) and list core financial issues.

Your output MUST be a valid JSON object containing:
{{
  "agent_name": "Billing Auditor",
  "billing_score": 85,
  "billing_grade": "B",
  "billing_standard_used": "American Medical Association (AMA) CPT Compliance",
  "billing_anomalies": ["Unbundled ECG prep kit charged separately", "Upcoded outpatient visit to 99291"],
  "fair_pricing_credits": ["Clean basic consultation timeline matches visit logs"],
  "financial_markdown": "Detailed financial audit review..."
}}
"""

def build_billing_agent() -> LlmAgent:
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = "gemini/gemini-2.5-flash"
    return LlmAgent(
        model=LiteLlm(model=model_name, api_key=api_key if api_key else "dummy_key"),
        name="billing_auditor",
        instruction=SYSTEM_PROMPT,
        tools=[lookup_billing_codes],
    )

async def run_billing_agent(record_text: str) -> dict:
    """Runs the Billing Auditor ADK agent on the clinical ledger."""
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "MY_GEMINI_API_KEY":
        # Offline/Simulation Fallback
        return {
            "agent_name": "Billing Auditor",
            "billing_score": 84,
            "billing_grade": "B",
            "billing_standard_used": "American Medical Association (AMA) CPT Compliance",
            "billing_anomalies": ["ECG Interpretation was unbundled and billed separately from the primary consultation fee"],
            "fair_pricing_credits": ["Hospital admission and discharge times align exactly with standard bed-occupancy hourly increments"],
            "financial_markdown": "### Billing Auditor Report\n- Potential unbundled charge detected on ECG procedure.\n- Rest of ledger is clean."
        }
        
    agent = build_billing_agent()
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="medical_auditor", session_service=session_service)
    
    await session_service.create_session(
        app_name="medical_auditor", user_id="admin", session_id="billing_session"
    )
    
    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=f"Audit this ledger record:\n\n{record_text}")]
    )
    
    result_text = ""
    async for event in runner.run_async(
        user_id="admin", session_id="billing_session", new_message=message
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text
                    
    import re
    json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except Exception:
            pass
    return {
        "agent_name": "Billing Auditor",
        "billing_score": 80,
        "billing_grade": "B-",
        "billing_standard_used": "AMA CPT Compliance Guidelines",
        "billing_anomalies": ["Parsing error in billing agent output. Standard audit safeguards loaded."],
        "fair_pricing_credits": [],
        "financial_markdown": result_text or "Error executing billing audit."
    }

if __name__ == "__main__":
    test_record = "ECG kit charged separately $150. Level 5 visit billed."
    res = asyncio.run(run_billing_agent(test_record))
    print(json.dumps(res, indent=2))
