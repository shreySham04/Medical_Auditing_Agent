# 🛡️ Medical Auditor V2.1: Clinical Forensic Multi-Agent Platform

Medical Auditor V2.1 is an enterprise-grade clinical forensic auditor powered by the **Google Agent Development Kit (ADK)** and the **Model Context Protocol (MCP)**. It automates the detection of clinical standard-of-care deviations and financial upcoding (billing fraud) by orchestrating a cooperative, parallel multi-agent pipeline.

This project is fully converted to **Python** for easy integration into **Kaggle Notebooks**, local environments, and GitHub repository imports.

---

## 📖 Table of Contents
1. [🔬 Problem Statement & Solution](#-problem-statement--solution)
2. [🗺️ Multi-Agent Architecture](#%EF%B8%8F-multi-agent-architecture)
3. [✅ Competition Key Concepts Demonstrated](#-competition-key-concepts-demonstrated)
4. [💻 Streamlit & FastMCP Implementation](#-streamlit--fastmcp-implementation)
5. [📓 Running on Kaggle Notebooks (Step-by-Step)](#-running-on-kaggle-notebooks-step-by-step)
6. [🛠️ Local Installation & Development](#%EF%B8%8F-local-installation--development)
7. [🛡️ Security & Integrity Safeguards](#%EF%B8%8F-security--integrity-safeguards)

---

## 🔬 Problem Statement & Solution

### The Problem
Healthcare compliance teams are overwhelmed. **Financial Medical Upcoding** (billing for more expensive CPT codes than the doctor actually provided) and **Clinical Negligence** (failing to follow cardiac, orthopedic, or medical safety standards) cost healthcare providers, insurers, and patients billions of dollars annually while putting human lives at risk.

Historically, audits are conducted manually, or using basic keyword-matching tools that fail to correlate the **chronology of clinical events** against the **charges billed**.

### The Solution
Medical Auditor V2.1 solves this by using a parallel **multi-agent reasoning system** in Python:
- **Clinical Auditor Agent**: Verifies clinical standard of care guidelines (e.g. AHA cardiology, AAOS trauma standards) and catches treatment safety gaps.
- **Billing Auditor Agent**: Cross-references medical financial ledger lines against CPT/ICD coding manuals to detect unbundled pricing and upcoded services.
- **Chief Referee Synthesis Agent**: Resolves contradictions, computes a final calibrated compliance index (0-100), translates results to 8th-grade-level patient terminology, and issues an authoritative verdict.

---

## 🗺️ Multi-Agent Architecture

The following diagram illustrates the flow of data and coordination of agents during an audit:

```
                  ┌───────────────────────────────┐
                  │   Raw Clinical Record / PDF   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                    [ DOCUMENT INGESTION AGENT ]
                    - Extracts text and timelines
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌────────────────────────────────┐                ┌────────────────────────────────┐
│   CLINICAL AUDITOR AGENT       │                │    BILLING AUDITOR AGENT       │
│ - Evaluates care guidelines    │                │ - Detects CPT upcoding         │
│ - Standard-of-care compliance  │                │ - Scans for unbundled charges  │
│ - Utilizes: standards tool     │                │ - Utilizes: billing codes tool │
└────────────────┬───────────────┘                └────────────────┬───────────────┘
                 │                                                 │
                 └────────────────────────┬────────────────────────┘
                                          │ (Asynchronous Parallel Analysis)
                                          ▼
                            [ CHIEF REFEREE SYNTHESIS AGENT ]
                            - Weighs clinical (60%) & billing (40%)
                            - Calibrates Compliance Rating (0-100)
                            - Formulates Unified Forensic Verdict (Pass/Flagged/Failed)
                            - Explains medical terms for patient transparency
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      Forensic DB /audits        │
                         │ (Synchronized JSON + Markdown)  │
                         └──────┬───────────────────┬──────┘
                                │                   │
                                ▼                   ▼
                    ┌───────────────────┐   ┌───────────────────┐
                    │ Streamlit App UI  │   │  FastMCP Server   │
                    │ (Visual Portal)   │   │  (LLM Client API) │
                    └───────────────────┘   └───────────────────┘
```

---

## ✅ Competition Key Concepts Demonstrated

This repository demonstrates **four (4) of the core concepts** required by the competition:

1. **Agent / Multi-Agent System (ADK) [Code]**:
   - Implemented inside `agents/clinical_agent.py`, `agents/billing_agent.py`, and `agents/referee_agent.py` using `google-adk` (`LlmAgent`, `LiteLlm`, `Runner`, and `InMemorySessionService`).
   - Includes real python tool definitions (`lookup_clinical_standards` and `lookup_billing_codes`) that the agents execute dynamically based on the parsed disease department.

2. **Model Context Protocol (MCP) Server [Code]**:
   - Defined in `mcp_server.py` using the FastMCP framework.
   - Exposes three high-fidelity tools: `audit_clinical_record`, `get_audit_history`, and `get_audit_details`.
   - Links MCP calls directly to the ADK pipeline, allowing any standard MCP host (like Claude Desktop or Cursor) to run the medical auditor.

3. **Security Features [Code]**:
   - **No Hardcoded Keys**: Safely reads environment variables via `os.getenv("GEMINI_API_KEY")` and `python-dotenv`.
   - **Simulation/Offline Safe-Fallback Mode**: If the API key is missing, the application automatically triggers a local, high-fidelity compliance simulator, preventing system crashes during evaluation or grading.

4. **Deployability [Code/Video]**:
   - Can be booted instantly in any sandboxed environment with a single command: `streamlit run app.py`.
   - Contains a fully structured `requirements.txt` file and local JSON DB storage, eliminating complex cloud database setup.

---

## 💻 Streamlit & FastMCP Implementation

- **Streamlit Frontend (`app.py`)**: Includes interactive widgets, live multi-agent chronological timelines, circular SVG compliance gauges, patient translation modules, compliance log directories, and dispute queues.
- **MCP Server (`mcp_server.py`)**: Exposes professional compliance tools using stdio-based transport.

---

## 📓 Running on Kaggle Notebooks (Step-by-Step)

You can run this entire project programmatically inside a **Kaggle Notebook**. Follow these simple steps:

### Step 1: Open Kaggle & Set Secrets
1. Go to [Kaggle](https://www.kaggle.com) and create a new Python Notebook.
2. Under the top menu bar, go to **Add-ons** -> **Secrets**.
3. Add a new secret with Label `GEMINI_API_KEY` and paste your Google Gemini API Key. Enable the checkbox to make it accessible to your notebook.

### Step 2: Import Your GitHub Repository
Run this shell command in the very first Kaggle cell to clone your project repository directly into the notebook directory:
```python
# Clone the repository
!git clone https://github.com/your-username/medical-auditor.git
%cd medical-auditor
```

### Step 3: Install Dependencies
Install all required packages including the Google ADK and Streamlit:
```python
# Install required Python packages
!pip install -r requirements.txt
```

### Step 4: Run the Multi-Agent Pipeline Programmatically
You can execute the ADK Multi-Agent pipeline directly inside a notebook cell to perform forensic auditing on demand:
```python
import os
import asyncio
from kaggle_secrets import UserSecretsClient
from agents.referee_agent import run_forensic_pipeline

# Configure Gemini API key from Kaggle Secrets
user_secrets = UserSecretsClient()
os.environ["GEMINI_API_KEY"] = user_secrets.get_secret("GEMINI_API_KEY")

# Sample raw clinical record showing standard deviations and upcoding
record_text = """
Patient Jenkins arrived with acute chest pain at 10:15.
ECG checked. Discharged at 10:55 in stable condition.
Billed charges: CPT Code 99291 (Critical Care - 60 mins) - $1,500.
"""

# Execute the asynchronous ADK multi-agent pipeline
async def run_audit():
    result = await run_forensic_pipeline(record_text, patient_name="Sarah Jenkins")
    print("--- FORENSIC COMPLIANCE AUDIT COMPLETED ---")
    print(f"Compliance Score: {result['complianceScore']}/100")
    print(f"Verdict: {result['verdict'].upper()}")
    print("\n--- DETAILED MARKDOWN REPORT ---")
    print(result['reportMarkdown'])

# Run the task
asyncio.run(run_audit())
```

### Step 5: Run the Streamlit UI on Kaggle (Optional Tunneling)
To view the beautiful visual interface directly from Kaggle, you can run Streamlit in the background and open a secure local tunnel:
```python
# Install localtunnel to expose port 3000/8501
!npm install -g localtunnel

# Run Streamlit in the background
import subprocess
subprocess.Popen(["streamlit", "run", "app.py", "--server.port", "8501"])

# Expose port 8501 to a public URL
!lt --port 8501
```

---

## 🛠️ Local Installation & Development

To develop and test the project on your local machine:

### 1. Clone & Set Environment
```bash
git clone https://github.com/your-username/medical-auditor.git
cd medical-auditor
```
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Install Packages
```bash
pip install -r requirements.txt
```

### 3. Run Streamlit UI
```bash
streamlit run app.py
```
Open `http://localhost:8501` (or port `3000` in AI Studio) to view the workspace.

### 4. Run FastMCP Server
```bash
mcp dev mcp_server.py
```

---

## 🛡️ Security & Integrity Safeguards

- **No Secret Storage**: All API invocations check and read environment variables dynamically. No key is ever saved to the file-system.
- **Local Sandbox Execution**: The application runs completely in-memory or persists case reports locally in `/audits` under sanitized JSON file IDs.
- **Compliance Edge Calibration**: The agents are trained explicitly on HIPAA documentation, AMA CPT guidelines, and AAOS orthopedics criteria, preventing subjective rating drifts.

---

