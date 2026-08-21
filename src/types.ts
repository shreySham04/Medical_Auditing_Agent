export interface FindingItem {
  id?: string;
  type?: string;
  description?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  finding?: string;
  text?: string;
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
  clinicalScore?: number;
  billingScore?: number;
  documentationScore?: number;
  timelineScore?: number;
  clinicalGrade?: string;
  billingGrade?: string;
  risk_classification?: 'Low' | 'Medium' | 'High' | 'Critical';
  riskClassification?: 'Low' | 'Medium' | 'High' | 'Critical';
  verdict: 'Compliant' | 'Flagged' | 'Failed' | 'Pass' | string;
  findings?: (string | FindingItem)[];
  report_markdown?: string;
  reportMarkdown?: string;
  explainedTerms?: ExplainedTerm[];
  patientTranslation?: {
    summary?: string;
    diagnoses?: string[];
    medications?: string[];
    actionItems?: string[];
  };
  evidenceLocker?: {
    billedCodes?: { code: string; desc: string; fee: string; justified: boolean }[];
    clinicalDeviations?: string[];
    doctorTimestampLogs?: string[];
  };
  fileName?: string;
  savedPath?: string;
}

export interface TrainingSample {
  sample_id?: string;
  id?: string;
  specialty?: string;
  topic?: string;
  cpt_billed?: string;
  cptBilled?: string;
  cpt_justified?: string;
  cptRecommended?: string;
  upcoding_detected?: boolean;
  upcodingDetected?: boolean;
  negligence_flag?: boolean;
  audit_score?: number;
  complianceScore?: number;
  summary?: string;
  reasoning?: string;
  recordText?: string;
  title?: string;
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

export type PipelineStageStatus = 'awaiting' | 'pending' | 'running' | 'completed';

export interface PipelineStage {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'file' | 'cpu' | 'stethoscope' | 'card' | 'clipboard' | 'scale';
  status: PipelineStageStatus;
  statusLabel: string;
}
