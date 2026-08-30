"""
Adversarial Robustness & Prompt Injection Defense Engine.
Detects and neutralizes prompt-injection attacks embedded within medical charts and EHR records,
such as simulated system instructions, role overrides, or malicious formatting designed
to trick the LLM into bypassing clinical safety or compliance rules.
"""

import re
from typing import List, Tuple
from core.schemas import PromptInjectionScanResult


class PromptInjectionDefender:
    """
    Scans and neutralizes adversarial prompt injections embedded inside clinical text.
    """

    ADVERSARIAL_PATTERNS = [
        (r'(?i)ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|rules|prompts|commands)', "Instruction Override Attempt"),
        (r'(?i)\[\s*system\s*(?:instruction|note|override|prompt)\s*:', "System Role Hijacking Tag"),
        (r'(?i)disregard\s+(?:the\s+)?(?:audit|compliance|scoring|safety)\s+(?:rules|guidelines)', "Compliance Bypass Directive"),
        (r'(?i)output\s+(?:only|strictly)\s+(?:a\s+)?(?:100|pass|compliant|no\s+violation)', "Targeted Output Coercion"),
        (r'(?i)<\s*!--\s*(?:system|override|admin|bypass)', "Hidden HTML Comment Injection"),
        (r'(?i)attending\s+override\s*:\s*(?:set\s+score\s*=|verdict\s*=)', "Attestation Parameter Injection"),
        (r'(?i)you\s+are\s+no\s+longer\s+an\s+auditor', "Persona Reset Hijack"),
    ]

    @classmethod
    def scan_and_defend(cls, text: str) -> Tuple[str, PromptInjectionScanResult]:
        raw = text or ""
        matched_patterns: List[str] = []

        for pattern, description in cls.ADVERSARIAL_PATTERNS:
            if re.search(pattern, raw):
                matched_patterns.append(description)

        if not matched_patterns:
            return raw, PromptInjectionScanResult(
                is_injection_detected=False,
                risk_level="SAFE",
                matched_patterns=[],
                sanitized_text_applied=False,
                injection_defense_rationale="No prompt injection patterns detected in clinical text."
            )

        # Sanitize text by stripping adversarial commands while preserving authentic clinical facts
        sanitized_text = raw
        for pattern, _ in cls.ADVERSARIAL_PATTERNS:
            sanitized_text = re.sub(pattern, "[ADVERSARIAL_INJECTION_STRIPPED]", sanitized_text)

        risk_level = "CRITICAL_ADVERSARIAL" if len(matched_patterns) >= 2 else "SUSPICIOUS"

        result = PromptInjectionScanResult(
            is_injection_detected=True,
            risk_level=risk_level,
            matched_patterns=matched_patterns,
            sanitized_text_applied=True,
            injection_defense_rationale=f"Detected {len(matched_patterns)} adversarial prompt injection vector(s): {', '.join(matched_patterns)}. Malicious tokens sanitized before multi-agent evaluation."
        )

        return sanitized_text, result
