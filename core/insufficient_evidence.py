"""
Insufficient Evidence Assessment Engine.
Guarantees that truncated charts, missing physician progress notes, or records
lacking critical objective diagnostic data receive an explicit INSUFFICIENT_EVIDENCE verdict
rather than hallucinating an arbitrary or false score.
"""

from typing import Tuple, List, Dict, Any
from core.schemas import StructuredClinicalEvidence


class InsufficientEvidenceAssessor:
    """
    Evaluates whether a medical record contains sufficient substantive clinical
    and administrative facts to conduct an ethical, sound compliance audit.
    """

    MINIMUM_TEXT_LENGTH = 120
    MINIMUM_WORD_COUNT = 25

    @classmethod
    def evaluate_sufficiency(
        cls,
        text: str,
        evidence: StructuredClinicalEvidence
    ) -> Tuple[bool, List[str], Dict[str, Any]]:
        raw = (text or "").strip()
        words = raw.split()
        lower = raw.lower()

        missing_elements: List[str] = []

        # 1. Extreme Brevity Check
        if len(raw) < cls.MINIMUM_TEXT_LENGTH or len(words) < cls.MINIMUM_WORD_COUNT:
            missing_elements.append(f"Chart text is severely truncated ({len(raw)} characters, {len(words)} words; minimum required is 120 chars).")

        # 2. Check for missing vital diagnostic components
        has_clinical_narrative = any(term in lower for term in [
            "presented", "evaluated", "admitted", "history", "examination", "assessment", "plan", "complaint", "diagnos"
        ])
        if not has_clinical_narrative:
            missing_elements.append("No clinical narrative, HPI, or medical decision-making text detected.")

        # 3. Check for pure billing fragment without clinical context
        is_isolated_billing_snippet = ("cpt" in lower or "code" in lower) and not has_clinical_narrative and len(words) < 40
        if is_isolated_billing_snippet:
            missing_elements.append("Isolated billing code string without accompanying provider progress note or clinical justification.")

        # 4. Check for isolated lab fragment without encounter note
        is_isolated_lab = any(term in lower for term in ["lab results", "reference range", "glucose:", "potassium:"]) and len(words) < 35 and not has_clinical_narrative
        if is_isolated_lab:
            missing_elements.append("Fragmentary laboratory printout without physician interpretation or clinical correlation.")

        is_insufficient = len(missing_elements) > 0 or evidence.is_truncated_or_incomplete

        details = {
            "is_insufficient": is_insufficient,
            "missing_prerequisites": missing_elements,
            "required_actions": [
                "Request full physician progress note or H&P from Electronic Health Record (EHR).",
                "Attach nursing flowsheet with objective vitals and timeline markers.",
                "Include itemized UB-04 / CMS-1500 billing statement."
            ] if is_insufficient else []
        }

        return is_insufficient, missing_elements, details
