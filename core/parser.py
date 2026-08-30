"""
Robust structured output parsing and schema validation.
Replaces brittle regex parsing with structured JSON decoding, field coercion,
and validated model construction.
"""

import os
import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import json
from typing import Dict, Any, TypeVar, Type, Optional
from core.schemas import (
    ClinicalAgentOutput,
    BillingAgentOutput,
    DocumentationAgentOutput,
    TimelineAgentOutput,
    EvidenceFinding
)

T = TypeVar("T")


def clean_json_text(text: str) -> str:
    """
    Cleans markdown code fences and whitespace from LLM output.
    """
    if not text:
        return ""
    text = text.strip()
    # Remove markdown ```json ... ``` blocks
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def extract_structured_json(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Attempts to parse JSON directly from clean text or locates the top-level JSON object.
    """
    if not raw_text:
        return None
    
    cleaned = clean_json_text(raw_text)
    
    # 1. Direct JSON parse
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    
    # 2. Balanced bracket scan (robust against nested objects and trailing notes)
    start_idx = cleaned.find("{")
    if start_idx != -1:
        depth = 0
        in_string = False
        escape = False
        for idx in range(start_idx, len(cleaned)):
            char = cleaned[idx]
            if char == '"' and not escape:
                in_string = not in_string
            elif not in_string:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = cleaned[start_idx:idx + 1]
                        try:
                            data = json.loads(candidate)
                            if isinstance(data, dict):
                                return data
                        except Exception:
                            pass
                        break
            escape = (char == '\\' and not escape)
            
    return None


def validate_clinical_output(data_or_text: Any) -> ClinicalAgentOutput:
    """
    Validates and enforces ClinicalAgentOutput schema.
    """
    raw_dict = extract_structured_json(data_or_text) if isinstance(data_or_text, str) else (data_or_text if isinstance(data_or_text, dict) else {})
    
    score = raw_dict.get("clinical_score")
    try:
        score_val = int(score) if score is not None else 85
        score_val = max(0, min(100, score_val))
    except (ValueError, TypeError):
        score_val = 85

    grade = raw_dict.get("clinical_grade") or ("A" if score_val >= 90 else ("B" if score_val >= 80 else ("C" if score_val >= 60 else "D")))
    standard = str(raw_dict.get("adherence_standard") or "AHA/ACC Standard Practice Guidelines 2026")
    
    gaps = raw_dict.get("clinical_gaps")
    gaps_list = [str(g) for g in gaps] if isinstance(gaps, list) else []
    
    positives = raw_dict.get("positive_indicators")
    pos_list = [str(p) for p in positives] if isinstance(positives, list) else []

    citations = raw_dict.get("evidence_citations")
    citations_list = citations if isinstance(citations, list) else []

    critique = str(raw_dict.get("critique_markdown") or "")

    return ClinicalAgentOutput(
        agent_name="Clinical Auditor",
        clinical_score=score_val,
        clinical_grade=grade,
        adherence_standard=standard,
        clinical_gaps=gaps_list,
        positive_indicators=pos_list,
        evidence_citations=citations_list,
        critique_markdown=critique
    )


def validate_billing_output(data_or_text: Any) -> BillingAgentOutput:
    """
    Validates and enforces BillingAgentOutput schema.
    """
    raw_dict = extract_structured_json(data_or_text) if isinstance(data_or_text, str) else (data_or_text if isinstance(data_or_text, dict) else {})
    
    score = raw_dict.get("billing_score")
    try:
        score_val = int(score) if score is not None else 85
        score_val = max(0, min(100, score_val))
    except (ValueError, TypeError):
        score_val = 85

    grade = raw_dict.get("billing_grade") or ("A" if score_val >= 90 else ("B" if score_val >= 80 else ("C" if score_val >= 60 else "D")))
    standard = str(raw_dict.get("billing_standard_used") or "AMA CPT 2026 / CMS NCCI Policy Standards")
    
    anomalies = raw_dict.get("billing_anomalies")
    anom_list = [str(a) for a in anomalies] if isinstance(anomalies, list) else []
    
    credits = raw_dict.get("fair_pricing_credits")
    credits_list = [str(c) for c in credits] if isinstance(credits, list) else []

    citations = raw_dict.get("evidence_citations")
    citations_list = citations if isinstance(citations, list) else []

    financial_md = str(raw_dict.get("financial_markdown") or "")

    return BillingAgentOutput(
        agent_name="Billing Auditor",
        billing_score=score_val,
        billing_grade=grade,
        billing_standard_used=standard,
        billing_anomalies=anom_list,
        fair_pricing_credits=credits_list,
        evidence_citations=citations_list,
        financial_markdown=financial_md
    )


def validate_documentation_output(data_or_text: Any) -> DocumentationAgentOutput:
    """
    Validates and enforces DocumentationAgentOutput schema.
    """
    raw_dict = extract_structured_json(data_or_text) if isinstance(data_or_text, str) else (data_or_text if isinstance(data_or_text, dict) else {})
    
    score = raw_dict.get("documentation_score")
    try:
        score_val = int(score) if score is not None else 90
        score_val = max(0, min(100, score_val))
    except (ValueError, TypeError):
        score_val = 90

    grade = raw_dict.get("documentation_grade") or ("A" if score_val >= 90 else "C")
    sig = bool(raw_dict.get("signature_validated", True))
    
    missing = raw_dict.get("missing_required_fields")
    missing_list = [str(m) for m in missing] if isinstance(missing, list) else []

    present = raw_dict.get("present_elements")
    present_list = [str(p) for p in present] if isinstance(present, list) else []

    critique = str(raw_dict.get("documentation_critique") or "")

    return DocumentationAgentOutput(
        agent_name="Documentation Agent",
        documentation_score=score_val,
        documentation_grade=grade,
        signature_validated=sig,
        missing_required_fields=missing_list,
        present_elements=present_list,
        documentation_critique=critique
    )


def validate_timeline_output(data_or_text: Any) -> TimelineAgentOutput:
    """
    Validates and enforces TimelineAgentOutput schema.
    """
    raw_dict = extract_structured_json(data_or_text) if isinstance(data_or_text, str) else (data_or_text if isinstance(data_or_text, dict) else {})
    
    score = raw_dict.get("timeline_score")
    try:
        score_val = int(score) if score is not None else 90
        score_val = max(0, min(100, score_val))
    except (ValueError, TypeError):
        score_val = 90

    grade = raw_dict.get("timeline_grade") or ("A" if score_val >= 90 else "C")
    
    events = raw_dict.get("reconstructed_timeline")
    events_list = []
    if isinstance(events, list):
        for e in events:
            if isinstance(e, dict):
                events_list.append({"time": str(e.get("time", "")), "event": str(e.get("event", ""))})

    inconsistencies = raw_dict.get("timeline_inconsistencies")
    inc_list = [str(i) for i in inconsistencies] if isinstance(inconsistencies, list) else []

    critique = str(raw_dict.get("temporal_critique") or "")

    return TimelineAgentOutput(
        agent_name="Timeline Agent",
        timeline_score=score_val,
        timeline_grade=grade,
        reconstructed_timeline=events_list,
        timeline_inconsistencies=inc_list,
        temporal_critique=critique
    )
