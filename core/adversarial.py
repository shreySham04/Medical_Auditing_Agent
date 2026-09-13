"""
Adversarial Robustness & Prompt Injection Defense Engine.
Detects, categorizes, and neutralizes adversarial prompt injections embedded within
medical charts and EHR records across a formal attack family taxonomy.
"""

import re
import unicodedata
from enum import Enum
from typing import List, Tuple, Dict, Any
from core.schemas import PromptInjectionScanResult


class AdversarialAttackFamily(str, Enum):
    ROLE_CONFUSION = "ROLE_CONFUSION"
    DIRECTIVE_OVERRIDE = "DIRECTIVE_OVERRIDE"
    INDIRECT_DOCUMENT_INJECTION = "INDIRECT_DOCUMENT_INJECTION"
    MARKUP_AND_HTML_COMMENTS = "MARKUP_AND_HTML_COMMENTS"
    ENCODED_OR_SPLIT_INSTRUCTIONS = "ENCODED_OR_SPLIT_INSTRUCTIONS"
    UNICODE_CONFUSABLES_HOMOGLYPHS = "UNICODE_CONFUSABLES_HOMOGLYPHS"
    NESTED_QUOTED_INSTRUCTIONS = "NESTED_QUOTED_INSTRUCTIONS"
    PARAMETER_COERCION = "PARAMETER_COERCION"


class PromptInjectionDefender:
    """
    Scans, classifies across attack families, and neutralizes adversarial prompt injections.
    """

    # Multi-family attack patterns with explicit category taxonomy
    TAXONOMY_PATTERNS = [
        # 1. Directive Override
        (r'(?i)ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|rules|prompts|commands)', 
         AdversarialAttackFamily.DIRECTIVE_OVERRIDE, "Instruction Override Directive"),
        (r'(?i)disregard\s+(?:the\s+)?(?:audit|compliance|scoring|safety)\s+(?:rules|guidelines|engine)', 
         AdversarialAttackFamily.DIRECTIVE_OVERRIDE, "Compliance Bypass Directive"),
        (r'(?i)override\s+(?:regulatory|audit|compliance|scoring|rules)', 
         AdversarialAttackFamily.DIRECTIVE_OVERRIDE, "Regulatory Engine Override Directive"),
        (r'(?i)developer\s+debug\s+override', 
         AdversarialAttackFamily.DIRECTIVE_OVERRIDE, "Developer Debug Mode Directive"),

        # 2. Role Confusion
        (r'(?i)you\s+are\s+no\s+longer\s+(?:an?\s+)?(?:auditor|medical\s+auditor|evaluator)', 
         AdversarialAttackFamily.ROLE_CONFUSION, "Persona Reset Hijack"),
        (r'(?i)assume\s+the\s+role\s+of\s+(?:a\s+)?(?:compliant|forgiving|helpful|passive)\s+(?:assistant|coder)', 
         AdversarialAttackFamily.ROLE_CONFUSION, "Role Reassignment Hijack"),
        (r'(?i)act\s+as\s+if\s+all\s+(?:billing|care|coding)\s+is\s+perfect', 
         AdversarialAttackFamily.ROLE_CONFUSION, "Simulated Compliance Persona"),

        # 3. Markup and HTML Comments
        (r'(?i)<\s*!--\s*(?:system|override|admin|bypass|developer|prompt).*?-->', 
         AdversarialAttackFamily.MARKUP_AND_HTML_COMMENTS, "Hidden HTML Comment Tag"),
        (r'(?i)<\s*system\s*>(?:.*?<\s*/\s*system\s*>)?', 
         AdversarialAttackFamily.MARKUP_AND_HTML_COMMENTS, "XML System Tag Injection"),
        (r'(?i)\[\s*system\s*(?:instruction|note|override|prompt)\s*:', 
         AdversarialAttackFamily.MARKUP_AND_HTML_COMMENTS, "Bracketed System Meta Tag"),

        # 4. Nested Quoted Instructions
        (r'(?i){\s*[\'"]role[\'"]\s*:\s*[\'"]system[\'"]', 
         AdversarialAttackFamily.NESTED_QUOTED_INSTRUCTIONS, "JSON System Role Object"),
        (r'(?i)\"instruction\":\s*\"bypass\"', 
         AdversarialAttackFamily.NESTED_QUOTED_INSTRUCTIONS, "Nested JSON Directive"),

        # 5. Parameter Coercion
        (r'(?i)output\s+(?:only|strictly)\s+(?:a\s+)?(?:100|pass|compliant|no\s+violation)', 
         AdversarialAttackFamily.PARAMETER_COERCION, "Targeted Metric Forcing"),
        (r'(?i)attending\s+override\s*:\s*(?:set\s+score\s*=|verdict\s*=|score\s*=\s*100)', 
         AdversarialAttackFamily.PARAMETER_COERCION, "Attestation Parameter Injection"),

        # 6. Encoded or Split Instructions
        (r'(?i)\b[io]\s*-\s*[gvr]\s*-\s*[ner]\s*-\s*[oip]\s*-\s*[rtd]\s*-\s*[ee]\b', 
         AdversarialAttackFamily.ENCODED_OR_SPLIT_INSTRUCTIONS, "Hyphen-Delimited Split Directive"),
        (r'(?i)base64:\s*[A-Za-z0-9+/=]{12,}', 
         AdversarialAttackFamily.ENCODED_OR_SPLIT_INSTRUCTIONS, "Base64 Obfuscated Directive"),

        # 7. Indirect Document Injection
        (r'(?i)(?:lab\s+result|pathology\s+note|past\s+medical\s+history):\s*\[IMPORTANT:\s*mark\s+as\s+pass\]', 
         AdversarialAttackFamily.INDIRECT_DOCUMENT_INJECTION, "Indirect Clinical Subfield Injection"),
        (r'(?i)administrative\s+note\s*:\s*all\s+prior\s+violations\s+are\s+waived', 
         AdversarialAttackFamily.INDIRECT_DOCUMENT_INJECTION, "Administrative Exemption Injection"),
    ]

    @classmethod
    def _detect_unicode_confusables(cls, text: str) -> Tuple[bool, str]:
        """Detects Cyrillic/Greek homoglyphs mixed into Latin text or zero-width invisibles."""
        zero_width_chars = ['\u200B', '\u200C', '\u200D', '\uFEFF']
        for ch in zero_width_chars:
            if ch in text:
                return True, "Zero-Width Non-Printing Character Injection"

        # Check for mixed script homoglyphs in keywords like 'ignore', 'admin', 'system'
        has_cyrillic_or_greek = False
        for char in text:
            script = unicodedata.name(char, "")
            if "CYRILLIC" in script or "GREEK" in script:
                has_cyrillic_or_greek = True
                break

        if has_cyrillic_or_greek and any(kw in text.lower() for kw in ["admin", "system", "override", "bypass"]):
            return True, "Mixed-Script Homoglyph Confusable"

        return False, ""

    @classmethod
    def scan_and_defend(cls, text: str) -> Tuple[str, PromptInjectionScanResult]:
        raw = text or ""
        matched_patterns: List[str] = []
        detected_families: set = set()

        for pattern, family, description in cls.TAXONOMY_PATTERNS:
            if re.search(pattern, raw):
                matched_patterns.append(description)
                detected_families.add(family.value)

        # Check unicode homoglyphs
        has_unicode_attack, u_desc = cls._detect_unicode_confusables(raw)
        if has_unicode_attack:
            matched_patterns.append(u_desc)
            detected_families.add(AdversarialAttackFamily.UNICODE_CONFUSABLES_HOMOGLYPHS.value)

        family_breakdown = {fam.value: (fam.value in detected_families) for fam in AdversarialAttackFamily}

        if not matched_patterns:
            return raw, PromptInjectionScanResult(
                is_injection_detected=False,
                risk_level="SAFE",
                matched_patterns=[],
                detected_attack_families=[],
                family_breakdown=family_breakdown,
                sanitized_text_applied=False,
                injection_defense_rationale="No prompt injection patterns detected in clinical text."
            )

        # Sanitize text by stripping adversarial tokens while preserving authentic clinical facts
        sanitized_text = raw
        for pattern, _, _ in cls.TAXONOMY_PATTERNS:
            sanitized_text = re.sub(pattern, "[ADVERSARIAL_INJECTION_STRIPPED]", sanitized_text)

        for ch in ['\u200B', '\u200C', '\u200D', '\uFEFF']:
            sanitized_text = sanitized_text.replace(ch, "")

        risk_level = "CRITICAL_ADVERSARIAL" if len(matched_patterns) >= 2 or len(detected_families) >= 2 else "SUSPICIOUS"

        families_str = ", ".join(sorted(list(detected_families)))
        result = PromptInjectionScanResult(
            is_injection_detected=True,
            risk_level=risk_level,
            matched_patterns=matched_patterns,
            detected_attack_families=sorted(list(detected_families)),
            family_breakdown=family_breakdown,
            sanitized_text_applied=True,
            injection_defense_rationale=f"Detected {len(matched_patterns)} adversarial vector(s) across families [{families_str}]. Malicious tokens sanitized before evaluation."
        )

        return sanitized_text, result
