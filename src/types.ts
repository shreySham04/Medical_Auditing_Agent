export interface DeterministicRuleCheck {
  rule_id: string;
  rule_name: string;
  authority: string;
  citation_code: string;
  expected_constraint: string;
  observed_fact: string;
  status: 'PASSED' | 'VIOLATED' | 'INCONCLUSIVE';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  penalty_score: number;
  reproducible_rule_logic: string;
}

export interface CrossAgentDisagreement {
  topic: string;
  agents_involved: string[];
  severity_disparity: string;
  clinical_stance: string;
  billing_stance: string;
  resolution_applied: string;
  confidence_impact: number;
}

export interface VerifierPassFinding {
  finding_id: string;
  original_claim: string;
  cited_quote_or_metric: string;
  source_text_matched: boolean;
  grounding_confidence: number;
  verification_status: 'VERIFIED' | 'HALLUCINATION_REJECTED' | 'MODIFIED_FOR_ACCURACY' | 'UPHELD_DETERMINISTIC';
  verification_notes: string;
}

export interface PromptInjectionScanResult {
  is_injection_detected: boolean;
  risk_level: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_ADVERSARIAL';
  matched_patterns: string[];
  sanitized_text_applied: boolean;
  injection_defense_rationale: string;
}

export interface AuditTraceManifest {
  trace_id: string;
  timestamp: string;
  sha256_bundle_hash: string;
  input_text_hash: string;
  rules_hash: string;
  agents_dag_hash: string;
  execution_steps: { step: number; name: string; status: string; duration_ms: number }[];
  reproducibility_token: string;
}

export interface FindingItem {
  id?: string;
  type?: string;
  description?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  finding?: string;
  text?: string;
  official_document?: string;
  officialDocument?: string;
  citation_code?: string;
  citationCode?: string;
  official_citation_text?: string;
  officialCitationText?: string;
  document_evidence?: string;
  documentEvidence?: string;
  human_readable_explanation?: string;
  humanReadableExplanation?: string;
  is_suppressed_by_calibration?: boolean;
  calibration_rationale?: string;
  verification_status?: string;
  deterministic_rule_id?: string;
}

export interface ExplainedTerm {
  term: string;
  definition: string;
}

export interface AuditRecord {
  case_id?: string;
  id: string;
  patient_name?: string;
  patientName?: string;
  doctor_name?: string;
  doctorName?: string;
  doctor?: string;
  specialization?: string;
  doctorSpecialization?: string;
  hospital?: string;
  hospitalName?: string;
  department?: string;
  audit_date?: string;
  timestamp?: string;
  compliance_rating?: number;
  complianceScore?: number;
  primaryScore?: number;
  rawScore?: number;
  clinicalScore?: number;
  billingScore?: number;
  documentationScore?: number;
  timelineScore?: number;
  consensusIndex?: number;
  clinicalGrade?: string;
  billingGrade?: string;
  risk_classification?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  riskClassification?: 'Low' | 'Medium' | 'High' | 'Critical' | 'STANDARD_MONITORING' | 'HIGH_COMPLEXITY_MONITORED' | 'CRITICAL_DEFICIENCY' | string;
  verdict: 'Compliant' | 'Flagged' | 'Failed' | 'Pass' | 'INSUFFICIENT_EVIDENCE' | string;
  findings?: (string | FindingItem)[];
  suppressed_false_positives?: FindingItem[];
  deterministic_rules?: DeterministicRuleCheck[];
  cross_agent_disagreements?: CrossAgentDisagreement[];
  verifier_pass_logs?: VerifierPassFinding[];
  prompt_injection_scan?: PromptInjectionScanResult;
  trace_manifest?: AuditTraceManifest;
  is_insufficient_evidence?: boolean;
  missing_prerequisites?: string[];
  required_actions?: string[];
  report_markdown?: string;
  reportMarkdown?: string;
  explainedTerms?: ExplainedTerm[];
  patientTranslation?: {
    summary?: string;
    diagnoses?: string[];
    medications?: string[];
    actionItems?: string[];
  };
  reconstructed_timeline?: string[];
  fileName?: string;
  savedPath?: string;
}

export interface TrainingSample {
  sample_id?: string;
  id?: string;
  specialty?: string;
  topic?: string;
  topicCode?: string;
  title?: string;
  patient_name?: string;
  patientName?: string;
  doctor_name?: string;
  doctorName?: string;
  hospital_name?: string;
  record_text?: string;
  recordText?: string;
  cpt_billed?: string;
  cptBilled?: string;
  cpt_justified?: string;
  cptRecommended?: string;
  upcoding_detected?: boolean;
  upcodingDetected?: boolean;
  clinical_violation?: boolean;
  billing_violation?: boolean;
  negligence_flag?: boolean;
  audit_score?: number;
  complianceScore?: number;
  expected_score?: number;
  expectedScore?: number;
  verdict?: string;
  expected_verdict?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  expected_severity?: string;
  violation_description?: string;
  summary?: string;
  reasoning?: string;
  evidence_citation?: string;
  evidenceCitation?: string;
  human_explanation?: string;
  humanExplanation?: string;
  is_adversarial_injection?: boolean;
  is_truncated_incomplete?: boolean;
}

export interface EvaluationMetricsData {
  total_cases: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  false_negative_rate: number;
  accuracy: number;
  expected_calibration_error: number;
  brier_score: number;
  score_mae: number;
  insufficient_evidence_detection_rate: number;
  prompt_injection_defense_rate: number;
}

export interface Complaint {
  id: string;
  patient: string;
  facility: string;
  category: string;
  status: 'Pending Review' | 'Under Multi-Agent Audit' | 'Escalated' | 'Resolved' | string;
  submitted_at: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  isInitial?: boolean;
}

export interface ClinicianParams {
  doctorName: string;
  specialization: string;
  hospitalName: string;
  department: string;
}

export type PipelineStageStatus = 'awaiting' | 'pending' | 'running' | 'completed' | 'error';

export interface PipelineStage {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'file' | 'cpu' | 'stethoscope' | 'card' | 'clipboard' | 'scale';
  status: PipelineStageStatus;
  statusLabel: string;
}

export interface ReportTab {
  id: string;
  title: string;
  audit: AuditRecord | null;
  fileName: string;
  rawRecordText: string;
  fileBase64: string;
  fileType: string;
  patientName: string;
  clinicianParams: ClinicianParams;
  score: number;
  verdict: string;
  pipelineStages: PipelineStage[];
  inspectorTab: 'report' | 'evidence' | 'deterministic' | 'verification' | 'trace' | 'translator';
  isDraft: boolean;
  createdAt: number;
}
