import os
import json
import uuid
import datetime
from pathlib import Path

AUDITS_DIR = Path(__file__).parent.parent / "audits"
AUDITS_DIR.mkdir(parents=True, exist_ok=True)

class ForensicDB:
    @staticmethod
    def get_all_audits() -> list:
        """Loads and returns all audited files from the audits directory."""
        audits = []
        for file_path in AUDITS_DIR.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Add simple safeguard attributes
                    if "id" not in data:
                        data["id"] = file_path.stem
                    if "savedPath" not in data:
                        data["savedPath"] = str(file_path)
                    audits.append(data)
            except Exception as e:
                print(f"Error loading audit file {file_path}: {e}")
        # Sort by compliance score (critical/failed cases first) or alphabetical
        return sorted(audits, key=lambda x: x.get("complianceScore", 100))

    @staticmethod
    def get_audit_by_id(audit_id: str) -> dict:
        """Retrieves a specific JSON audit report."""
        file_path = AUDITS_DIR / f"{audit_id}.json"
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    @staticmethod
    def save_audit(audit_data: dict) -> str:
        """Saves or updates an audit session as JSON and writes corresponding report Markdown."""
        audit_id = audit_data.get("id") or str(uuid.uuid4())[:8]
        audit_data["id"] = audit_id
        
        # Add metadata
        if "timestamp" not in audit_data:
            audit_data["timestamp"] = datetime.datetime.now().isoformat()
        
        # Save JSON file
        json_path = AUDITS_DIR / f"{audit_id}.json"
        audit_data["savedPath"] = str(json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(audit_data, f, indent=2, ensure_ascii=False)
            
        # Save Markdown Report file
        markdown_path = AUDITS_DIR / f"{audit_id}_report.md"
        with open(markdown_path, "w", encoding="utf-8") as f:
            f.write(audit_data.get("reportMarkdown", "# Clinical Forensic Report"))
            
        return audit_id

    @staticmethod
    def update_complaint_status(audit_id: str, new_status: str) -> bool:
        """Updates the regulatory complaint/dispute status of a record."""
        audit = ForensicDB.get_audit_by_id(audit_id)
        if audit:
            audit["complaintStatus"] = new_status
            ForensicDB.save_audit(audit)
            return True
        return False

    @staticmethod
    def purge_audit(audit_id: str) -> bool:
        """Deletes both JSON and Markdown files associated with the audit ID."""
        json_path = AUDITS_DIR / f"{audit_id}.json"
        markdown_path = AUDITS_DIR / f"{audit_id}_report.md"
        
        deleted = False
        if json_path.exists():
            json_path.unlink()
            deleted = True
        if markdown_path.exists():
            markdown_path.unlink()
            deleted = True
        return deleted

    @staticmethod
    def seed_initial_records():
        """Seeds standard test compliance files if the directory is empty."""
        existing = list(AUDITS_DIR.glob("*.json"))
        if len(existing) > 0:
            return
            
        seed_cases = [
            {
                "id": "CASE-101",
                "patientName": "Sarah Jenkins",
                "complianceScore": 42,
                "verdict": "Flagged",
                "clinicalScore": 58,
                "billingScore": 30,
                "clinicalGrade": "D+",
                "billingGrade": "F",
                "complaintStatus": "In Review",
                "fileName": "jenkins_cardiac_ledger.txt",
                "doctorName": "Dr. Angela Vance",
                "doctorSpecialization": "Cardiology",
                "hospitalName": "Metro Heart Hospital",
                "department": "Cardiology",
                "timestamp": "2026-07-06T09:00:00Z",
                "reportMarkdown": """# 🛡️ Medical Auditor V2.1 Forensic Report
**Patient Name:** Sarah Jenkins
**Calibrated Compliance Rating:** 42/100 (**Flagged**)

---
### 🩺 Clinical Care Quality Review
- Standard gaps: Unexplained delay in cardiac enzyme testing; patient discharge approved with blood pressure at 165/100.
- Vitals omitted in checkups.

### 💳 Financial Ledger Transparency Review
- Significant Billing Upcoding identified.
- Billed Code: **CPT 99291 (Critical Care, 30-74 minutes)** ($1,200).
- Fact check: The emergency clinical notes explicitly show the doctor visited for only 12 minutes. This constitutes financial upcoding.
""",
                "explainedTerms": [
                    {"term": "CPT 99291", "definition": "Critical Care service code requiring 30-74 minutes of bedside monitoring."},
                    {"term": "Cardiac Troponin", "definition": "Biomarker released during myocardial damage."}
                ],
                "findings": [
                    {"id": "CLIN-01", "type": "Clinical Deviation", "description": "Patient discharge approved with high BP (165/100)", "severity": "High"},
                    {"id": "BILL-01", "type": "Billing Inflation", "description": "Upcoded outpatient visit to CPT 99291 without supporting duration logs", "severity": "Critical"}
                ]
            },
            {
                "id": "CASE-102",
                "patientName": "Robert Davis",
                "complianceScore": 92,
                "verdict": "Pass",
                "clinicalScore": 95,
                "billingScore": 88,
                "clinicalGrade": "A",
                "billingGrade": "B+",
                "complaintStatus": "Resolved",
                "fileName": "davis_ortho_log.txt",
                "doctorName": "Dr. Tyler Chase",
                "doctorSpecialization": "Orthopedics",
                "hospitalName": "County Bone & Joint Clinic",
                "department": "Orthopedics",
                "timestamp": "2026-07-05T14:30:00Z",
                "reportMarkdown": """# 🛡️ Medical Auditor V2.1 Forensic Report
**Patient Name:** Robert Davis
**Calibrated Compliance Rating:** 92/100 (**Pass**)

---
### 🩺 Clinical Care Quality Review
- Exquisite compliance with AAOS Fracture reduction guidelines.
- Distal pulses and post-reduction X-rays perfectly documented.
""",
                "explainedTerms": [
                    {"term": "Fracture Reduction", "definition": "Surgical or clinical realignment of fractured bone pieces."}
                ],
                "findings": [
                    {"id": "SAFE-01", "type": "Safe Operations", "description": "No critical deviations detected. Compliance standards exceeded.", "severity": "Low"}
                ]
            }
        ]
        
        for case in seed_cases:
            ForensicDB.save_audit(case)

# Seed database immediately on module import
ForensicDB.seed_initial_records()
