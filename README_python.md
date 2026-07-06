# 🛡️ Medical Auditor V2.1: Python & Streamlit Forensic Framework

A complete, high-fidelity Python port of the **Medical Auditor V2.1** clinical forensics system. This framework implements a dual-agent auditing pipeline powered by Google Gemini, designed to ingest electronic health records (EHRs), evaluate patient care standard alignment, check for diagnostic upcoding or unbundled medical packages, and serve as a live Model Context Protocol (MCP) tool.

---

## 🔬 Multi-Agent Pipeline Architecture

The application runs a multi-agent chronological chain to audit records:
```
  [Ingested Record] 
         │
         ▼
 1. Document Agent  ──► Parses and structures medical text (supports PDF & Text)
         │
         ▼
 2. Clinical Agent  ──► Validates treatment compliance (symptoms, labs, guidelines)
         │
         ▼
 3. Billing Agent   ──► Audits ledger chronologies for financial inflation / upcoding
         │
         ▼
 4. Chief Referee   ──► Critiques findings, calibrates final score, and signs off
```

---

## 📂 Codebase Contents

This Python suite consists of the following files:

- **`app.py`**: A stunning, full-featured **Streamlit web dashboard** containing:
  - **Forensic Investigator**: Upload clinical logs (or PDFs/images), run multi-agent progress, visualize circular compliance score radial gauges, and read comprehensive Markdown reports.
  - **Complaint Queue**: Review high-risk disputes, edit regulatory investigation statuses, and save decisions directly to disk.
  - **Registry Directory**: Search local compliance databases, check overall hospital stats, average clinician scores, and risk trends.
  - **System Guide**: Developer references and architectural flowcharts.
- **`mcp_server.py`**: A robust **FastMCP server** implementing three high-level tool entrypoints:
  - `audit_clinical_record`: Runs primary and chief referee evaluation prompts using Google Gemini.
  - `get_audit_history`: Lists all stored JSON audits.
  - `get_audit_details`: Retrieves a specific audit report by ID.
- **`requirements.txt`**: The required Python packages (`streamlit`, `google-genai`, `pypdf`, `pillow`, `mcp`, `python-dotenv`).

---

## ⚙️ Local Setup and Configuration

### 1. Install Dependencies
Ensure you have Python 3.10+ installed. In your root terminal, run:
```bash
pip install -r requirements.txt
```

### 2. Configure Credentials
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(If no API key is specified, the application seamlessly runs in **Simulation Mode**, providing rich high-fidelity clinical and billing simulations so the dashboard never crashes!)*

### 3. Launch the Web Dashboard
Boot up your Streamlit forensic workspace:
```bash
streamlit run app.py
```
Open the printed URL in your browser (typically `http://localhost:8501`).

### 4. Run the MCP Server
Run the FastMCP server in standard I/O (stdio) transport mode:
```bash
mcp dev mcp_server.py
```
or run it directly:
```bash
python mcp_server.py
```

---

## 🏆 Kaggle & Hackathon Submission Blueprint

When submitting this project to platforms like **Kaggle** or **Google AI Studio contests**, follow this recommended structure:

1. **Agent Implementation (`mcp_server.py`)**: Demonstrates proper adherence to the Model Context Protocol (MCP) using the modern `google-genai` SDK and FastMCP decorator tools.
2. **Interactive UI (`app.py`)**: Showcases high-quality, professional Streamlit visuals with custom CSS overrides mimicking modern dark theme IDEs, custom circular progress gauges, and multi-tab forensic workspaces.
3. **Data Durability**: Stored cases are serialized under `/audits` as standard JSON and Markdown records, proving seamless coordination between the Streamlit dashboard and the MCP tool.
