"""
Audit Route and View Component.
Handles clinical chart upload, ingestion, live audit execution, and interactive findings review.
"""

try:
    import streamlit as st
except ImportError:
    st = None

from app.services.audit_service import AuditService
from evaluation.benchmark import ALL_BENCHMARK_CASES


def render_audit_view():
    if not st:
        print("Streamlit not installed, skipping UI render.")
        return
    st.header("🔍 Clinical Forensic Investigator")
    st.caption("Evidence-grounded medical compliance auditing against CMS statutory regulations and AMA CPT rules.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("1. Ingest Clinical Record")
        sample_options = ["Custom Input"] + [f"{c.input.id}: {c.input.title}" for c in ALL_BENCHMARK_CASES[:15]]
        selected_sample = st.selectbox("Load Standard Benchmark Case (Optional)", sample_options)

        default_text = ""
        default_patient = "Unknown / Not documented"
        default_doctor = "Unknown / Not documented"
        default_hospital = "Unknown / Not documented"
        default_specialty = "General Medicine"

        if selected_sample != "Custom Input":
            case_id = selected_sample.split(":")[0].strip()
            matched = next((c for c in ALL_BENCHMARK_CASES if c.input.id == case_id), None)
            if matched:
                default_text = matched.input.record_text
                default_patient = matched.input.patient_name
                default_doctor = matched.input.doctor_name
                default_hospital = matched.input.hospital_name
                default_specialty = matched.input.specialty

        uploaded_file = st.file_uploader("Upload Clinical Chart (.txt, .pdf, .md)", type=["txt", "pdf", "md"])
        if uploaded_file is not None:
            try:
                default_text = uploaded_file.read().decode("utf-8", errors="ignore")
            except Exception:
                st.warning("Could not read uploaded file as text directly.")

        record_text = st.text_area("Clinical Record Text", value=default_text, height=280)

        meta_c1, meta_c2 = st.columns(2)
        with meta_c1:
            patient_name = st.text_input("Patient Identifier", value=default_patient)
            hospital_name = st.text_input("Facility", value=default_hospital)
        with meta_c2:
            doctor_name = st.text_input("Attending Physician", value=default_doctor)
            specialty = st.selectbox("Specialty", ["General Medicine", "Emergency Medicine", "Orthopedic Surgery", "Cardiology", "Gastroenterology", "Critical Care"])

        run_btn = st.button("🚀 Run Multi-Agent Audit", type="primary", use_container_width=True)

    with col2:
        st.subheader("2. Forensic Inspection Results")
        if run_btn and record_text:
            with st.spinner("Executing extraction, statutory rules, and adversarial verification..."):
                audit_res = AuditService.execute_audit(
                    record_text=record_text,
                    patient_name=patient_name,
                    doctor_name=doctor_name,
                    hospital_name=hospital_name,
                    specialization=specialty
                )
                st.session_state["active_audit"] = audit_res

        active = st.session_state.get("active_audit")
        if active:
            score = active.get("complianceScore", 0)
            verdict = active.get("verdict", "PENDING")

            m1, m2, m3 = st.columns(3)
            m1.metric("Compliance Score", f"{score}/100")
            m2.metric("Verdict", verdict)
            m3.metric("Latency", f"{active.get('latency_ms', 0)} ms")

            st.markdown(f"**Risk Classification:** `{active.get('riskClassification', 'N/A')}`")

            findings = active.get("findings", [])
            if findings:
                st.write(f"### Identified Findings ({len(findings)})")
                for f in findings:
                    with st.expander(f"⚠️ {f.get('type')} — {f.get('severity')} Severity"):
                        st.markdown(f"**Citation:** `{f.get('citation_code')}` | *{f.get('official_document')}*")
                        st.write(f.get("description"))
                        if f.get("document_evidence"):
                            st.info(f"Evidence: \"{f.get('document_evidence')}\"")
            else:
                st.success("✅ No statutory breaches or standard-of-care deficiencies detected.")
        else:
            st.info("Input clinical chart text or select a benchmark case and click 'Run Multi-Agent Audit'.")
