<div align="center">
<h1>MedicalAuditor</h1>
<h3>Multi-Agent AI System for Forensic Medical Compliance Auditing</h3>
</div>

---

##  Problem Statement

Medical records auditing is slow, inconsistent, and prone to human error.  
Hospitals often face challenges in detecting:

- Clinical deviations  
- Billing inconsistencies  
- Documentation gaps  
- Timeline mismatches  

---

## Solution

MedicalAuditor is a **multi-agent AI system** that performs automated forensic medical auditing using specialized AI agents and a supervisor verification layer.

---

##  System Architecture

Medical Document  
→ Document Agent  
→ Clinical Agent + Billing Agent (parallel)  
→ Documentation Agent + Timeline Agent  
→ Supervisor Agent  
→ Final Audit Report  

---

##  Multi-Agent System

### 1. Document Agent
Extracts and structures medical text from raw input.

### 2. Clinical Agent
Checks diagnosis accuracy and treatment consistency.

### 3. Billing Agent
Detects upcoding and billing inconsistencies.

### 4. Documentation Agent
Validates completeness of medical records.

### 5. Timeline Agent
Ensures chronological consistency of events.

### 6. Supervisor Agent
Aggregates all outputs and produces final verified compliance score.

---

## MCP Server

The MCP server manages orchestration between agents and enables structured tool-based communication for audit workflows.

---

##  Tech Stack

- TypeScript
- Node.js
- React (Vite)
- MCP Architecture
- Gemini AI Integration

---
Summary

MedicalAuditor transforms medical auditing into a transparent, explainable, and AI-driven multi-agent system designed for real-world healthcare compliance evaluation.

##  How to Run

```bash
npm install
npm run dev

