"""
Main Modular Application Entry Point.
Coordinates configuration, routing, and sub-components for MedicalAuditor V2.1.
"""

try:
    import streamlit as st
    HAS_STREAMLIT = True
except ImportError:
    st = None
    HAS_STREAMLIT = False

from app.config import APP_TITLE, APP_ICON
from app.routes.audit import render_audit_view
from app.routes.benchmark import render_benchmark_view
from app.routes.reports import render_reports_view


def main():
    if not HAS_STREAMLIT:
        print(f"Starting {APP_TITLE} (Headless Mode - Streamlit not installed)")
        print("Use FastAPI backend via fastapi_app.py or React frontend via server.js.")
        return
    st.set_page_config(
        page_title=APP_TITLE,
        page_icon=APP_ICON,
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.markdown("""
    <style>
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
        }
        [data-testid="stSidebar"] {
            background-color: #0d1117 !important;
            border-right: 1px solid #21262D !important;
        }
        .stButton>button {
            background-color: #21262D !important;
            color: #C9D1D9 !important;
            border: 1px solid #30363D !important;
            border-radius: 8px !important;
        }
        .stButton>button:hover {
            background-color: #30363D !important;
            color: #F0F6FC !important;
        }
        [data-testid="stMetricValue"] {
            color: #58A6FF !important;
        }
    </style>
    """, unsafe_allow_html=True)

    with st.sidebar:
        st.title("🛡️ MedicalAuditor")
        st.caption("Evidence-Grounded Compliance Engine v2.1")
        st.markdown("---")
        nav_choice = st.radio(
            "Navigation",
            ["🔍 Clinical Investigator", "📊 Benchmark & Ablations", "📑 Audit Reports & History"],
            index=0
        )
        st.markdown("---")
        st.info("Statutory Grounding: CMS NCCI 2026, AMA CPT v24, Surviving Sepsis 2021.")

    if nav_choice == "🔍 Clinical Investigator":
        render_audit_view()
    elif nav_choice == "📊 Benchmark & Ablations":
        render_benchmark_view()
    elif nav_choice == "📑 Audit Reports & History":
        render_reports_view()


if __name__ == "__main__":
    main()
