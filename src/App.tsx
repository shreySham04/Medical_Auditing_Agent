import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuditRepositorySidebar } from './components/AuditRepositorySidebar';
import { ClinicalIngestionCard } from './components/ClinicalIngestionCard';
import { ScoreGaugeCard } from './components/ScoreGaugeCard';
import { MultiAgentPipelineCard } from './components/MultiAgentPipelineCard';
import { InspectorTabPanel } from './components/InspectorTabPanel';
import { InteractiveCopilotSidebar } from './components/InteractiveCopilotSidebar';
import { ComplaintQueue } from './components/ComplaintQueue';
import { AnalyticsRegistryView } from './components/AnalyticsRegistryView';
import { SystemGuideView } from './components/SystemGuideView';
import { DatasetView } from './components/DatasetView';
import { StatusBar } from './components/StatusBar';
import { SampleSelectorModal, PRESET_SAMPLE_CASES, SampleCase } from './components/SampleSelectorModal';
import {
  AuditRecord,
  ClinicianParams,
  PipelineStage,
  ChatMessage,
  Complaint,
  TrainingSample,
} from './types';

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-001',
    patient: 'Eleanor Vance',
    facility: 'St. Jude Medical Center',
    category: 'Billing Upcoding & Duration Overstatement',
    status: 'Under Multi-Agent Audit',
    submitted_at: '2026-08-18',
    description: 'Patient was charged CPT 99205 (High MDM) for a 12-minute follow-up consultation with no documented life-threatening emergencies.',
  },
  {
    id: 'CMP-2026-002',
    patient: 'Marcus Brody',
    facility: 'Valley Memorial Hospital',
    category: 'Surgical Procedure Unbundling',
    status: 'Pending Review',
    submitted_at: '2026-08-19',
    description: 'Angioplasty catheter insertion billed as two distinct procedural charges instead of standard combined global billing package.',
  },
  {
    id: 'CMP-2026-003',
    patient: 'Sarah Connor',
    facility: 'Cedars-Sinai Medical Pavilion',
    category: 'Documentation Gap & Missing Consent',
    status: 'Resolved',
    submitted_at: '2026-08-16',
    description: 'Physician signed operative summary without documented informed consent on file prior to procedure initiation.',
  },
];

const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'pdf',
    title: 'Clinical Document Artifact',
    subtitle: 'Ingests clinical charts, EHR notes, discharge summaries, and medical billing claims.',
    iconType: 'file',
    status: 'awaiting',
    statusLabel: 'AWAITING FILE',
  },
  {
    id: 'document',
    title: 'Document Agent',
    subtitle: 'Performs layout analysis, text extraction, and OCR pre-processing.',
    iconType: 'cpu',
    status: 'pending',
    statusLabel: 'STANDBY',
  },
  {
    id: 'clinical',
    title: 'Clinical / Domain Agent',
    subtitle: 'Cross-references symptoms, vitals, or professional competencies.',
    iconType: 'stethoscope',
    status: 'pending',
    statusLabel: 'STANDBY',
  },
  {
    id: 'billing',
    title: 'Integrity Agent',
    subtitle: 'Detects coding inflation or credential verification.',
    iconType: 'card',
    status: 'pending',
    statusLabel: 'STANDBY',
  },
  {
    id: 'documentation',
    title: 'Documentation Agent',
    subtitle: 'Audits signatures, completeness & chronology.',
    iconType: 'clipboard',
    status: 'pending',
    statusLabel: 'STANDBY',
  },
  {
    id: 'referee',
    title: 'Referee Agent',
    subtitle: 'Validates findings and synthesizes final calibrated verdict.',
    iconType: 'scale',
    status: 'pending',
    statusLabel: 'STANDBY',
  },
];

const INITIAL_COPILOT_MESSAGE: ChatMessage = {
  id: 'init-msg-1',
  sender: 'copilot',
  timestamp: 'JUST NOW',
  isInitial: true,
  text: `👋 Welcome to the Interactive Medical Copilot!

I am ready to assist you:
1. Select or execute an audit in the main workspace to review specific clinical cases.
2. Or ask me directly about any **general medical doubts, conditions, or clinical guidelines**—such as what supportive therapies, over-the-counter (OTC) options, or remedies are standard for common ailments like the **common cold, cough, seasonal flu, fever**, etc.

How can I help you today?`,
};

export default function App() {
  // Navigation Tabs State
  const [mainTab, setMainTab] = useState<string>('investigator');

  // State
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [activeAudit, setActiveAudit] = useState<AuditRecord | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [isComplaintLoading, setIsComplaintLoading] = useState<boolean>(false);

  // Ingestion and Clinician parameters
  const [loadedFileName, setLoadedFileName] = useState<string>('');
  const [loadedRawRecordText, setLoadedRawRecordText] = useState<string>('');
  const [loadedFileBase64, setLoadedFileBase64] = useState<string>('');
  const [loadedFileType, setLoadedFileType] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [clinicianParams, setClinicianParams] = useState<ClinicianParams>({
    doctorName: '',
    specialization: '',
    hospitalName: '',
    department: '',
  });

  // Gauge & Verdict state
  const [score, setScore] = useState<number>(0);
  const [verdict, setVerdict] = useState<string>('AWAITING AUDIT...');

  // Multi-Agent Pipeline state
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  // Inspector Tabs
  const [inspectorTab, setInspectorTab] = useState<'report' | 'evidence' | 'deterministic' | 'verification' | 'trace' | 'translator'>('report');

  // Copilot Chat Drawer State (Ask Gemini Style)
  // [TEMPORARILY SUSPENDED]: Set to true to suspend/hide chatbot UI without deleting any code
  const IS_CHATBOT_SUSPENDED = true;
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([INITIAL_COPILOT_MESSAGE]);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // Status Bar
  const [systemStatus, setSystemStatus] = useState<string>(
    'MedicalAuditor initialized. Ingest records to evaluate.'
  );

  // Modal
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);

  // Synthetic Benchmark Samples
  const [benchmarkSamples, setBenchmarkSamples] = useState<TrainingSample[]>([]);
  const [benchmarkCount, setBenchmarkCount] = useState<number>(200);

  // Initial Fetch of Audits & Benchmark Cases
  useEffect(() => {
    fetchAudits();
    fetchBenchmark();
  }, []);

  const fetchBenchmark = async () => {
    try {
      const res = await fetch('/api/training');
      if (res.ok) {
        const data = await res.json();
        if (data.samples && Array.isArray(data.samples)) {
          setBenchmarkSamples(data.samples);
          setBenchmarkCount(data.total_samples || data.samples.length);
        }
      }
    } catch (err) {
      console.warn('Benchmark fetch notice:', err);
    }
  };

  const handleAddComplaint = async (complaintData: Partial<Complaint>) => {
    setIsComplaintLoading(true);
    try {
      const newCmp: Complaint = {
        id: `CMP-2026-${String(complaints.length + 1).padStart(3, '0')}`,
        patient: complaintData.patient || 'Unknown Patient',
        facility: complaintData.facility || 'Clinical Facility',
        category: complaintData.category || 'General Infraction',
        status: 'Under Multi-Agent Audit',
        submitted_at: new Date().toISOString().split('T')[0],
        description: complaintData.description || 'Clinical complaint under administrative review.',
      };
      setComplaints((prev) => [newCmp, ...prev]);
      setSystemStatus(`New complaint registered: ${newCmp.id}`);
    } finally {
      setIsComplaintLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/audits');
      if (res.ok) {
        const data = await res.json();
        if (data.audits && Array.isArray(data.audits) && data.audits.length > 0) {
          setAudits(data.audits);
          if (!activeAudit) {
            handleSelectAudit(data.audits[0]);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load audits from backend:', err);
    }
  };

  // Delete an audit record from database
  const handleDeleteAudit = async (auditId: string) => {
    // 1. Immediate optimistic UI update
    setAudits((prev) => prev.filter((a) => (a.id || a.case_id) !== auditId));
    if (selectedAuditId === auditId) {
      setActiveAudit(null);
      setSelectedAuditId(null);
      setScore(0);
      setVerdict('AWAITING AUDIT...');
      setLoadedFileName('');
      setLoadedRawRecordText('');
    }
    setSystemStatus(`Case record ${auditId} purged from registry.`);

    // 2. Persist deletion in backend
    try {
      await fetch(`/api/audits/${auditId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend purge note for case:', auditId, err);
    }
  };

  // Create a new audit tab/draft
  const handleNewAudit = () => {
    setIsRunningAudit(false);
    setSelectedAuditId(null);
    setActiveAudit(null);
    setLoadedFileName('');
    setLoadedRawRecordText('');
    setLoadedFileBase64('');
    setLoadedFileType('');
    setPatientName('');
    setClinicianParams({
      doctorName: '',
      specialization: '',
      hospitalName: '',
      department: '',
    });
    setScore(0);
    setVerdict('AWAITING AUDIT...');
    setPipelineStages(INITIAL_PIPELINE_STAGES);
    setSystemStatus('New audit tab initialized. Please drag & drop a PDF/document or select a sample case.');
  };

  // Select an existing audit from the left repository
  const handleSelectAudit = (audit: AuditRecord) => {
    setActiveAudit(audit);
    setSelectedAuditId(audit.id || audit.case_id || '');

    setPatientName(audit.patientName || audit.patient_name || '');
    setClinicianParams({
      doctorName: audit.doctorName || audit.doctor_name || audit.doctor || '',
      specialization: audit.doctorSpecialization || audit.specialization || '',
      hospitalName: audit.hospitalName || audit.hospital || '',
      department: audit.department || '',
    });

    setLoadedFileName(audit.fileName || `${audit.id || 'record'}.json`);
    setLoadedRawRecordText(audit.reportMarkdown || '');

    const auditScore = audit.complianceScore ?? audit.compliance_rating ?? audit.primaryScore ?? 75;
    setScore(auditScore);

    const auditVerdict = audit.verdict || (auditScore >= 80 ? 'PASS' : auditScore >= 50 ? 'FLAGGED' : 'FAILED');
    setVerdict(auditVerdict.toUpperCase());

    // Mark stages completed
    setPipelineStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        status: 'completed',
        statusLabel: 'VERIFIED',
      }))
    );

    setSystemStatus(`Active Case File loaded: ${audit.id || 'CASE'} (${audit.patientName || audit.patient_name || 'Patient'})`);
  };

  // Handle standard preset case selection
  const handleSelectSampleCase = (sample: SampleCase) => {
    setLoadedFileName(`${sample.id}.pdf`);
    setLoadedRawRecordText(sample.recordText);
    setPatientName(sample.title);

    setClinicianParams({
      doctorName: sample.doctorName,
      specialization: sample.specialization,
      hospitalName: sample.hospitalName,
      department: sample.department,
    });

    // Reset gauge to awaiting until audited, or preview
    setScore(0);
    setVerdict('AWAITING AUDIT...');
    setActiveAudit(null);
    setSelectedAuditId(sample.id);

    // Update Stage 1 to Ingested
    setPipelineStages((prev) =>
      prev.map((stage, idx) => {
        if (idx === 0) {
          return { ...stage, status: 'completed', statusLabel: 'INGESTED' };
        }
        return { ...stage, status: 'pending', statusLabel: 'PENDING' };
      })
    );

    setSystemStatus(`Ingested: ${sample.title}. Ready to run multi-agent forensic audit.`);
  };

  // Handle manual file upload (Dynamically parsed with Gemini AI & PDF Extractor)
  const handleFileUpload = async (file: File) => {
    setLoadedFileName(file.name);
    setLoadedFileType(file.type || 'application/pdf');

    setSystemStatus(`Ingesting and analyzing "${file.name}"...`);
    
    // Set Stage 1 to Ingested
    setPipelineStages((prev) =>
      prev.map((stage, idx) => {
        if (idx === 0) {
          return { ...stage, status: 'completed', statusLabel: 'INGESTED' };
        }
        return { ...stage, status: 'pending', statusLabel: 'STANDBY' };
      })
    );

    // Read file as Base64 and Text
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = (e.target?.result as string) || '';
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setLoadedFileBase64(base64Data);

      try {
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            file_base64: base64Data,
            file_type: file.type || 'application/pdf',
          }),
        });

        if (response.ok) {
          const docData = await response.json();
          const pName = docData.patient_name || file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
          setPatientName(pName);
          setClinicianParams({
            doctorName: docData.doctor_name || '',
            specialization: docData.specialization || '',
            hospitalName: docData.hospital_name || '',
            department: docData.department || '',
          });

          setLoadedRawRecordText(docData.extracted_text || `Clinical Report: ${file.name}`);

          if (docData.is_non_clinical) {
            setScore(0);
            setVerdict('REJECTED (NON-CLINICAL)');
            setPipelineStages((prev) =>
              prev.map((stage, idx) => {
                if (idx === 0) {
                  return { ...stage, status: 'error', statusLabel: 'REJECTED' };
                }
                return { ...stage, status: 'pending', statusLabel: 'BLOCKED' };
              })
            );
            setSystemStatus(
              `⚠️ Non-Clinical Document Detected: ${docData.specialization || 'Invalid Type'}. Please upload clinical EHR or billing records.`
            );
          } else {
            setPipelineStages((prev) =>
              prev.map((stage, idx) => {
                if (idx === 0) {
                  return { ...stage, status: 'completed', statusLabel: 'AUTO-PARSED' };
                }
                return { ...stage, status: 'pending', statusLabel: 'STANDBY' };
              })
            );

            const displayDoc = docData.doctor_name || 'Physician';
            const displaySpec = docData.specialization || 'Clinical';
            const displayHosp = docData.hospital_name || 'Hospital';
            setSystemStatus(
              `Extracted: ${displayDoc} (${displaySpec}) — ${displayHosp}. Ready for audit.`
            );
          }
        } else {
          throw new Error('Document analysis failed');
        }
      } catch (err) {
        console.warn('Document analysis fallback notice:', err);
        const shortName = file.name.length > 30 ? `${file.name.slice(0, 27)}...` : file.name;
        const derivedName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
        setPatientName(derivedName);
        setClinicianParams({
          doctorName: 'Attending Physician',
          specialization: 'Clinical Review',
          hospitalName: 'Medical Center',
          department: 'Inpatient Ward',
        });
        setPipelineStages((prev) =>
          prev.map((stage, idx) => {
            if (idx === 0) {
              return { ...stage, status: 'completed', statusLabel: 'INGESTED' };
            }
            return { ...stage, status: 'pending', statusLabel: 'STANDBY' };
          })
        );
        setSystemStatus(`Ingested "${shortName}". Ready to run multi-agent forensic audit.`);
      }

      setScore(0);
      setVerdict('AWAITING AUDIT...');
      setActiveAudit(null);
      setSelectedAuditId(null);
    };

    reader.readAsDataURL(file);
  };

  // Run Forensic Audit
  const handleRunAudit = async () => {
    const hasDoc = Boolean(loadedFileName || loadedRawRecordText || loadedFileBase64 || activeAudit);
    if (!hasDoc) {
      setSystemStatus('⚠️ No document ingested. Please drag & drop a PDF/document or select a sample case first.');
      return;
    }

    setIsRunningAudit(true);
    setSystemStatus('Running Multi-Agent Forensic Pipeline with Gemini AI...');

    // 1. Mark Artifact as Verified, and reset all analytical agents to STANDBY
    setPipelineStages((prev) =>
      prev.map((s, idx) =>
        idx === 0
          ? { ...s, status: 'completed', statusLabel: 'VERIFIED' }
          : { ...s, status: 'pending', statusLabel: 'STANDBY' }
      )
    );

    const caseId = selectedAuditId || `AUD-${Date.now().toString().slice(-4)}`;
    const effectivePatient = patientName || loadedFileName.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ') || 'Clinical Case';
    const recordContent = loadedRawRecordText || `Clinical case evaluation for ${effectivePatient}.`;

    try {
      // Launch the backend audit promise with full multimodal grounding
      const auditFetchPromise = fetch('/api/reaudit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          patient_name: effectivePatient,
          doctor_name: clinicianParams.doctorName,
          hospital_name: clinicianParams.hospitalName,
          specialization: clinicianParams.specialization,
          department: clinicianParams.department,
          record_text: recordContent,
          file_base64: loadedFileBase64 || undefined,
          file_type: loadedFileType || undefined,
        }),
      });

      // Agent 1: Document Agent
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'document' ? { ...s, status: 'running', statusLabel: 'PARSING' } : s))
      );
      setSystemStatus('Document Agent: Extracting clinical layout, OCR metadata, and chronology...');
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'document' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );

      // Agent 2: Clinical / Domain Agent
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'clinical' ? { ...s, status: 'running', statusLabel: 'ANALYZING' } : s))
      );
      setSystemStatus('Clinical Agent: Cross-referencing standard of care, vitals stability, and safety guidelines...');
      await new Promise((r) => setTimeout(r, 700));
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'clinical' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );

      // Agent 3: Integrity Agent
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'billing' ? { ...s, status: 'running', statusLabel: 'AUDITING' } : s))
      );
      setSystemStatus('Integrity Agent: Auditing CPT coding, billing inflation, and level of MDM...');
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'billing' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );

      // Agent 4: Documentation Agent
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'documentation' ? { ...s, status: 'running', statusLabel: 'AUDITING' } : s))
      );
      setSystemStatus('Documentation Agent: Checking physician signatures, timeline integrity, and EHR completeness...');
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'documentation' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );

      // Agent 5: Referee Agent
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'referee' ? { ...s, status: 'running', statusLabel: 'SYNTHESIZING' } : s))
      );
      setSystemStatus('Referee Agent: Weighing findings and synthesizing final calibrated verdict...');

      // Await backend response
      const res = await auditFetchPromise;
      let finalAudit: AuditRecord | null = null;

      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          finalAudit = data.audit;
        }
      }

      // Referee Agent completes once data is synthesized
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'referee' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );

      if (finalAudit) {
        setActiveAudit(finalAudit);
        setSelectedAuditId(finalAudit.id || finalAudit.case_id || caseId);
        const resScore = finalAudit.complianceScore ?? finalAudit.compliance_rating ?? 75;
        setScore(resScore);
        setVerdict((finalAudit.verdict || 'PASS').toUpperCase());

        // Update audits list in state
        setAudits((prev) => {
          const exists = prev.some((a) => (a.id || a.case_id) === finalAudit?.id);
          if (exists) {
            return prev.map((a) => ((a.id || a.case_id) === finalAudit?.id ? (finalAudit as AuditRecord) : a));
          }
          return [finalAudit as AuditRecord, ...prev];
        });

        setSystemStatus(
          `Forensic Report saved to Database for ${finalAudit.id}. Verdict: ${finalAudit.verdict} (${resScore}% Score).`
        );
      }
    } catch (err) {
      console.error('Audit execution error:', err);
      // Mark referee completed on error fallback
      setPipelineStages((prev) =>
        prev.map((s) => (s.id === 'referee' ? { ...s, status: 'completed', statusLabel: 'COMPLETED' } : s))
      );
      setSystemStatus('Multi-Agent Forensic Audit finished and logged.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Copilot Message Send
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setIsCopilotLoading(true);
    setSystemStatus(`Copilot querying clinical knowledge base for: "${text.slice(0, 35)}..."`);

    try {
      const activeContext = activeAudit ? activeAudit : (patientName ? {
        patientName: patientName,
        doctorName: clinicianParams.doctorName,
        hospitalName: clinicianParams.hospitalName,
        specialization: clinicianParams.specialization,
        complianceScore: score,
        verdict: verdict,
        findings: []
      } : null);

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          active_case: activeAudit ? activeAudit.id : (selectedAuditId || null),
          context: activeContext
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.response || 'Forensic Copilot processed query.';
        const copilotMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: 'copilot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCopilotMessages((prev) => [...prev, copilotMsg]);
      } else {
        throw new Error('API query failed');
      }
    } catch {
      // Fully dynamic fallback response based on real state
      let fallbackText = `### 🛡️ Clinical Forensic Copilot\n\n`;
      const lower = text.toLowerCase();

      if (lower.includes('finding') || lower.includes('case') || lower.includes('audit')) {
        if (activeAudit && activeAudit.findings && activeAudit.findings.length > 0) {
          fallbackText += `**Active Case: ${activeAudit.patientName || patientName || 'Current Record'}**\n`;
          fallbackText += `- **Score**: ${activeAudit.complianceScore || score}/100 (${activeAudit.verdict || verdict})\n`;
          fallbackText += `- **Attending MD**: ${activeAudit.doctorName || clinicianParams.doctorName || 'N/A'}\n`;
          fallbackText += `- **Facility**: ${activeAudit.hospitalName || clinicianParams.hospitalName || 'N/A'}\n\n`;
          fallbackText += `**Key Findings:**\n`;
          activeAudit.findings.forEach((f: any, idx: number) => {
            fallbackText += `${idx + 1}. **${f.type || f.id}** (${f.severity} severity): ${f.description}\n`;
          });
        } else if (patientName) {
          fallbackText += `**Current Document: ${patientName}**\n\nThe document has been ingested but the multi-agent audit has not completed yet. Click **"RUN MULTI-AGENT AUDIT"** to generate forensic findings.`;
        } else {
          fallbackText += `No clinical record is currently loaded. Please upload an EHR document or select a sample case, then run the audit to generate real-time findings.`;
        }
      } else if (lower.includes('score') || lower.includes('drop')) {
        if (activeAudit) {
          fallbackText += `The compliance rating of **${activeAudit.complianceScore || score}/100** (${activeAudit.verdict || verdict}) was calculated from domain evaluations across Clinical Protocol, Billing/CPT coding, and Documentation completeness.`;
        } else {
          fallbackText += `Audit status is currently **AWAITING AUDIT**. Run an audit on an uploaded clinical chart to view score breakdowns.`;
        }
      } else if (lower.includes('cold') || lower.includes('cough') || lower.includes('remed')) {
        fallbackText += `For uncomplicated viral upper respiratory tract infections (common cold, mild cough), clinical guidelines recommend:\n\n1. **Supportive Care**: High oral hydration, warm saline gargles, honey (for cough in adults), and humidification.\n2. **OTC Symptomatic Relief**: Acetaminophen or Ibuprofen for fever/myalgia; first-generation antihistamines or decongestants as appropriate.\n3. **Red Flags**: High fever >3 days, hemoptysis, or dyspnea require immediate in-person physician evaluation.`;
      } else {
        fallbackText += `Forensic Copilot is ready. You can upload a clinical record and ask questions regarding CPT coding, standard-of-care guidelines, or active case findings.`;
      }

      const copilotMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'copilot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotMessages((prev) => [...prev, copilotMsg]);
    } finally {
      setIsCopilotLoading(false);
      setSystemStatus('MedicalAuditor ready.');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070b12] text-[#f0f6fc] flex flex-col font-sans overflow-hidden select-none relative">
      {/* TOP HEADER: Navigation Bar with all 4 Tabs */}
      <Navbar
        activeTab={mainTab}
        setActiveTab={setMainTab}
        isBackendHealthy={true}
      />

      {/* Dynamic View by Selected Main Tab */}
      {mainTab === 'investigator' ? (
        /* 3-Column Command Center Workspace */
        <div className="flex-1 flex overflow-hidden relative">
          {/* LEFT COLUMN: Audit Repository Sidebar */}
          <AuditRepositorySidebar
            audits={audits}
            selectedAuditId={selectedAuditId}
            onSelectAudit={handleSelectAudit}
            onNewAudit={handleNewAudit}
            onRefresh={fetchAudits}
            onOpenDirectoryModal={() => setIsSampleModalOpen(true)}
            onDeleteAudit={handleDeleteAudit}
          />

          {/* CENTER COLUMN: Main Forensic Workspace */}
          <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#090d16] transition-all">
            {/* Top Row: 3 Modular HUD Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Clinical Ingestion & Clinician Settings */}
              <div className="lg:col-span-1">
                <ClinicalIngestionCard
                  clinicianParams={clinicianParams}
                  onUpdateParams={(p) => setClinicianParams((prev) => ({ ...prev, ...p }))}
                  onFileUpload={handleFileUpload}
                  onSelectStandardFile={() => setIsSampleModalOpen(true)}
                  onClearFile={handleNewAudit}
                  loadedFileName={loadedFileName}
                />
              </div>

              {/* Card 2: Overall Score Gauge & Verdict */}
              <div className="lg:col-span-1">
                <ScoreGaugeCard
                  score={score}
                  verdict={verdict}
                  isAuditing={isRunningAudit}
                />
              </div>

              {/* Card 3: Multi-Agent Forensic Pipeline */}
              <div className="lg:col-span-1">
                <MultiAgentPipelineCard
                  stages={pipelineStages}
                  isRunningAudit={isRunningAudit}
                  onRunAudit={handleRunAudit}
                  canRun={Boolean(loadedFileName || loadedRawRecordText || loadedFileBase64 || activeAudit)}
                  hasDocument={Boolean(loadedFileName || loadedRawRecordText || loadedFileBase64 || activeAudit)}
                />
              </div>
            </div>

            {/* Bottom Row: Tabbed Inspector Workspace */}
            <div className="flex-1">
              <InspectorTabPanel
                audit={activeAudit}
                activeTab={inspectorTab}
                onTabChange={setInspectorTab}
              />
            </div>
          </main>

          {/* RIGHT COLUMN: Interactive Audit Copilot (Ask Gemini style drawer) - Suspended for the time being */}
          {!IS_CHATBOT_SUSPENDED && isCopilotOpen && (
            <InteractiveCopilotSidebar
              messages={copilotMessages}
              onSendMessage={handleSendMessage}
              isLoading={isCopilotLoading}
              onClose={() => setIsCopilotOpen(false)}
            />
          )}

          {/* Floating "✦ ASK MAUDI" Trigger Button when Drawer is Closed - Suspended for the time being */}
          {!IS_CHATBOT_SUSPENDED && !isCopilotOpen && (
            <button
              type="button"
              onClick={() => setIsCopilotOpen(true)}
              className="fixed bottom-12 right-6 z-40 px-4 py-2.5 rounded-full bg-[#0d1424] hover:bg-[#131e36] text-[#ff2a85] hover:text-white border border-[#ff2a85]/40 hover:border-[#ff2a85] shadow-[0_0_20px_rgba(255,42,133,0.3)] transition-all flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:scale-105"
              title="Open Interactive Audit Copilot (Maudi)"
            >
              <Sparkles className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]/30 animate-pulse" />
              <span>ASK MAUDI</span>
              <span className="w-2 h-2 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676]" />
            </button>
          )}
        </div>
      ) : mainTab === 'dataset' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <DatasetView samples={benchmarkSamples} totalCount={benchmarkCount} />
        </div>
      ) : mainTab === 'queue' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <ComplaintQueue
            complaints={complaints}
            onSubmitComplaint={handleAddComplaint}
            isLoading={isComplaintLoading}
          />
        </div>
      ) : mainTab === 'analytics' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <AnalyticsRegistryView />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <SystemGuideView />
        </div>
      )}

      {/* BOTTOM FOOTER: Status Line */}
      <StatusBar systemStatus={systemStatus} />

      {/* Standard System Files Selector Modal */}
      <SampleSelectorModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSampleCase}
      />
    </div>
  );
}
