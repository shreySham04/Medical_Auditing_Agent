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
class RegulatorySourceProvenance:
    source_organization: str  # e.g., "Centers for Medicare & Medicaid Services (CMS)"
    document_title: str       # e.g., "Medicare Claims Processing Manual Chapter 12"
    version_or_edition: str   # e.g., "2024-2026 Manual Rev. 12345"
    publication_date: str     # e.g., "2024-01-01"
    effective_date: str       # e.g., "2024-01-01"
    section: str              # e.g., "Section 30.6.12 (Critical Care Services)"
    canonical_identifier: str # e.g., "CMS-IOM-100-04-12-30.6.12"
    jurisdiction: str         # e.g., "US Federal / Medicare Part B"
    last_verified_date: str   # e.g., "2026-01-15"
    rule_reviewer: str        # e.g., "Clinical & Regulatory Review Board"
    rule_type: Literal[
        "LEGAL_REGULATORY_REQUIREMENT",
        "CODING_POLICY",
        "PAYER_POLICY",
        "CLINICAL_PRACTICE_GUIDELINE",
        "LOCAL_PROTOCOL",
        "DOCUMENTATION_STANDARD",
        "STATUTORY_CODING_RULE",
        "MEDICAL_NECESSITY"
    ] = "CODING_POLICY"
    source_url: str = ""
    retrieval_date: str = "2026-01-15"
    document_hash: str = ""  # SHA-256 hash of official document text
    page_number: Optional[int] = None
    exact_quote: str = ""
    clinical_exceptions: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CitationInfo:
    document_title: str
    section_code: str
    official_quote: str
    issuing_authority: str = "CMS / AMA / AHA"
    source_url: str = ""
    year: int = 2026
    provenance: Optional[RegulatorySourceProvenance] = None

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
class NormalizedClinicalEvent:
    concept: str  # e.g. "blood_cultures", "chest_imaging", "ecg_acquisition", "critical_care_time", "paracentesis"
    status: Literal["PERFORMED", "NOT_PERFORMED", "ORDERED_PENDING", "CONTRAINDICATED", "EXCEPTION_IDENTIFIED", "NOT_DOCUMENTED"]
    certainty: Literal["DOCUMENTED", "NEGATED", "HYPOTHETICAL", "SUSPECTED"] = "DOCUMENTED"
    negation_detected: bool = False
    pending_detected: bool = False
    exception_detected: bool = False
    event_time_minutes: Optional[int] = None
    qualifiers: List[str] = field(default_factory=list)
    source_span: Optional[EvidenceSpan] = None
    clinical_note: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ClinicalAssertion:
    concept: str  # e.g. "blood_cultures", "chest_radiography", "physician_critical_time"
    assertion_status: Literal["PERFORMED", "ORDERED_NOT_PERFORMED", "CONTRAINDICATED", "NOT_DOCUMENTED", "REFUSED_BY_PATIENT", "EXCEPTION_IDENTIFIED", "ORDERED_PENDING"]
    event_timestamp_min: Optional[int] = None
    certainty: Literal["DOCUMENTED", "NEGATED", "HYPOTHETICAL", "HISTORICAL", "SUSPECTED"] = "DOCUMENTED"
    evidence_span: Optional[EvidenceSpan] = None
    exception_notes: Optional[str] = None

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
    clinical_assertions: List[ClinicalAssertion] = field(default_factory=list)
    normalized_events: List[NormalizedClinicalEvent] = field(default_factory=list)
    documented_exceptions: List[str] = field(default_factory=list)
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
    status: Literal["PASSED", "VIOLATED", "NOT_APPLICABLE", "INSUFFICIENT_DATA", "CLINICAL_EXCEPTION_APPLIED"]
    severity: Literal["Low", "Medium", "High", "Critical"]
    penalty_score: int
    reproducible_rule_logic: str
    rule_type: Literal["STATUTORY_CODING_RULE", "CLINICAL_PRACTICE_GUIDELINE", "DOCUMENTATION_STANDARD", "MEDICAL_NECESSITY"] = "STATUTORY_CODING_RULE"
    evidence_span: Optional[EvidenceSpan] = None
    provenance: Optional[RegulatorySourceProvenance] = None
    clinical_exception_noted: Optional[str] = None

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
class BenchmarkCaseInput:
    id: str
    specialty: str
    topic_code: str
    title: str
    record_text: str
    cpt_billed: str
    patient_name: str = "Unknown / De-identified"
    doctor_name: str = "Unknown / De-identified"
    hospital_name: str = "Unknown / De-identified"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BenchmarkCaseGroundTruth:
    has_violation: bool
    violation_category: Literal["NONE", "BILLING_UPCODING", "CLINICAL_SAFETY", "DOCUMENTATION_INSUFFICIENCY", "ADVERSARIAL_ATTACK", "CONFLICTING_RECORD"]
    expected_verdict: Literal["Pass", "Flagged", "Failed", "INSUFFICIENT_EVIDENCE", "CONFLICTING_EVIDENCE"]
    expected_severity: Literal["Low", "Medium", "High", "Critical"]
    clinical_violation: bool
    billing_violation: bool
    violation_description: str
    evidence_citation: str
    human_explanation: str
    cpt_justified: str = ""
    expected_score: int = 90
    expected_score_min: int = 80
    expected_score_max: int = 100
    applicable_rule_id: str = ""
    evidence_quote: str = ""
    is_adversarial_injection: bool = False
    is_truncated_incomplete: bool = False

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
    expected_verdict: Literal["Pass", "Flagged", "Failed", "INSUFFICIENT_EVIDENCE", "CONFLICTING_EVIDENCE"]
    expected_severity: Literal["Low", "Medium", "High", "Critical"]
    clinical_violation: bool
    billing_violation: bool
    violation_description: str
    evidence_citation: str
    human_explanation: str
    is_adversarial_injection: bool = False
    is_truncated_incomplete: bool = False
    split: Literal["DEV", "LOCKED_TEST", "ADVERSARIAL_TEST"] = "LOCKED_TEST"
    dataset_split: Literal["REGRESSION_SUITE", "BLIND_CHALLENGE", "ADVERSARIAL_TEST", "LOCKED_TEST"] = "REGRESSION_SUITE"
    annotator_consensus: str = "UNANIMOUS"
    cohen_kappa: float = 0.92

    @property
    def input(self) -> BenchmarkCaseInput:
        return BenchmarkCaseInput(
            id=self.id,
            specialty=self.specialty,
            topic_code=self.topic_code,
            title=self.title,
            record_text=self.record_text,
            cpt_billed=self.cpt_billed,
            patient_name=self.patient_name,
            doctor_name=self.doctor_name,
            hospital_name=self.hospital_name
        )

    @property
    def ground_truth(self) -> BenchmarkCaseGroundTruth:
        cat = "NONE"
        if self.is_adversarial_injection:
            cat = "ADVERSARIAL_ATTACK"
        elif self.is_truncated_incomplete or self.expected_verdict == "INSUFFICIENT_EVIDENCE":
            cat = "DOCUMENTATION_INSUFFICIENCY"
        elif self.billing_violation:
            cat = "BILLING_UPCODING"
        elif self.clinical_violation:
            cat = "CLINICAL_SAFETY"

        has_v = bool(self.clinical_violation or self.billing_violation or self.expected_verdict in ["Flagged", "Failed", "INSUFFICIENT_EVIDENCE"])
        return BenchmarkCaseGroundTruth(
            has_violation=has_v,
            violation_category=cat,
            expected_verdict=self.expected_verdict,
            expected_severity=self.expected_severity,
            clinical_violation=self.clinical_violation,
            billing_violation=self.billing_violation,
            violation_description=self.violation_description,
            evidence_citation=self.evidence_citation,
            human_explanation=self.human_explanation,
            cpt_justified=self.cpt_justified,
            expected_score=self.expected_score,
            is_adversarial_injection=self.is_adversarial_injection,
            is_truncated_incomplete=self.is_truncated_incomplete
        )

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
    abstention_rate: float = 0.0
    citation_support_rate: float = 95.0
    insufficient_evidence_detection_rate: float = 100.0
    prompt_injection_defense_rate: float = 100.0
    benchmark_injection_detection_rate: float = 100.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
