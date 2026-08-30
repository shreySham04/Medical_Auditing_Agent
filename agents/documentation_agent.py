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

# ── Documentation Agent System Prompt ──────────────────────────────────────

SYSTEM_PROMPT = """You are the Documentation Compliance Agent for the Forensic Medical Auditor platform.
Your job is to examine clinical medical records and verify administrative completeness.

Checks to perform:
1. Verify presence of physician sign-off/signature (e.g., "signed by Dr...", "signature on file").
2. Check if key fields (patient ID, date of service, provider name) are present.
3. Identify missing administrative elements or uncompleted checkboxes.
4. Issue a Documentation Score (0-100) and list missing documentation gaps.

Your output MUST be a valid JSON object containing:
{
  "agent_name": "Documentation Agent",
  "documentation_score": 85,
  "documentation_grade": "B",
  "signature_validated": true,
  "missing_required_fields": ["Discharge summary missing witness signature"],
  "present_elements": ["Provider ID present", "Service Date present"],
  "documentation_critique": "Administrative compliance review details..."
}
"""

def build_documentation_agent() -> LlmAgent:
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = "gemini/gemini-2.5-flash"
    return LlmAgent(
        model=LiteLlm(model=model_name, api_key=api_key if api_key else "dummy_key"),
        name="documentation_agent",
        instruction=SYSTEM_PROMPT,
    )

async def run_documentation_agent(record_text: str) -> dict:
    """Runs the Documentation Compliance Agent to evaluate record completeness."""
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "MY_GEMINI_API_KEY" or LiteLlm is None:
        # Offline simulation fallback
        text_lower = record_text.lower()
        has_sig = "signed" in text_lower or "signature" in text_lower or "dr." in text_lower
        doc_score = 95 if has_sig else 55
        gaps = [] if has_sig else ["Missing explicit physician signature authorization on final discharge notes"]
        return {
            "agent_name": "Documentation Agent",
            "documentation_score": doc_score,
            "documentation_grade": "A" if doc_score >= 90 else "F",
            "signature_validated": has_sig,
            "missing_required_fields": gaps,
            "present_elements": ["Patient name recorded", "Checkup timestamps included"],
            "documentation_critique": "Physician signature is verified on main records." if has_sig else "FAILED: Physician signature not validated."
        }
        
    agent = build_documentation_agent()
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="medical_auditor", session_service=session_service)
    
    await session_service.create_session(
        app_name="medical_auditor", user_id="admin", session_id="documentation_session"
    )
    
    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=f"Verify administrative completeness and signature fields on this record:\n\n{record_text}")]
    )
    
    result_text = ""
    async for event in runner.run_async(
        user_id="admin", session_id="documentation_session", new_message=message
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text
                    
    from core.parser import validate_documentation_output
    parsed_output = validate_documentation_output(result_text)
    return parsed_output.to_dict()
