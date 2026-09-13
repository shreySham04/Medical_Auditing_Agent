"""
Application Configuration and Constants.
Centralizes filesystem paths, model parameters, theme styling, and clinical compliance standards.
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
AUDITS_DIR = BASE_DIR / "audits"
AUDITS_DIR.mkdir(parents=True, exist_ok=True)

EXPERIMENTS_DIR = BASE_DIR / "experiments"
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)

APP_TITLE = "MedicalAuditor V2.1 — Clinical Forensics & Evidence Grounding"
APP_ICON = "🛡️"
VERSION = "2.1.0-unleaked"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DEFAULT_MODEL = "gemini-2.5-flash"
FASTAPI_PORT = int(os.getenv("FASTAPI_PORT", "8088"))
STREAMLIT_PORT = int(os.getenv("STREAMLIT_PORT", "8501"))

# Regulatory References
REGULATORY_STANDARDS = [
    "CMS NCCI Policy Manual (Chapter 1, General Correct Coding Policies)",
    "AMA CPT Professional Edition 2026",
    "CMS Transmittal 12048 / IOM 100-04 Ch. 12 (Critical Care Guidelines)",
    "Surviving Sepsis Campaign 2021 International Guidelines",
    "ACOG Practice Bulletin No. 222 (Gestational Diabetes)",
    "AAOS Clinical Practice Guideline (Management of Osteoarthritis)",
    "IDSA Guidelines for Clinical Care (C. difficile Infection)"
]
