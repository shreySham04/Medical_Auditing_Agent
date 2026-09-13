"""
Reports Route and View Component.
Displays historical audit reports, printable HTML scorecards, and exported clinical findings.
"""

try:
    import streamlit as st
except ImportError:
    st = None

from app.services.audit_service import AuditService
from app.services.report_service import ReportService


def render_reports_view():
    if not st:
        print("Streamlit not installed, skipping UI render.")
        return
    st.header("📑 Audit Reports & Case Repository")
    st.caption("Inspect past forensic evaluations, download formal clinical audit reports, and export findings.")

    audits = AuditService.get_all_audits()
    if not audits:
        st.info("No audit reports recorded yet. Perform an audit in the Clinical Forensic Investigator tab.")
        return

    audit_options = [f"{a.get('id', 'AUD')}: {a.get('patientName', 'Unknown')} ({a.get('verdict', 'N/A')} - {a.get('complianceScore', 0)}/100)" for a in audits]
    selected_option = st.selectbox("Select Audit Case File", audit_options)

    selected_id = selected_option.split(":")[0].strip()
    audit = AuditService.get_audit(selected_id)

    if audit:
        st.subheader(f"Case File: `{audit.get('id')}`")
        col1, col2, col3, col4 = st.columns(4)
        col1.markdown(f"**Patient:** {audit.get('patientName')}")
        col2.markdown(f"**Physician:** {audit.get('doctorName')}")
        col3.markdown(f"**Facility:** {audit.get('hospitalName')}")
        col4.markdown(f"**Score:** **{audit.get('complianceScore')}/100** ({audit.get('verdict')})")

        st.divider()

        tab1, tab2 = st.tabs(["Markdown Forensic Report", "HTML Print Preview"])

        with tab1:
            report_md = audit.get("reportMarkdown") or ReportService.get_report_markdown(selected_id)
            st.markdown(report_md)
            st.download_button(
                "⬇️ Download Markdown Report",
                data=report_md,
                file_name=f"{selected_id}_report.md",
                mime="text/markdown"
            )

        with tab2:
            html_content = ReportService.generate_html_report(audit)
            st.components.v1.html(html_content, height=500, scrolling=True)
            st.download_button(
                "⬇️ Download HTML Report",
                data=html_content,
                file_name=f"{selected_id}_report.html",
                mime="text/html"
            )
