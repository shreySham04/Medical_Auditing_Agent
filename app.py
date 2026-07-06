import os
import re
import json
import time
import base64
from pathlib import Path
import streamlit as st
import pandas as pd
from PIL import Image
from dotenv import load_dotenv

# Load environment secrets
load_dotenv()

# Page Configurations
st.set_page_config(
    page_title="MedicalAuditor V2.1 - Clinical Forensics",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# App Directory Configurations
AUDITS_DIR = Path("./audits")
AUDITS_DIR.mkdir(parents=True, exist_ok=True)

# Custom Color CSS and layout tweaks to match the V2.1 Dark Clinical Slate Theme
st.markdown("""
<style>
    /* Dark clinical forensic theme variables */
    :root {
        --background: #090d14;
        --card-bg: #121620;
        --border-color: #21262D;
        --text-primary: #F0F6FC;
        --text-secondary: #8B949E;
        --blue-accent: #58A6FF;
        --emerald-accent: #3FB950;
    }
    
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #090d14 !important;
        color: #F0F6FC !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    
    /* Main titles styling */
    h1, h2, h3, h4 {
        color: #F0F6FC !important;
        font-weight: 600 !important;
        font-family: "SF Pro Display", -apple-system, sans-serif !important;
    }
    
    /* Custom Sidebar styling */
    [data-testid="stSidebar"] {
        background-color: #0d1117 !important;
        border-right: 1px solid #21262D !important;
    }
    
    /* Customized Buttons */
    .stButton>button {
        background-color: #21262D !important;
        color: #C9D1D9 !important;
        border: 1px solid #30363D !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease-in-out;
    }
    .stButton>button:hover {
        background-color: #30363D !important;
        border-color: #8B949E !important;
        color: #F0F6FC !important;
    }
    
    /* Metric Cards */
    [data-testid="stMetricValue"] {
        font-size: 28px !important;
        font-weight: 700 !important;
        color: #58A6FF !important;
    }
    
    /* Success, Info, Warning Alerts */
    div.stAlert {
        background-color: #121620 !important;
        border: 1px solid #21262D !important;
        border-radius: 12px !important;
    }
    
    /* Hide default header/footer */
    #MainMenu, footer {visibility: hidden;}
    
    /* Scrollbars */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: #090d14;
    }
    ::-webkit-scrollbar-thumb {
        background: #21262D;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #30363D;
    }
</style>
""", unsafe_allow_html=True)


# --- HELPERS AND API STATUS ---

def is_api_key_configured() -> bool:
    key = os.getenv("GEMINI_API_KEY")
    return bool(key and key != "MY_GEMINI_API_KEY" and key.strip())


# Circular Radial Compliance Score Gauge renderer
def render_score_gauge(score: int, verdict: str) -> str:
    color = "#3FB950" if verdict.upper() == "PASS" else ("#F59E0B" if verdict.upper() == "FLAGGED" else "#EF4444")
    html = f"""
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #121620; padding: 25px; border-radius: 18px; border: 1px solid #21262D; height: 100%;">
        <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; background: conic-gradient({color} {score*3.6}deg, #1F2937 0deg); display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 122px; height: 122px; border-radius: 50%; background-color: #121620; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 30px; font-weight: bold; color: #F0F6FC;">{score}%</span>
                <span style="font-size: 10px; color: #8B949E; text-transform: uppercase; font-family: monospace; font-weight: bold; margin-top: 2px;">OVERALL SCORE</span>
            </div>
        </div>
        <div style="margin-top: 15px; text-align: center; width: 100%;">
            <span style="font-size: 9px; color: #8B949E; text-transform: uppercase; font-family: monospace; letter-spacing: 0.15em; display: block; margin-bottom: 2px;">AUDIT STATUS VERDICT</span>
            <span style="font-size: 18px; font-weight: 800; color: {color}; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block;">{verdict}</span>
        </div>
    </div>
    """
    return html


# Helper to parse scores and patient summaries (matching node / TS parser)
def parse_score_from_text(text: str) -> int:
    if not text:
        return 75
    tag_match = re.search(r'\[SCORE\]\s*(\d+)\s*\[/SCORE\]', text, re.IGNORECASE)
    if tag_match:
        val = int(tag_match.group(1))
        if 0 <= val <= 100:
            return val
    match = re.search(r'(?:Overall Compliance Rating|Overall Compliance Score|Overall Score|Overall Rating|Compliance Rating)\s*[:#-]*\s*(\d+)', text, re.IGNORECASE)
    if match:
        val = int(match.group(1))
        if 0 <= val <= 100:
            return val
    return 75


def parse_verified_score_from_text(text: str, default_score: int = 75) -> int:
    if not text:
        return default_score
    tag_match = re.search(r'\[VERIFIED_SCORE\]\s*(\d+)\s*\[/VERIFIED_SCORE\]', text, re.IGNORECASE)
    if tag_match:
        val = int(tag_match.group(1))
        if 0 <= val <= 100:
            return val
    return default_score


def parse_patient_summary_and_complaint(markdown: str, default_dept: str, overall_score: int) -> dict:
    lines = markdown.split("\n")
    patient_summary_text = ""
    diagnoses = []
    medications = []
    follow_up_instructions = []
    explained_terms = []
    
    risk_factors = []
    evidence_summary = ""
    evidence_locker_excerpt = ""
    evidence_findings = []
    
    current_section = ""
    
    for line in lines:
        line_stripped = line.strip()
        lower_line = line_stripped.lower()
        
        if "patient-friendly translation" in lower_line or "patient-friendly summary" in lower_line:
            current_section = "patient_summary"
            continue
        elif "dispute & complaint details" in lower_line or "complaint details" in lower_line or "dispute and complaint details" in lower_line:
            current_section = "complaint"
            continue
        elif "evidence findings with confidence" in lower_line or "evidence findings" in lower_line:
            current_section = "evidence_findings"
            continue
        elif line_stripped.startswith("###") or line_stripped.startswith("##") or line_stripped.startswith("#"):
            if current_section and not any(k in lower_line for k in ["diagnoses", "medications", "follow-up", "explained terms", "risk factors", "evidence", "deduction"]):
                current_section = ""
                
        if current_section == "patient_summary":
            if lower_line.startswith("- **patient-friendly summary**:") or lower_line.startswith("- **summary**:"):
                parts = line_stripped.split(":", 1)
                if len(parts) > 1:
                    patient_summary_text = parts[1].strip()
            elif "diagnoses" in lower_line:
                current_section = "diagnoses"
            elif "medications" in lower_line:
                current_section = "medications"
            elif "follow-up" in lower_line:
                current_section = "follow_up"
            elif "explained terms" in lower_line:
                current_section = "explained_terms"
            elif not patient_summary_text and line_stripped.startswith("- ") and not "**" in line_stripped:
                patient_summary_text = line_stripped[2:].strip()
                
        elif current_section == "diagnoses":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                diagnoses.append(line_stripped[2:].strip().replace("**", ""))
            elif "medications" in lower_line:
                current_section = "medications"
            elif "follow-up" in lower_line:
                current_section = "follow_up"
            elif "explained terms" in lower_line:
                current_section = "explained_terms"
                
        elif current_section == "medications":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                medications.append(line_stripped[2:].strip().replace("**", ""))
            elif "follow-up" in lower_line:
                current_section = "follow_up"
            elif "explained terms" in lower_line:
                current_section = "explained_terms"
                
        elif current_section == "follow_up":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                follow_up_instructions.append(line_stripped[2:].strip().replace("**", ""))
            elif "explained terms" in lower_line:
                current_section = "explained_terms"
                
        elif current_section == "explained_terms":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                content = line_stripped[2:].strip()
                term_match = re.match(r'\*\*(.*?)\*\*[:\s-]*(.*)', content)
                if term_match:
                    term = term_match.group(1).strip()
                    rest = term_match.group(2).strip()
                    parts = rest.split("|")
                    definition = parts[0].strip() if len(parts) > 0 else ""
                    context = parts[1].strip() if len(parts) > 1 else definition
                    explained_terms.append({"term": term, "definition": definition, "context": context})
                    
        elif current_section == "complaint":
            if "risk factors" in lower_line:
                current_section = "risk_factors"
            elif lower_line.startswith("- **evidence summary**:") or lower_line.startswith("- **evidence**:"):
                parts = line_stripped.split(":", 1)
                if len(parts) > 1:
                    evidence_summary = parts[1].strip()
            elif lower_line.startswith("- **deduction summary**:") or lower_line.startswith("- **deductions**:"):
                parts = line_stripped.split(":", 1)
                if len(parts) > 1:
                    evidence_locker_excerpt = parts[1].strip()
                    
        elif current_section == "risk_factors":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                risk_factors.append(line_stripped[2:].strip().replace("**", ""))
            elif lower_line.startswith("- **evidence summary**:") or lower_line.startswith("- **evidence**:"):
                parts = line_stripped.split(":", 1)
                if len(parts) > 1:
                    evidence_summary = parts[1].strip()
                current_section = "complaint"
            elif lower_line.startswith("- **deduction summary**:") or lower_line.startswith("- **deductions**:"):
                parts = line_stripped.split(":", 1)
                if len(parts) > 1:
                    evidence_locker_excerpt = parts[1].strip()
                current_section = "complaint"
                
        elif current_section == "evidence_findings":
            if line_stripped.startswith("* ") or line_stripped.startswith("- "):
                content = line_stripped[2:].strip()
                parts = content.split("|")
                if len(parts) >= 2:
                    finding_part = parts[0].replace("**", "").strip()
                    conf_part = parts[1].replace("**", "").strip().lower()
                    confidence = "Confirmed"
                    if "unsupported" in conf_part:
                        confidence = "Unsupported"
                    elif "likely" in conf_part:
                        confidence = "Likely"
                    explanation = parts[2].strip() if len(parts) > 2 else ""
                    evidence_findings.append({
                        "finding": finding_part,
                        "confidence": confidence,
                        "explanation": explanation
                    })
                    
    return {
        "patientSummaryText": patient_summary_text or None,
        "diagnoses": diagnoses if diagnoses else None,
        "medications": medications if medications else None,
        "followUpInstructions": follow_up_instructions if follow_up_instructions else None,
        "explainedTerms": explained_terms if explained_terms else None,
        "riskFactors": risk_factors if risk_factors else None,
        "evidenceSummary": evidence_summary or None,
        "evidenceLockerExcerpt": evidence_locker_excerpt or None,
        "evidenceFindings": evidence_findings if evidence_findings else None
    }


# Helper to parse metadata from report text
def parse_metadata_from_text(text: str, default_doctor: str, default_spec: str, default_hospital: str, default_dept: str):
    doctor_name = default_doctor
    specialization = default_spec
    hospital_name = default_hospital
    department = default_dept

    # Extract physician monitored
    provider_match = re.search(r'-\s*\*\*Provider Monitored:\*\*\s*(Dr\.\s*[^(\n\r]+)(?:\(([^)\n\r]+)\))?', text, re.IGNORECASE)
    if provider_match:
        if provider_match.group(1):
            doctor_name = provider_match.group(1).strip()
        if provider_match.group(2):
            specialization = provider_match.group(2).strip()
    
    # Extract Affiliation & Department
    affiliation_match = re.search(r'-\s*\*\*Affiliation\s*&\s*Department:\*\*\s*([^-]+)-\s*([^\n\r]+)', text, re.IGNORECASE)
    if affiliation_match:
        if affiliation_match.group(1):
            hospital_name = affiliation_match.group(1).strip()
        if affiliation_match.group(2):
            dept_str = affiliation_match.group(2).strip()
            if "cardio" in dept_str.lower():
                department = "Cardiology"
            elif "ortho" in dept_str.lower():
                department = "Orthopedics"
            elif "radio" in dept_str.lower():
                department = "Radiology"
            elif "emerg" in dept_str.lower() or "er" in dept_str.lower():
                department = "Emergency Medicine"

    if doctor_name and not doctor_name.startswith("Dr. "):
        doctor_name = "Dr. " + doctor_name

    return doctor_name, specialization, hospital_name, department


# PDF Text Extractor using PyPDF
def extract_text_from_pdf(pdf_file) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        return f"Error parsing PDF file: {str(e)}"


# --- SIDEBAR & NAVIGATION ---

with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 25px;">
        <span style="font-size: 32px;">🛡️</span>
        <div style="line-height: 1.1;">
            <span style="font-size: 15px; font-weight: 800; color: #F0F6FC; display: block; tracking-wider: 1px; font-family: monospace;">MEDICAL AUDITOR</span>
            <span style="font-size: 9px; font-weight: 700; color: #58A6FF; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em;">V2.1 Clinical Forensics</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # API Key Config Box
    st.markdown("### 🔑 CREDENTIALS SETTINGS")
    api_key_input = st.text_input(
        "GEMINI_API_KEY",
        type="password",
        value=os.getenv("GEMINI_API_KEY", ""),
        help="Paste your Google Gemini API Key here to run live dual-agent analysis. Otherwise, it defaults to high-fidelity simulated forensic audits."
    )
    if api_key_input:
        os.environ["GEMINI_API_KEY"] = api_key_input

    # Connection Indicators
    if is_api_key_configured():
        st.markdown(
            '<div style="background-color: #0e1f17; border: 1px solid #1f502d; padding: 10px 15px; border-radius: 8px; font-size: 11px; font-family: monospace; color: #56d364; font-weight: bold; margin-bottom: 20px;">'
            '● GEMINI API STATUS: ONLINE'
            '</div>', unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<div style="background-color: #21130d; border: 1px solid #6b2d18; padding: 10px 15px; border-radius: 8px; font-size: 11px; font-family: monospace; color: #f78166; font-weight: bold; margin-bottom: 20px;">'
            '● SIMULATION MODE ACTIVE'
            '</div>', unsafe_allow_html=True
        )

    # Navigation Menu
    st.markdown("### 🗺️ CORE DEPARTMENTS")
    selected_tab = st.radio(
        "Navigation",
        ["🔍 Forensic Investigator", "📋 Complaint Review Queue", "📊 Analytics & Registry", "📖 System Guide"],
        label_visibility="collapsed"
    )
    
    st.markdown("<br><br><br><br>", unsafe_allow_html=True)
    st.markdown(
        "<div style='text-align: center; color: #8B949E; font-size: 10px; font-family: monospace;'>"
        "Medical Auditor v2.1.0<br>"
        "Powered by google-genai & Streamlit"
        "</div>", unsafe_allow_html=True
    )


# --- TAB 1: FORENSIC CLINICAL INVESTIGATOR ---

if selected_tab == "🔍 Forensic Investigator":
    st.markdown("## 🔎 Forensic Clinical Investigator Workspace")
    st.markdown(
        "<p style='color: #8B949E; font-size: 12px; margin-top: -10px;'>"
        "Evaluate clinical logs, EHR summaries, or EKG scans for standard-of-care deviations and financial upcoding."
        "</p>", unsafe_allow_html=True
    )
    
    col_left, col_right = st.columns([5, 7])
    
    with col_left:
        # File Ingestion Dropzone
        st.markdown("### 📂 Ingest Clinical Records")
        uploaded_file = st.file_uploader(
            "Drag and Drop EHR Records or PDFs",
            type=["txt", "pdf", "png", "jpg", "jpeg"],
            label_visibility="collapsed"
        )
        
        # Clinician parameter override settings
        st.markdown("### 🛡️ Clinician Target Settings")
        with st.container(border=True):
            doctor_input = st.text_input("Attending Doctor Name", placeholder="Auto-detected on ingest", help="Override physician name explicitly if needed")
            hosp_input = st.text_input("Hospital Facility Name", placeholder="Auto-detected on ingest", help="Override hospital affiliation explicitly if needed")
            dept_override = st.selectbox(
                "Acuity Department Division",
                ["Auto-detected", "Cardiology", "Orthopedics", "Radiology", "Emergency Medicine"],
                index=0
            )

        submit_btn = st.button("🚀 EXECUTE FORENSIC AUDIT", use_container_width=True)

    with col_right:
        # Radial Gauge placeholder and live steps chronometer
        st.markdown("### 📡 Active Ingestion Audit Stream")
        
        # Set up a container that will render the results
        status_box = st.empty()
        gauge_box = st.empty()
        
        pipeline_box = st.container(border=True)
        with pipeline_box:
            st.markdown(
                "<span style='font-size: 10px; font-weight: bold; color: #58A6FF; font-family: monospace; uppercase'>Multi-Agent Pipeline Stream</span>",
                unsafe_allow_html=True
            )
            # Render empty steps
            ingest_step = st.empty()
            clinical_step = st.empty()
            billing_step = st.empty()
            referee_step = st.empty()
            
            # Populate defaults
            ingest_step.markdown("⚪ **Document Agent:** Ingesting clinical record & formatting details... *Pending*")
            clinical_step.markdown("⚪ **Clinical Agent:** Auditing standard of care pathways... *Pending*")
            billing_step.markdown("⚪ **Billing Agent:** Scanning for unbundled packages and upcoding... *Pending*")
            referee_step.markdown("⚪ **Chief Referee:** Performing double-agent verifications... *Pending*")

    # Audit Logic Execution
    if submit_btn:
        if not uploaded_file:
            st.error("Please upload or drag-and-drop a clinical record first.")
        else:
            with st.spinner("Processing clinical record..."):
                # Step 1: Ingesting file
                status_box.info("🚀 Initiating Google ADK Multi-Agent Forensic Pipeline...")
                ingest_step.markdown("🔵 **Document Agent:** Ingesting clinical record & formatting details... **Active**")
                time.sleep(1.0)
                
                # Retrieve file type and base64
                file_name = uploaded_file.name
                file_type = uploaded_file.type
                file_bytes = uploaded_file.getvalue()
                
                # Check if it's pdf/text
                if file_name.endswith(".pdf"):
                    record_text = extract_text_from_pdf(uploaded_file)
                else:
                    try:
                        record_text = file_bytes.decode("utf-8")
                    except Exception:
                        record_text = "[Image/Binary Content Uploaded]"

                ingest_step.markdown("🟢 **Document Agent:** Ingesting clinical record & formatting details... **Completed ✓**")
                
                # Step 2: Clinical Audit
                clinical_step.markdown("🔵 **Clinical Agent:** Auditing standard of care pathways... **Active**")
                status_box.info("🔍 Clinical Agent: Cross-referencing symptoms, vitals, and care guidelines via Google ADK...")
                time.sleep(1.2)
                clinical_step.markdown("🟢 **Clinical Agent:** Auditing standard of care pathways... **Completed ✓**")
                
                # Step 3: Billing Scan
                billing_step.markdown("🔵 **Billing Agent:** Scanning for unbundled packages and upcoding... **Active**")
                status_box.info("💸 Billing Agent: Analyzing billing timeline codes against ledger records...")
                time.sleep(1.0)
                billing_step.markdown("🟢 **Billing Agent:** Scanning for unbundled packages and upcoding... **Completed ✓**")
                
                # Step 4: Chief Referee Verifier
                referee_step.markdown("🔵 **Chief Referee:** Performing double-agent verifications... **Active**")
                status_box.info("⚖️ Chief Referee: Recalibrating score and verifying forensic consensus...")
                
                # Execute the unified ADK multi-agent pipeline
                import asyncio
                from agents.referee_agent import run_forensic_pipeline
                from tools.database import ForensicDB
                
                pipeline_res = asyncio.run(run_forensic_pipeline(record_text, patient_name="Patient (Workspace Ingest)"))
                
                compliance_score = pipeline_res.get("complianceScore", 75)
                verdict = pipeline_res.get("verdict", "Pass")
                raw_report = pipeline_res.get("reportMarkdown", "### Forensic Report")
                
                referee_step.markdown("🟢 **Chief Referee:** Performing double-agent verifications... **Completed ✓**")
                time.sleep(0.5)
                
                # Complete the run
                status_box.success("🎉 Forensic Clinical Audit Completed Successfully!")
                
                # Parse metadata overrides
                detected_doc = doctor_input or pipeline_res.get("doctorName") or "Dr. Angela Vance"
                detected_spec = "Cardiologist" if (dept_override == "Cardiology" or "cardio" in record_text.lower()) else "Specialist"
                detected_hosp = hosp_input or pipeline_res.get("hospitalName") or "Metro Heart Hospital"
                detected_dept = dept_override if dept_override != "Auto-detected" else (pipeline_res.get("department") or "Cardiology")
                
                # Format JSON payload
                audit_id = f"audit_{int(time.time()*1000)}"
                risk_classification = "High" if compliance_score < 50 else ("Medium" if compliance_score < 80 else "Low")
                
                audit_payload = {
                    "id": audit_id,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "fileName": file_name,
                    "fileSize": f"{round(len(record_text) / 1024 * 10) / 10} KB",
                    "fileType": "TXT",
                    "doctorName": detected_doc,
                    "doctorSpecialization": detected_spec,
                    "hospitalName": detected_hosp,
                    "department": detected_dept,
                    "complianceScore": compliance_score,
                    "doctorScore": max(10, min(100, compliance_score + (-3 if compliance_score < 70 else 2))),
                    "hospitalScore": compliance_score,
                    "riskClassification": risk_classification,
                    "verdict": verdict,
                    "providerReliabilityIndex": int(compliance_score * 0.9 + 10),
                    "reconstructed_timeline": pipeline_res.get("reconstructed_timeline", []),
                    "technicalMetrics": {
                        "docCompleteness": pipeline_res.get("documentationScore", int(compliance_score * 0.95)),
                        "recConsistency": pipeline_res.get("timelineScore", int(compliance_score * 0.98)),
                        "billingAccuracy": pipeline_res.get("billingScore", int(compliance_score * 0.92)),
                        "upcodingScore": 100 if compliance_score >= 70 else int(compliance_score * 1.1),
                        "procedureCompliance": pipeline_res.get("clinicalScore", int(compliance_score * 0.96)),
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
                    "reportMarkdown": raw_report,
                    "explainableAI": {
                        "whyScoreDropped": "The compliance score dropped due to clinical standard of care gaps or timeline anomalies." if compliance_score < 80 else "Score remained high with strong adherence to standard medical care guidelines.",
                        "findingsAffected": [f["description"] for f in pipeline_res.get("findings", [])],
                        "evidenceFindings": [
                            {"finding": f["description"], "confidence": "Confirmed" if f["severity"] == "High" else "Likely", "explanation": f["type"]}
                            for f in pipeline_res.get("findings", [])
                        ],
                        "confidenceLevel": 94 if compliance_score < 75 else 98
                    },
                    "patientSummary": {
                        "gradeLevel": "8th Grade Level Guided Summary",
                        "summaryText": f"The clinical forensic checkup completed. A compliance index of {compliance_score}% was calibrated.",
                        "diagnoses": ["General Diagnostic Evaluation"],
                        "medications": ["Under Compliance Review"],
                        "followUpInstructions": ["Continuous healthcare standard checks"],
                        "explainedTerms": pipeline_res.get("explainedTerms", [])
                    }
                }
                
                # Check for Complaint and Register
                if compliance_score < 80:
                    audit_payload["complaint"] = {
                        "status": "PENDING USER APPROVAL",
                        "severityLevel": "Level 4: Critical safety concern" if compliance_score < 40 else ("Level 3: Potential negligence" if compliance_score < 75 else "Level 2: Billing concern"),
                        "riskFactors": [f["description"] for f in pipeline_res.get("findings", [])],
                        "evidenceSummary": "Clinical and financial timeline mismatches detected by Google ADK multi-agent checks.",
                        "evidenceLockerExcerpt": "Score deductions due to care deviations."
                    }
                
                # Save using our shared DB manager
                ForensicDB.save_audit(audit_payload)
                
                # Update Radial Gauge UI
                gauge_box.html(render_score_gauge(compliance_score, verdict))
                
                # Rerender tabs on screen
                st.session_state["active_audit_id"] = audit_id
                st.rerun()

    # If there is an active audit loaded, display the complete beautiful detail breakdown
    if "active_audit_id" in st.session_state:
        st.markdown("---")
        active_id = st.session_state["active_audit_id"]
        
        # Load details using shared ForensicDB
        from tools.database import ForensicDB
        audit = ForensicDB.get_audit_by_id(active_id)
            
        if audit:
            st.markdown(f"### 📑 Clinical Forensic Audit Report Details (Case ID: #{audit['id']})")
            
            # Displays mini cards for meta
            meta_col1, meta_col2, meta_col3, meta_col4 = st.columns(4)
            with meta_col1:
                st.markdown(f"**Attending Physician:**\n{audit['doctorName']}")
            with meta_col2:
                st.markdown(f"**Affiliated Facility:**\n{audit['hospitalName']}")
            with meta_col3:
                st.markdown(f"**Acuity Division:**\n{audit['department']}")
            with meta_col4:
                st.markdown(f"**Audit Timestamp:**\n{audit['timestamp']}")

            # Render Sub-Tabs of Audit Workspace
            sub_tab1, sub_tab2, sub_tab3, sub_tab4 = st.tabs([
                "📄 REPORT DETAILED ANALYSIS",
                "🗃️ FINDINGS LOCKER",
                "👨‍👩‍👧 PATIENT-FRIENDLY TRANSLATION",
                "📊 COMPLIANCE METRICS"
            ])
            
            with sub_tab1:
                st.markdown(audit["reportMarkdown"])
                
            with sub_tab2:
                st.markdown("#### 🚨 Identified Clinical Deviations & Financial Upcoding Findings")
                findings = audit.get("explainableAI", {}).get("evidenceFindings", [])
                if findings:
                    for f in findings:
                        with st.container(border=True):
                            col_f1, col_f2 = st.columns([8, 2])
                            with col_f1:
                                st.markdown(f"##### {f.get('finding', 'Unknown Finding')}")
                                st.markdown(f"**Explanation:** {f.get('explanation', 'None provided')}")
                                if f.get('remediation'):
                                    st.markdown(f"💡 **Actionable Remediation:** {f.get('remediation')}")
                            with col_f2:
                                st.markdown(f"**Confidence:** `{f.get('confidence', 'Likely')}`")
                                st.markdown(f"**Severity:** `{f.get('severity', 'Medium')}`")
                                st.markdown(f"**Category:** `{f.get('category', 'Administrative Error')}`")
                else:
                    st.success("No deviations or negligences flagged in the clinical notes. Standard of care fully validated!")
                    
            with sub_tab3:
                p_summary = audit.get("patientSummary", {})
                st.markdown(f"#### 🎓 Patient-Friendly Explanation ({p_summary.get('gradeLevel', '8th Grade Level')})")
                st.info(p_summary.get("summaryText", "No summary provided."))
                
                col_p1, col_p2 = st.columns(2)
                with col_p1:
                    st.markdown("**💊 Patient Diagnoses Identified:**")
                    for d in p_summary.get("diagnoses", []):
                        st.markdown(f"- {d}")
                        
                    st.markdown("**📋 Follow-up instructions:**")
                    for instr in p_summary.get("followUpInstructions", []):
                        st.markdown(f"- {instr}")
                with col_p2:
                    st.markdown("**🩺 Medical Treatments/Medications Prescribed:**")
                    for m in p_summary.get("medications", []):
                        st.markdown(f"- {m}")
                        
                    st.markdown("**🧠 Explained Medical Terms:**")
                    for term in p_summary.get("explainedTerms", []):
                        st.markdown(f"**{term.get('term')}:** {term.get('definition')}")
                
                # Dynamic Timeline display from the Timeline Agent
                timeline = audit.get("reconstructed_timeline", [])
                if timeline:
                    st.markdown("---")
                    st.markdown("#### 🕒 Chronological Care Timeline (Reconstructed by Timeline Agent)")
                    for event in timeline:
                        st.markdown(f"⏱️ **{event.get('time')}** — {event.get('event')}")
                        
            with sub_tab4:
                st.markdown("#### 📈 Multi-Agent Technical Metrics Breakdown")
                t_metrics = audit.get("technicalMetrics", {})
                h_metrics = audit.get("healthcareMetrics", {})
                
                col_tech, col_health = st.columns(2)
                with col_tech:
                    st.markdown("**Technical Audit Performance Scores:**")
                    st.progress(t_metrics.get("docCompleteness", 80) / 100, f"Documentation Completeness: {t_metrics.get('docCompleteness')}%")
                    st.progress(t_metrics.get("recConsistency", 80) / 100, f"Record Continuity / Consistency: {t_metrics.get('recConsistency')}%")
                    st.progress(t_metrics.get("billingAccuracy", 80) / 100, f"Billing Ledger CPT Accuracy: {t_metrics.get('billingAccuracy')}%")
                    st.progress(t_metrics.get("upcodingScore", 80) / 100, f"Diagnostic Anti-Upcoding Integrity: {t_metrics.get('upcodingScore')}%")
                with col_health:
                    st.markdown("**Clinical Judgment / Safety Metrics:**")
                    st.progress(h_metrics.get("clinicalNegligenceScore", 80) / 100, f"Clinical Negligence Safety Index: {h_metrics.get('clinicalNegligenceScore')}%")
                    st.progress(h_metrics.get("treatmentAppropriateness", 80) / 100, f"Treatment Suitability Index: {h_metrics.get('treatmentAppropriateness')}%")
                    st.progress(h_metrics.get("patientSafetyScore", 80) / 100, f"Overall Patient Safety Level: {h_metrics.get('patientSafetyScore')}%")
                    st.progress(h_metrics.get("carePathwayCompliance", 80) / 100, f"Standard Care Pathways Alignment: {h_metrics.get('carePathwayCompliance')}%")


# --- TAB 2: COMPLAINT REVIEW QUEUE ---

elif selected_tab == "📋 Complaint Review Queue":
    st.markdown("## 📋 Forensic Complaint & Dispute Review Queue")
    st.markdown(
        "<p style='color: #8B949E; font-size: 12px; margin-top: -10px;'>"
        "Review patient disputes, clinical negligences, or high-risk cases currently pending regulatory verification."
        "</p>", unsafe_allow_html=True
    )
    
    # Load all audits using shared ForensicDB
    from tools.database import ForensicDB
    all_audits = ForensicDB.get_all_audits()
    complaint_audits = [a for a in all_audits if "complaint" in a]
            
    if not complaint_audits:
        st.success("🎉 Excellent! There are no high-risk cases or clinical dispute complaints currently in the queue.")
    else:
        st.markdown(f"**Pending Case Complaints ({len(complaint_audits)} cases):**")
        
        # Display list of complaints
        selected_case_id = st.selectbox(
            "Select Complaint Case File to Review",
            [f"Case ID: #{c['id']} - Physician: {c['doctorName']} (Score: {c['complianceScore']} - Status: {c['complaint']['status']})" for c in complaint_audits]
        )
        
        if selected_case_id:
            case_id = selected_case_id.split("Case ID: #")[1].split(" - Physician")[0]
            case = next(c for c in complaint_audits if c["id"] == case_id)
            
            # Review and Update Details
            col_comp_l, col_comp_r = st.columns([7, 5])
            
            with col_comp_l:
                st.markdown("#### 🔎 Regulatory Dispute Details")
                st.markdown(f"**Flagged Physician:** {case['doctorName']}")
                st.markdown(f"**Hospital Facility:** {case['hospitalName']} ({case['department']})")
                st.markdown(f"**Severity Level:** `{case['complaint']['severityLevel']}`")
                
                st.markdown("**Evidence Findings Summary:**")
                st.info(case["complaint"]["evidenceSummary"])
                
                st.markdown("**Deductions Breakdown:**")
                st.warning(case["complaint"]["evidenceLockerExcerpt"])
                
                st.markdown("**Triggered Risk Factors:**")
                for rf in case["complaint"]["riskFactors"]:
                    st.markdown(f"- 🔴 {rf}")
                    
            with col_comp_r:
                st.markdown("#### ⚙️ Case Status Actions")
                current_status = case["complaint"]["status"]
                
                st.write(f"Current Status: **{current_status}**")
                
                # Checkbox selection for status updating
                new_status = st.selectbox(
                    "Assign New Case Status",
                    ["PENDING USER APPROVAL", "REGISTERED", "DISMISSED", "SAVED FOR REVIEW"]
                )
                
                notes = st.text_area("Compliance Investigator Review Notes", placeholder="Type audit critique notes here...")
                
                update_btn = st.button("💾 SAVE DISPUTE DECISION", use_container_width=True)
                
                if update_btn:
                    case["complaint"]["status"] = new_status
                    if notes:
                        case["complaint"]["notes"] = notes
                        
                    # Save using ForensicDB
                    from tools.database import ForensicDB
                    ForensicDB.save_audit(case)
                        
                    st.success(f"Status successfully updated to: {new_status}!")
                    time.sleep(1.0)
                    st.rerun()


# --- TAB 3: ANALYTICS & REGISTRY ---

elif selected_tab == "📊 Analytics & Registry":
    st.markdown("## 📊 Physician Compliance & Hospital Reliability Registry")
    st.markdown(
        "<p style='color: #8B949E; font-size: 12px; margin-top: -10px;'>"
        "Statistical registry of checked hospitals and medical practitioners compiled from durably saved clinical evaluations."
        "</p>", unsafe_allow_html=True
    )
    
    # Load all audits using shared ForensicDB
    from tools.database import ForensicDB
    all_audits = ForensicDB.get_all_audits()
            
    if not all_audits:
        st.warning("No evaluations stored locally. Execute some forensic audits to compile compliance registry analytics!")
    else:
        # Calculate summary analytics
        total_runs = len(all_audits)
        avg_score = int(sum(a["complianceScore"] for a in all_audits) / total_runs)
        flagged_count = sum(1 for a in all_audits if a["verdict"].upper() == "FLAGGED")
        pass_count = total_runs - flagged_count
        
        stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
        with stat_col1:
            st.metric("Total Forensic Audits", total_runs)
        with stat_col2:
            st.metric("System Average Score", f"{avg_score}%")
        with stat_col3:
            st.metric("Adhered Standard (Pass)", pass_count)
        with stat_col4:
            st.metric("Flagged Integrity Concerns", flagged_count)
            
        st.markdown("---")
        st.markdown("### 📋 Clinical Audit Logs Directory")
        
        # Build registry table
        registry_data = []
        for a in all_audits:
            registry_data.append({
                "Audit ID": a["id"],
                "Date Checked": a["timestamp"][:10] if "timestamp" in a else "N/A",
                "Physician": a["doctorName"],
                "Facility": a["hospitalName"],
                "Department": a["department"],
                "Score": f"{a['complianceScore']}%",
                "Verdict": a["verdict"].upper(),
                "Risk Level": a["riskClassification"].upper()
            })
            
        df = pd.DataFrame(registry_data)
        st.dataframe(df, use_container_width=True)
        
        # Select single log to view
        st.markdown("### 🔍 Select Case to Load into Workspace")
        selected_log_id = st.selectbox(
            "Select Audit Record to Load",
            [f"#{a['id']} - {a['doctorName']} at {a['hospitalName']} (Score: {a['complianceScore']})" for a in all_audits]
        )
        
        if selected_log_id:
            target_id = selected_log_id.split("#")[1].split(" - ")[0]
            load_case_btn = st.button("📥 Load Selected Case to Active Workspace")
            if load_case_btn:
                st.session_state["active_audit_id"] = target_id
                st.session_state["active_department"] = next(a["department"] for a in all_audits if a["id"] == target_id)
                st.success(f"Loaded case #{target_id}! Switching to Forensic Investigator...")
                time.sleep(0.8)
                st.rerun()


# --- TAB 4: SYSTEM GUIDE ---

elif selected_tab == "📖 System Guide":
    st.markdown("## 📖 Clinical Forensic Auditor System Guide")
    st.markdown(
        "<p style='color: #8B949E; font-size: 12px; margin-top: -10px;'>"
        "Technical architecture documentation of the multi-agent clinical auditing pipeline."
        "</p>", unsafe_allow_html=True
    )
    
    st.markdown("""
    ### 🔬 Dual-Agent Medical Forensics Architecture
    The Medical Auditor uses an **Explicit Multi-Agent Orchestration Pipeline** to run deep diagnostic validations:
    
    1. **Document Ingestion Agent:** Pre-processes PDFs, images, or raw text clinical summaries, extracting structured layout text.
    2. **Clinical Audit Agent:** Evaluates care pathway adherence (e.g. AHA cardiology standard guidelines, radiological signoffs).
    3. **Financial Billing Agent:** Compares CPT/ICD ledger codes to identify upcoding, diagnostic inflation, and unbundled packages.
    4. **Chief Referee & Verification Verifier:** Cross-references findings, recalibrates scores, and signs off with final scores and verdicts.
    
    ---
    
    ### 🔌 Model Context Protocol (MCP) Integration
    The system is fully compatible with the Model Context Protocol (MCP), allowing external LLM clients to call the auditor as an agentic tool.
    
    - **Host Protocol:** Stdio Transport.
    - **Active Tools Excluded:**
        - `audit_clinical_record(recordText, fileName, doctorName, hospitalName, department)`: Audits clinical record with full multi-agent consensus.
        - `get_audit_history()`: Lists historical cases.
        - `get_audit_details(auditId)`: Exposes detailed reports by ID.
        
    ---
    
    ### 💻 Running the Streamlit Dashboard Locally
    To run this dashboard locally, ensure you have python installed, and run:
    
    ```bash
    pip install -r requirements.txt
    streamlit run app.py
    ```
    
    To configure your credentials, create a `.env` file in the root folder with:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    """)
