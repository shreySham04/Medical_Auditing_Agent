"""
MedicalAuditor V2.1 Streamlit Entry Point.
Delegates to the modularized application structure in app/.
"""

import sys
from pathlib import Path

# Ensure root is in python path
sys.path.insert(0, str(Path(__file__).parent))

from app.main import main

if __name__ == "__main__":
    main()
