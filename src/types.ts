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
    forensicUpgrade?: {
      patient_summary: {
        name: string;
        age: string;
        diagnosis: string;
      };
      rag_guidelines: Array<{
        source: string;
        rule: string;
        relevance: string;
        match_status: "MATCHED" | "NO MATCH FOUND";
      }>;
      agent_outputs: {
        clinical_agent: Array<string>;
        billing_agent: Array<string>;
        documentation_agent: Array<string>;
        timeline_agent: Array<string>;
      };
      red_team_analysis: {
        attacked_findings: Array<{
          original_finding: string;
          attack_result: "VALID" | "OVERSTATED" | "INVALID" | "UNCERTAIN";
          reason: string;
          missing_context: string;
          confidence: number;
        }>;
        risk_assessment: {
          hallucination_risk: number;
          overflagging_risk: number;
          false_negative_risk: number;
        };
      };
      supervisor_decision: {
        final_score: number;
        risk_level: "Low" | "Medium" | "High" | "Critical";
        verdict: "PASS" | "FLAGGED" | "FAIL";
        reasoning: string;
        top_evidence_based_findings: Array<string>;
      };
      uncertainty_engine: {
        overall_uncertainty: number;
        score_adjustments: {
          penalty: number;
          boost: number;
        };
        reliability_level: "HIGH" | "MEDIUM" | "LOW";
      };
      complaint_recommendation: {
        should_file_complaint: boolean;
        reason: string;
        approval_required: "USER" | "AUTO" | "NONE";
      };
    };
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
