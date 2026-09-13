"""
Report Generation and Export Service.
Generates comprehensive clinical forensics reports in Markdown, HTML, and printable formats.
"""

from typing import Dict, Any, Optional
from app.services.audit_service import AuditService


class ReportService:
    """
    Renders structured reports, executive summaries, and compliance scorecards.
    """

    @classmethod
    def get_report_markdown(cls, audit_id: str) -> Optional[str]:
        audit = AuditService.get_audit(audit_id)
        if not audit:
            return None
        return audit.get("reportMarkdown") or "# Report Not Generated"

    @classmethod
    def generate_html_report(cls, audit: Dict[str, Any]) -> str:
        audit_id = audit.get("id", "AUD-UNKNOWN")
        patient = audit.get("patientName", "Unknown / Not documented")
        doctor = audit.get("doctorName", "Unknown / Not documented")
        facility = audit.get("hospitalName", "Unknown / Not documented")
        score = audit.get("complianceScore", 0)
        verdict = audit.get("verdict", "PENDING")
        findings = audit.get("findings", [])

        findings_html = ""
        for f in findings:
            badge_color = "#ef4444" if f.get("severity") in ["High", "Critical"] else "#f59e0b"
            findings_html += f"""
            <div style="margin-bottom: 16px; padding: 14px; background: #161b22; border: 1px solid #30363d; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #58a6ff; font-size: 15px;">{f.get('type', 'Finding')}</strong>
                    <span style="background: {badge_color}; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: bold;">
                        {f.get('severity', 'Medium')}
                    </span>
                </div>
                <div style="margin-top: 6px; font-size: 13px; color: #8b949e;">Citation: <code>{f.get('citation_code', 'GEN-01')}</code> | {f.get('official_document', 'CMS / AMA Policy')}</div>
                <div style="margin-top: 8px; font-size: 14px; color: #e6edf3;">{f.get('description', '')}</div>
                <blockquote style="margin: 8px 0 0 0; padding-left: 10px; border-left: 3px solid #388bfd; color: #8b949e; font-style: italic; font-size: 13px;">
                    "{f.get('document_evidence', '')}"
                </blockquote>
            </div>
            """

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MedicalAuditor Forensic Audit: {audit_id}</title>
<style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; padding: 32px; max-width: 900px; margin: 0 auto; }}
    h1, h2, h3 {{ color: #f0f6fc; }}
    .header {{ border-bottom: 1px solid #30363d; padding-bottom: 16px; margin-bottom: 24px; }}
    .meta-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 14px; }}
    .score-box {{ background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }}
    .score-val {{ font-size: 48px; font-weight: bold; color: {'#238636' if score >= 80 else ('#d29922' if score >= 60 else '#da3633')}; }}
</style>
</head>
<body>
    <div class="header">
        <h1>🛡️ MedicalAuditor V2.1 Forensic Audit Report</h1>
        <div>Case Identifier: <code>{audit_id}</code></div>
    </div>
    <div class="meta-grid">
        <div><strong>Patient:</strong> {patient}</div>
        <div><strong>Attending Physician:</strong> {doctor}</div>
        <div><strong>Facility:</strong> {facility}</div>
        <div><strong>Department:</strong> {audit.get('department', 'Inpatient Unit')}</div>
    </div>
    <div class="score-box">
        <div class="score-val">{score} / 100</div>
        <div style="font-weight: 600; text-transform: uppercase; margin-top: 4px;">Verdict: {verdict}</div>
    </div>
    <h2>Evidence Findings & Grounding</h2>
    {findings_html if findings_html else '<p>No deficiencies or regulatory breaches detected.</p>'}
</body>
</html>
"""
