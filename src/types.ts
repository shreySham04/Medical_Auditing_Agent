export interface TechnicalMetrics {
  docCompleteness: number; // 0-100
  recConsistency: number; // 0-100
  billingAccuracy: number; // 0-100
  upcodingScore: number; // 0-100 (100 means no upcoding detected)
  procedureCompliance: number; // 0-100
  dataIntegrity: number; // 0-100
  regulatoryScore: number; // 0-100
}

export interface HealthcareMetrics {
  clinicalNegligenceScore: number; // 0-100 (100 means zero negligence detected)
  diagnosticConsistency: number; // 0-100
  treatmentAppropriateness: number; // 0-100
  patientSafetyScore: number; // 0-100
  medicationMgmt: number; // 0-100
  carePathwayCompliance: number; // 0-100
  medicalNecessity: number; // 0-100
}

export interface MedicalTerm {
  term: string;
  definition: string;
  context: string;
}

export interface PatientFriendlySummary {
  gradeLevel: string; // "8th Grade"
  summaryText: string;
  diagnoses: string[];
  medications: string[];
  followUpInstructions: string[];
  explainedTerms: MedicalTerm[];
}

export interface ComplaintData {
  status: 'PENDING USER APPROVAL' | 'REGISTERED' | 'DISMISSED' | 'SAVED FOR REVIEW';
  severityLevel: 'Level 1: Documentation issue' | 'Level 2: Billing concern' | 'Level 3: Potential negligence' | 'Level 4: Critical patient safety concern';
  riskFactors: string[];
  evidenceSummary: string;
  evidenceLockerExcerpt: string;
}

export interface EvidenceFinding {
  finding: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: 'Confirmed' | 'Likely' | 'Unsupported';
  explanation: string;
  remediation: string;
}

export interface ExplainableAI {
  whyScoreDropped: string;
  findingsAffected: string[];
  evidenceFindings?: EvidenceFinding[];
  confidenceLevel: number; // %
}

export interface AuditItem {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  
  // Doctor details
  doctorName: string;
  doctorSpecialization: string;
  hospitalName: string;
  department: 'Cardiology' | 'Orthopedics' | 'Radiology' | 'Emergency Medicine';

  // Master Ratings
  complianceScore: number; // Overall Rating
  doctorScore: number;
  hospitalScore: number;
  riskClassification: 'Low' | 'Medium' | 'High' | 'Critical';
  verdict: 'Pass' | 'Flagged' | 'Failed';
  providerReliabilityIndex: number; // PRI

  // Technical & Clinical detail scores
  technicalMetrics: TechnicalMetrics;
  healthcareMetrics: HealthcareMetrics;

  // Rich additions
  reportMarkdown: string;
  patientSummary: PatientFriendlySummary;
  complaint?: ComplaintData;
  explainableAI: ExplainableAI;
  
  savedPath?: string;
  primaryScore?: number;
  fileData?: string; // Inline Base64 file data for historical loads
  verificationDetails?: {
    isVerified: boolean;
    primaryScore: number;
    verifiedScore: number;
    notes: string;
    consensus: string;
    variance: number;
    documentationScore?: number;
    timelineScore?: number;
    clinicalScore?: number;
    auditLog?: string[];
    checks?: { criterion: string; status: 'pass' | 'fail' | 'warn'; details: string }[];
  };
  supervisorRecheck?: {
    status: string;
    verifiedBy: string;
    timestamp: string;
    evidenceCheckSummary: string;
    reviewText: string;
    publishedToExternal: boolean;
    publishedToHospitalProfile: boolean;
  };
}

export interface AuditResponse {
  success: boolean;
  audit: AuditItem;
}

export interface StatusResponse {
  apiReady: boolean;
  hasEnvKey: boolean;
}
