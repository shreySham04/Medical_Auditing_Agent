import os
import json
import uuid
import sqlite3
import datetime
from pathlib import Path

DB_DIR = Path(__file__).parent.parent / "audits"
DB_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_DB_PATH = DB_DIR / "forensic_audits.db"

class ForensicDB:
    @staticmethod
    def _get_conn():
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initializes SQLite schema without seeding dummy sample reports."""
        with ForensicDB._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS forensic_audits (
                    id TEXT PRIMARY KEY,
                    patient_name TEXT,
                    doctor_name TEXT,
                    hospital_name TEXT,
                    department TEXT,
                    compliance_score INTEGER,
                    verdict TEXT,
                    risk_classification TEXT,
                    clinical_score INTEGER,
                    billing_score INTEGER,
                    documentation_score INTEGER,
                    timeline_score INTEGER,
                    report_markdown TEXT,
                    findings_json TEXT,
                    explained_terms_json TEXT,
                    raw_record_text TEXT,
                    data_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    @staticmethod
    def get_all_audits() -> list:
        """Loads and returns all real saved audits from SQLite database."""
        ForensicDB.init_db()
        audits = []
        try:
            with ForensicDB._get_conn() as conn:
                cursor = conn.execute("SELECT data_json FROM forensic_audits ORDER BY created_at DESC")
                for row in cursor.fetchall():
                    try:
                        record = json.loads(row["data_json"])
                        audits.append(record)
                    except Exception as e:
                        print(f"Error parsing audit JSON: {e}")
        except Exception as e:
            print(f"Database query error: {e}")

        # Also check file system fallback if json files exist
        if not audits:
            for file_path in DB_DIR.glob("*.json"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if "id" not in data:
                            data["id"] = file_path.stem
                        audits.append(data)
                except Exception:
                    pass

        return audits

    @staticmethod
    def get_audit_by_id(audit_id: str) -> dict:
        """Retrieves a specific audit report by ID from SQLite DB."""
        ForensicDB.init_db()
        try:
            with ForensicDB._get_conn() as conn:
                cursor = conn.execute("SELECT data_json FROM forensic_audits WHERE id = ?", (str(audit_id),))
                row = cursor.fetchone()
                if row:
                    return json.loads(row["data_json"])
        except Exception as e:
            print(f"Database lookup error for {audit_id}: {e}")

        # Fallback to disk file
        file_path = DB_DIR / f"{audit_id}.json"
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    @staticmethod
    def save_audit(audit_data: dict) -> dict:
        """Persistently saves or updates an audit session in SQLite DB and writes corresponding JSON/Markdown."""
        ForensicDB.init_db()
        audit_id = audit_data.get("id") or audit_data.get("case_id") or f"AUD-{int(datetime.datetime.now().timestamp() * 1000) % 100000}"
        audit_data["id"] = audit_id
        audit_data["case_id"] = audit_id
        
        now_iso = datetime.datetime.now().isoformat()
        if "timestamp" not in audit_data:
            audit_data["timestamp"] = now_iso
            
        patient = audit_data.get("patientName") or audit_data.get("patient_name") or "Patient Record"
        doctor = audit_data.get("doctorName") or audit_data.get("doctor_name") or "Attending Physician"
        hospital = audit_data.get("hospitalName") or audit_data.get("hospital") or "Medical Center"
        department = audit_data.get("department") or "Clinical Department"
        score = audit_data.get("complianceScore") or audit_data.get("compliance_rating") or audit_data.get("primaryScore") or 0
        verdict = audit_data.get("verdict") or ("Pass" if score >= 80 else "Flagged" if score >= 50 else "Failed")
        risk = audit_data.get("riskClassification") or audit_data.get("risk_classification") or "STANDARD_MONITORING"
        clinical_score = audit_data.get("clinicalScore") or 0
        billing_score = audit_data.get("billingScore") or 0
        doc_score = audit_data.get("documentationScore") or 0
        time_score = audit_data.get("timelineScore") or 0
        report_md = audit_data.get("reportMarkdown") or audit_data.get("report_markdown") or "# Clinical Forensic Report"
        findings_json = json.dumps(audit_data.get("findings", []))
        explained_terms_json = json.dumps(audit_data.get("explainedTerms", []))
        raw_text = audit_data.get("rawRecordText") or ""
        full_json = json.dumps(audit_data, ensure_ascii=False)

        # 1. Upsert into SQLite
        try:
            with ForensicDB._get_conn() as conn:
                conn.execute("""
                    INSERT INTO forensic_audits (
                        id, patient_name, doctor_name, hospital_name, department,
                        compliance_score, verdict, risk_classification,
                        clinical_score, billing_score, documentation_score, timeline_score,
                        report_markdown, findings_json, explained_terms_json,
                        raw_record_text, data_json, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        patient_name=excluded.patient_name,
                        doctor_name=excluded.doctor_name,
                        hospital_name=excluded.hospital_name,
                        department=excluded.department,
                        compliance_score=excluded.compliance_score,
                        verdict=excluded.verdict,
                        risk_classification=excluded.risk_classification,
                        clinical_score=excluded.clinical_score,
                        billing_score=excluded.billing_score,
                        documentation_score=excluded.documentation_score,
                        timeline_score=excluded.timeline_score,
                        report_markdown=excluded.report_markdown,
                        findings_json=excluded.findings_json,
                        explained_terms_json=excluded.explained_terms_json,
                        raw_record_text=excluded.raw_record_text,
                        data_json=excluded.data_json,
                        updated_at=excluded.updated_at
                """, (
                    str(audit_id), patient, doctor, hospital, department,
                    int(score), verdict, risk,
                    int(clinical_score), int(billing_score), int(doc_score), int(time_score),
                    report_md, findings_json, explained_terms_json,
                    raw_text, full_json, now_iso
                ))
                conn.commit()
        except Exception as e:
            print(f"SQLite save error: {e}")

        # 2. Persist JSON & Markdown backup files
        try:
            json_path = DB_DIR / f"{audit_id}.json"
            audit_data["savedPath"] = str(json_path)
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(audit_data, f, indent=2, ensure_ascii=False)

            markdown_path = DB_DIR / f"{audit_id}_report.md"
            with open(markdown_path, "w", encoding="utf-8") as f:
                f.write(report_md)
        except Exception as e:
            print(f"File backup save error: {e}")

        return audit_data

    @staticmethod
    def purge_audit(audit_id: str) -> bool:
        """Deletes audit record from SQLite DB and files."""
        ForensicDB.init_db()
        deleted = False
        try:
            with ForensicDB._get_conn() as conn:
                cursor = conn.execute("DELETE FROM forensic_audits WHERE id = ?", (str(audit_id),))
                conn.commit()
                if cursor.rowcount > 0:
                    deleted = True
        except Exception as e:
            print(f"SQLite purge error: {e}")

        json_path = DB_DIR / f"{audit_id}.json"
        markdown_path = DB_DIR / f"{audit_id}_report.md"
        
        if json_path.exists():
            try:
                json_path.unlink()
                deleted = True
            except Exception:
                pass
        if markdown_path.exists():
            try:
                markdown_path.unlink()
                deleted = True
            except Exception:
                pass
        return deleted

# Initialize database schema immediately without seeding unnecessary sample data
ForensicDB.init_db()
