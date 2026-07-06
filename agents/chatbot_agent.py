import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Ensure local imports work
sys.path.insert(0, str(Path(__file__).parent.parent))
load_dotenv()

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from tools.database import ForensicDB

# --- CHATBOT TOOLS FOR ADK ---

def list_stored_audits() -> str:
    """
    Look up all completed forensic clinical and billing audits in the database.
    Returns a summarized list of patient names, case IDs, scores, and verdicts.
    """
    audits = ForensicDB.get_all_audits()
    if not audits:
        return "No audits found in the database registry."
    
    summary_lines = []
    for a in audits:
        summary_lines.append(
            f"- Case ID: {a['id']} | Patient: {a.get('patientName', 'Unknown')} | "
            f"Doctor: {a.get('doctorName', 'Unknown')} | Score: {a.get('complianceScore', 0)}/100 | "
            f"Verdict: {a.get('verdict', 'Unknown')}"
        )
    return "\n".join(summary_lines)


def retrieve_audit_detail_by_id(case_id: str) -> str:
    """
    Look up detailed forensic logs and findings for a specific audit Case ID.
    """
    audit = ForensicDB.get_audit_by_id(case_id)
    if not audit:
        return f"Could not find an audit with Case ID: {case_id}"
    
    return json.dumps({
        "id": audit["id"],
        "patientName": audit.get("patientName"),
        "doctorName": audit.get("doctorName"),
        "complianceScore": audit.get("complianceScore"),
        "verdict": audit.get("verdict"),
        "riskClassification": audit.get("riskClassification"),
        "reconstructed_timeline": audit.get("reconstructed_timeline", []),
        "explainableAI": audit.get("explainableAI", {}),
        "reportMarkdownSummary": audit.get("reportMarkdown", "")[:1200] + "..."
    }, indent=2)


# --- AGENT SYSTEM PROMPT ---

SYSTEM_PROMPT = """You are 'MAuditor Companion', the expert Forensic Medical Auditor AI assistant.
Your job is to assist healthcare compliance officers, medical directors, and billing arbiters.

Capabilities:
1. Explain healthcare billing fraud, upcoding (e.g. CPT 99291 unbundling), and clinical negligence.
2. Answer questions about standard-of-care guidelines (AHA Cardiology, AAOS Orthopedics, etc.).
3. Assist in searching and interpreting completed audits in the database.
4. Provide recommendations on remediation and clinic compliance.

Tools available:
- list_stored_audits: Lists all case audits with IDs, scores, and patient/doctor names.
- retrieve_audit_detail_by_id: Retrieves the timeline, score deductions, and report for a specific Case ID.

Tone: Professional, clinical, precise, and supportive. Always cite specific findings or medical guidelines when explaining scores.
"""

def build_chatbot_agent() -> LlmAgent:
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = "gemini/gemini-2.5-flash"
    return LlmAgent(
        model=LiteLlm(model=model_name, api_key=api_key if api_key else "dummy_key"),
        name="mauditor_companion",
        instruction=SYSTEM_PROMPT,
        tools=[list_stored_audits, retrieve_audit_detail_by_id]
    )


async def run_chatbot_session(user_message: str, chat_history_list: list) -> str:
    """
    Runs the Chatbot Agent to process conversation, maintaining context of past messages.
    
    Design & Behavior:
    - MCP tools or dashboard chat can request info.
    - Uses Google ADK tools to fetch case data directly from database dynamically.
    - Fallback is applied if the Gemini key is not configured.
    """
    # 1. Offline fallback mode
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "MY_GEMINI_API_KEY":
        msg_lower = user_message.lower()
        
        # If user asks to list audits
        if "list" in msg_lower or "audits" in msg_lower or "history" in msg_lower:
            audits_list = list_stored_audits()
            return f"### 📊 Clinical Database Query\nI scanned the ForensicDB registry for you:\n\n{audits_list}"
            
        # If user asks about a specific audit ID
        id_match = re_find_id(user_message)
        if id_match:
            detail = retrieve_audit_detail_by_id(id_match)
            return f"### 📑 Case Audit Details for #{id_match}\nHere is the forensic summary extracted:\n```json\n{detail}\n```"
            
        # General response simulation
        return (
            f"Hello! I am running in **Simulation/Offline Mode** as no valid `GEMINI_API_KEY` was detected.\n\n"
            f"I can still help you structure checklists, look up typical CPT codes (like 99291 for critical care or 99203 for general evaluations), "
            f"or query the ForensicDB cases. What would you like me to look up?"
        )
        
    # 2. Live Agent Run
    agent = build_chatbot_agent()
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="medical_auditor", session_service=session_service)
    
    session_id = "chatbot_user_session"
    await session_service.create_session(
        app_name="medical_auditor", user_id="admin", session_id=session_id
    )
    
    # Push history to session
    for h in chat_history_list:
        role = "user" if h["role"] == "user" else "model"
        await session_service.add_message(
            app_name="medical_auditor",
            user_id="admin",
            session_id=session_id,
            message=genai_types.Content(
                role=role,
                parts=[genai_types.Part(text=h["content"])]
            )
        )
        
    # Run user message
    new_msg = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=user_message)]
    )
    
    result_text = ""
    async for event in runner.run_async(
        user_id="admin", session_id=session_id, new_message=new_msg
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text
                    
    return result_text or "I apologize, I could not formulate a response. Please check your credentials."


def re_find_id(text: str) -> str:
    import re
    match = re.search(r'(?:audit_\d+|mcp_\d+)', text, re.IGNORECASE)
    if match:
        return match.group(0)
    return None
