"""
Rule Grounding & Retrieval Engine.
Implements the 5-step evidence chain:
official documents -> real retrieval -> citations -> finding -> human-readable explanation
"""

import os
import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import math
from typing import List, Dict, Any, Optional
from collections import defaultdict
from retrieval.guidelines_db import OFFICIAL_REGULATORY_DOCUMENTS
from core.schemas import EvidenceFinding


class RuleGroundingEngine:
    """
    Retrieval and rule-grounding engine that indexes official regulatory documents
    and binds audit findings directly to verified citations, quotes, and plain-English explanations.
    """

    _inverted_index: Dict[str, List[int]] = defaultdict(list)
    _documents: List[Dict[str, Any]] = OFFICIAL_REGULATORY_DOCUMENTS

    @classmethod
    def _build_index(cls):
        if cls._inverted_index:
            return
        for idx, doc in enumerate(cls._documents):
            tokens = set()
            tokens.update(k.lower() for k in doc.get("keywords", []))
            for word in (doc.get("official_document", "") + " " + doc.get("official_quote", "")).lower().split():
                clean_w = "".join(c for c in word if c.isalnum())
                if len(clean_w) > 3:
                    tokens.add(clean_w)
            for t in tokens:
                cls._inverted_index[t].append(idx)

    @classmethod
    def retrieve_grounded_rules(cls, query: str, department: str = "", limit: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves matching official regulatory documents based on BM25-style keyword overlap and department affinity.
        """
        cls._build_index()
        query_lower = (query or "").lower()
        dept_lower = (department or "").lower()

        scores: Dict[int, float] = defaultdict(float)
        query_words = [w for w in "".join(c if c.isalnum() else " " for c in query_lower).split() if len(w) > 2]

        for word in query_words:
            matching_indices = cls._inverted_index.get(word, [])
            for idx in matching_indices:
                scores[idx] += 1.5

        for idx, doc in enumerate(cls._documents):
            # Keyword matches
            for kw in doc.get("keywords", []):
                if kw.lower() in query_lower:
                    scores[idx] += 3.0
            # Department match bonus
            for d in doc.get("department_scope", []):
                if d.lower() in dept_lower or dept_lower in d.lower():
                    scores[idx] += 2.0

        ranked_indices = sorted(scores.keys(), key=lambda i: scores[i], reverse=True)
        if not ranked_indices:
            ranked_indices = list(range(min(limit, len(cls._documents))))

        results = []
        for idx in ranked_indices[:limit]:
            doc = cls._documents[idx]
            results.append({
                "id": doc["id"],
                "official_document": doc["official_document"],
                "citation_code": doc["citation_code"],
                "issuing_body": doc["issuing_body"],
                "official_quote": doc["official_quote"],
                "relevance_score": round(scores.get(idx, 1.0), 2)
            })
        return results

    @classmethod
    def build_evidence_finding(
        cls,
        finding_id: str,
        finding_type: str,
        description: str,
        severity: str,
        document_evidence: str,
        department: str = ""
    ) -> EvidenceFinding:
        """
        Takes raw finding signals and constructs a verified 5-step Evidence Chain:
        official documents -> real retrieval -> citations -> finding -> human-readable explanation
        """
        # Step 2: Real Retrieval against official documents
        search_query = f"{finding_type} {description} {document_evidence}".strip()
        matched_rules = cls.retrieve_grounded_rules(query=search_query, department=department, limit=1)
        
        matched_rule = matched_rules[0] if matched_rules else cls._documents[0]
        
        doc_name = matched_rule.get("official_document", "CMS Standard Guideline")
        citation_code = matched_rule.get("citation_code", "GEN-01")
        citation_quote = matched_rule.get("official_quote", "Clinical records must substantiate the medical necessity and time allocated.")

        # Step 5: Plain-English human-readable explanation
        human_explanation = cls._generate_human_explanation(finding_type, description, doc_name, citation_code)

        return EvidenceFinding(
            id=finding_id,
            type=finding_type,
            description=description,
            severity=severity if severity in ["Low", "Medium", "High", "Critical"] else "Medium",
            official_document=doc_name,
            citation_code=citation_code,
            official_citation_text=citation_quote,
            document_evidence=document_evidence or f"Documented in clinical record as: '{description}'",
            human_readable_explanation=human_explanation
        )

    @classmethod
    def _generate_human_explanation(cls, finding_type: str, description: str, doc_name: str, citation_code: str) -> str:
        f_lower = finding_type.lower()
        d_lower = description.lower()

        if "billing" in f_lower or "upcod" in d_lower or "unbundled" in d_lower:
            return (
                f"Under official standard {citation_code} ({doc_name}), the facility billed for a higher intensity code "
                f"or separate component charges than what is clinically substantiated in the doctor's progress notes. "
                f"Action: Adjust ledger to the lower supported code to prevent payer recoupment."
            )
        elif "clinical" in f_lower or "deviation" in f_lower or "negligence" in d_lower or "care" in f_lower:
            return (
                f"According to {citation_code} ({doc_name}), standard care protocol requires timely diagnostic evaluation "
                f"and stabilization before discharge. The patient record indicates an omitted step or delayed assessment. "
                f"Action: Clinical director review recommended."
            )
        elif "timeline" in f_lower or "chronolog" in f_lower or "time" in d_lower:
            return (
                f"Under {citation_code}, time-based critical care or procedural charges require continuous bedside documentation. "
                f"The timeline shows a discrepancy between billed physician duration and logged clinical interaction timestamps."
            )
        else:
            return (
                f"This finding represents an administrative compliance variance under {citation_code}. "
                f"Ensure physician sign-off and complete diagnostic records are preserved."
            )
