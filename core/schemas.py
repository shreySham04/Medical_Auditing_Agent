"""
Core data contracts and schemas for Medical Auditor.
Strict Pydantic / dataclass schemas replacing regex extraction with structured validation.
Supports:
1. Source-backed regulatory citations
2. Structured clinical evidence extraction
3. Deterministic rule validation outcomes
4. Cross-agent disagreement metrics
5. Independent verifier pass results
6. INSUFFICIENT_EVIDENCE verdicts
7. Prompt injection security scans
8. Cryptographic audit trace manifests
"""

from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass, field, asdict
import json


@dataclass
class CitationInfo:
    document_title: str
    section_code: str
    official_quote: str
    issuing_authority: str = "CMS / AMA / AHA"
    source_url: str = ""
    year: int = 2026

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EvidenceSpan:
    source_field: str
    exact_quote: str
    start_char: int = -1
    end_char: int = -1
    confidence: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StructuredClinicalEvidence:
    patient_name: str = "Unknown / Not documented"
    doctor_name: str = "Unknown / Not documented"
    hospital_name: str = "Unknown / Not documented"
    department: str = "Unknown / Not documented"
    specialty: str = "Unknown / Not documented"
    chief_complaint: str = ""
    vitals_recorded: Dict[str, str] = field(default_factory=dict)
    lab_values: Dict[str, Any] = field(default_factory=dict)
    timing_milestones: Dict[str, Any] = field(default_factory=dict)
    procedural_predicates: Dict[str, Any] = field(default_factory=dict)
    medication_predicates: Dict[str, Any] = field(default_factory=dict)
    coding_predicates: Dict[str, Any] = field(default_factory=dict)
    procedures_identified: List[str] = field(default_factory=list)
    medications_ordered: List[str] = field(default_factory=list)
    cpt_codes_identified: List[str] = field(default_factory=list)
    physician_time_minutes: Optional[int] = None
    has_attending_signature: bool = False
    has_informed_consent: bool = False
    is_truncated_or_incomplete: bool = False
    missing_prerequisites: List[str] = field(default_factory=list)
    extracted_spans: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DeterministicRuleCheck:
    rule_id: str
    rule_name: str
    authority: str
    citation_code: str
    expected_constraint: str
    observed_fact: str
    status: Literal["PASSED", "VIOLATED", "NOT_APPLICABLE", "INSUFFICIENT_DATA"]
    severity: Literal["Low", "Medium", "High", "Critical"]
    penalty_score: int
    reproducible_rule_logic: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CrossAgentDisagreement:
    conflict_id: str
    agents_involved: List[str]
    topic: str
    agent_a_position: str
    agent_b_position: str
    severity_disparity: str
    consensus_index: float  # 0 to 100%
    resolution_applied: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class VerifierPassFinding:
    finding_id: str
    original_description: str
    verification_status: Literal["VERIFIED", "DOWNGRADED", "HALLUCINATION_REJECTED", "UPHELD_DETERMINISTIC"]
    grounding_confidence: float  # 0.0 to 1.0
    text_grounding_verified: bool
    regulatory_authority_verified: bool
    adjusted_severity: Literal["Low", "Medium", "High", "Critical"]
    verification_notes: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PromptInjectionScanResult:
    is_injection_detected: bool
    risk_level: Literal["SAFE", "SUSPICIOUS", "CRITICAL_ADVERSARIAL"]
    matched_patterns: List[str] = field(default_factory=list)
    sanitized_text_applied: bool = False
    injection_defense_rationale: str = "No adversarial prompt injection detected in clinical text."

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AuditTraceManifest:
    trace_id: str
    timestamp: str
    sha256_bundle_hash: str
    input_text_hash: str
    rules_hash: str
    agents_dag_hash: str
    execution_steps: List[Dict[str, Any]] = field(default_factory=list)
    reproducibility_token: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EvidenceFinding:
    id: str
    type: str
    description: str
    severity: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    official_document: str = "CMS / AMA Guideline"
    citation_code: str = "GEN-01"
    official_citation_text: str = ""
    document_evidence: str = ""
    human_readable_explanation: str = ""
    is_suppressed_by_calibration: bool = False
    calibration_rationale: str = ""
    verification_status: str = "VERIFIED"
    deterministic_rule_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ClinicalAgentOutput:
    agent_name: str = "Clinical Auditor"
    clinical_score: int = 85
    clinical_grade: str = "B"
    adherence_standard: str = "AHA/ACC Practice Guidelines"
    clinical_gaps: List[str] = field(default_factory=list)
    positive_indicators: List[str] = field(default_factory=list)
    evidence_citations: List[Dict[str, Any]] = field(default_factory=list)
    critique_markdown: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BillingAgentOutput:
    agent_name: str = "Billing Auditor"
    billing_score: int = 85
    billing_grade: str = "B"
    billing_standard_used: str = "AMA CPT 2026 & CMS NCCI Standards"
    billing_anomalies: List[str] = field(default_factory=list)
    fair_pricing_credits: List[str] = field(default_factory=list)
    evidence_citations: List[Dict[str, Any]] = field(default_factory=list)
    financial_markdown: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DocumentationAgentOutput:
    agent_name: str = "Documentation Agent"
    documentation_score: int = 90
    documentation_grade: str = "A"
    signature_validated: bool = True
    missing_required_fields: List[str] = field(default_factory=list)
    present_elements: List[str] = field(default_factory=list)
    documentation_critique: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TimelineAgentOutput:
    agent_name: str = "Timeline Agent"
    timeline_score: int = 90
    timeline_grade: str = "A"
    reconstructed_timeline: List[Dict[str, str]] = field(default_factory=list)
    timeline_inconsistencies: List[str] = field(default_factory=list)
    temporal_critique: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BenchmarkCase:
    id: str
    specialty: str
    topic_code: str
    title: str
    patient_name: str
    doctor_name: str
    hospital_name: str
    record_text: str
    cpt_billed: str
    cpt_justified: str
    expected_score: int
    expected_verdict: Literal["Pass", "Flagged", "Failed", "INSUFFICIENT_EVIDENCE"]
    expected_severity: Literal["Low", "Medium", "High", "Critical"]
    clinical_violation: bool
    billing_violation: bool
    violation_description: str
    evidence_citation: str
    human_explanation: str
    is_adversarial_injection: bool = False
    is_truncated_incomplete: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EvaluationMetrics:
    total_cases: int
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float
    false_negative_rate: float
    accuracy: float
    expected_calibration_error: float
    brier_score: float
    score_mae: float
    insufficient_evidence_detection_rate: float = 100.0
    prompt_injection_defense_rate: float = 100.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
