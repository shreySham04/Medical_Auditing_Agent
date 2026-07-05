# 🏥 MedicalAuditor  
### Multi-Agent AI System for Forensic Medical Compliance Auditing

---

## 🚨 Problem Statement

Medical record auditing in hospitals is:

- Time-consuming  
- Error-prone  
- Difficult to scale  
- Vulnerable to billing fraud and documentation inconsistencies  

Critical issues include:

- Clinical guideline deviations  
- Billing upcoding and financial inconsistencies  
- Missing or incomplete documentation  
- Timeline mismatches in patient records  

---

## 💡 Solution Overview

MedicalAuditor is a **multi-agent AI system** that performs automated forensic medical auditing using specialized AI agents.

Instead of a single AI model, the system uses multiple expert agents that collaborate and are verified by a supervisor layer.

---

## 🧠 Key Features

- Multi-Agent AI Architecture  
- Parallel + Sequential Agent Execution  
- Supervisor-based verification system  
- Clinical compliance checking  
- Billing fraud detection  
- Documentation validation  
- Timeline consistency analysis  
- Explainable AI audit reports  
- MCP-based orchestration layer  

---


---

## 🤖 Multi-Agent System Design

### 📄 Document Agent
- Extracts and structures medical data from raw input  
- Cleans OCR / PDF text  
- Identifies patient + report metadata  

---

### 🩺 Clinical Agent
- Validates diagnosis correctness  
- Checks treatment appropriateness  
- Compares with clinical guidelines (WHO / ACC-AHA / NICE)  

---

### 💰 Billing Agent
- Detects upcoding patterns  
- Identifies billing inconsistencies  
- Flags suspicious financial entries  

---

### 📋 Documentation Agent
- Checks completeness of medical records  
- Validates signatures and required fields  
- Detects missing clinical documentation  

---

### ⏱ Timeline Agent
- Reconstructs chronological sequence  
- Detects inconsistent or impossible events  
- Validates temporal accuracy of treatment flow  

---

### 🧠 Supervisor Agent
- Aggregates all agent outputs  
- Resolves conflicts between agents  
- Performs final risk evaluation  
- Generates final compliance score  
- Produces verdict (PASS / FLAGGED / FAIL)  

---

## 🔌 MCP Server (Orchestration Layer)

The MCP (Model Context Protocol) server enables structured communication between agents.

It handles:

- Agent-to-agent communication  
- Tool orchestration  
- Workflow control  
- Structured response formatting  
- External service integration  

---

## ⚙️ Tech Stack

- TypeScript  
- Node.js  
- React (Vite)  
- MCP Architecture  
- Gemini AI API  

---

## 🚀 How to Run
### 1. Install dependencies
npm install

2. Start frontend
npm run dev

4. Start backend
node server.ts

5. Start MCP server
node mcp-server.ts



#OUTPUT
{
  "final_score": 82,
  "verdict": "FLAGGED",
  "risk_level": "MEDIUM",
  "clinical_findings": [
    "Minor inconsistency in treatment guideline adherence"
  ],
  "billing_findings": [
    "Possible upcoding detected in billing records"
  ],
  "timeline_status": "Consistent",
  "confidence": 0.87
}

Summary

MedicalAuditor is a multi-agent AI system for forensic medical compliance auditing. It uses specialized agents (Clinical, Billing, Documentation, Timeline) coordinated through a Supervisor Agent and MCP-based orchestration to produce explainable, structured, and reliable audit decisions.
