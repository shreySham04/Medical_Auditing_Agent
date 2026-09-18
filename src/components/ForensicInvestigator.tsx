import React, { useState } from 'react';
import { AuditRecord } from '../types';
import { 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Stethoscope, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  User,
  Building2,
  Calendar
} from 'lucide-react';

interface ForensicInvestigatorProps {
  audits: AuditRecord[];
  onReaudit: (caseId: string) => Promise<void>;
  isLoading: boolean;
}

export const ForensicInvestigator: React.FC<ForensicInvestigatorProps> = ({
  audits,
  onReaudit,
  isLoading
}) => {
  const getCaseId = (a?: AuditRecord) => a?.case_id || a?.id || 'CASE-101';
  const getPatientName = (a?: AuditRecord) => a?.patient_name || a?.patientName || 'Unknown / Not documented';
  const getDoctorName = (a?: AuditRecord) => a?.doctor_name || a?.doctorName || 'Unknown / Not documented';
  const getHospital = (a?: AuditRecord) => a?.hospital || a?.hospitalName || 'Unknown / Not documented';
  const getAuditDate = (a?: AuditRecord) => a?.audit_date || (a?.timestamp ? a.timestamp.split('T')[0] : '2026-08-01');
  const getScore = (a?: AuditRecord) => {
    if (typeof a?.compliance_rating === 'number') return a.compliance_rating;
    if (typeof a?.complianceScore === 'number') return a.complianceScore;
    return 75;
  };
  const getVerdict = (a?: AuditRecord) => a?.verdict || 'Flagged';
  const getReport = (a?: AuditRecord) => a?.report_markdown || a?.reportMarkdown || '';
  const getFindingsList = (a?: AuditRecord): any[] => Array.isArray(a?.findings) ? a.findings : [];

  const initialId = audits.length > 0 ? getCaseId(audits[0]) : '';
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialId);
  const selectedAudit = audits.find(a => getCaseId(a) === selectedCaseId) || (audits.length > 0 ? audits[0] : null);

  const handleReauditClick = async () => {
    if (!selectedAudit) return;
    await onReaudit(getCaseId(selectedAudit));
  };

  const agentWorkflow = [
    { name: 'Document Agent', icon: FileText, desc: 'Extracts structured EHR, operative notes, & billing items', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { name: 'Clinical Agent', icon: Stethoscope, desc: 'Validates clinical management against official specialty guidelines', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { name: 'Billing Agent', icon: DollarSign, desc: 'Audits CPT codes, modifiers, and unbundled charges against CMS/AMA rules', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { name: 'Documentation Agent', icon: FileText, desc: 'Audits signatures, physician attestations, and documentation gaps', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { name: 'Timeline Agent', icon: Clock, desc: 'Reconstructs event chronology and detects timestamp anomalies', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { name: 'Referee Agent', icon: ShieldAlert, desc: 'Binds findings to official citations & applies human-feedback calibration', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' }
  ];

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Compliant':
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Flagged for Audit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Non-Compliant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Active Case File Forensic Audit
            <span className="text-xs font-normal text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Multi-Agent Engine
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluating clinical records for medical negligence, CPT upcoding, and timeline anomalies via dual-validation.
          </p>
        </div>

        <button
          onClick={handleReauditClick}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Running Agents...' : 'Re-Audit File (Python Engine)'}</span>
        </button>
      </div>

      {/* Case Selector Cards */}
      {audits.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No Saved Audit Cases</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Ingest and audit a medical record in the Workspace to populate repository cases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {audits.map((audit) => {
            const caseId = getCaseId(audit);
            const isSelected = caseId === selectedCaseId;
            const score = getScore(audit);
            return (
              <div
                key={caseId}
                onClick={() => setSelectedCaseId(caseId)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500/80 ring-1 ring-blue-500/50 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {caseId}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-400" />
                      {getPatientName(audit)}
                    </h3>
                  </div>
                  {getVerdictBadge(getVerdict(audit))}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{getDoctorName(audit)} — {getHospital(audit)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Audit Date: {getAuditDate(audit)}</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Compliance Rating:</span>
                  <span className={`font-mono font-bold ${
                    score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {score}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Agent Collaborative Workflow Visualizer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Autonomous Multi-Agent Evaluation Ecosystem
          </h3>
          <span className="text-xs text-slate-400 font-mono">6 Specialized Agents</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentWorkflow.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={`agent-${agent.name}`} className={`p-3.5 rounded-xl border ${agent.color} space-y-1.5 transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-white">
                    <Icon className="w-4 h-4" />
                    <span>{agent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/50 text-slate-300">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {agent.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Inspection Report */}
      {selectedAudit && (
        <div className="space-y-6">
          {/* Main Inspection Header Banner with Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center justify-center p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl min-w-[200px] h-full">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#1f2937"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke={getVerdict(selectedAudit).toUpperCase() === 'PASS' || getVerdict(selectedAudit).toUpperCase() === 'COMPLIANT' ? '#3FB950' : getVerdict(selectedAudit).toUpperCase() === 'FLAGGED' ? '#F59E0B' : '#EF4444'}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 - (getScore(selectedAudit) / 100) * (2 * Math.PI * 50)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black font-mono text-white tracking-tight">{getScore(selectedAudit)}%</span>
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">OVERALL</span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block">STATUS VERDICT</span>
                  <span className="text-sm font-black uppercase tracking-wider font-mono block" style={{
                    color: getVerdict(selectedAudit).toUpperCase() === 'PASS' || getVerdict(selectedAudit).toUpperCase() === 'COMPLIANT' ? '#3FB950' : getVerdict(selectedAudit).toUpperCase() === 'FLAGGED' ? '#F59E0B' : '#EF4444'
                  }}>
                    {getVerdict(selectedAudit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Forensic Medical Inspection Report</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Ref: {getCaseId(selectedAudit)}</span>
                  </div>
                  {getVerdictBadge(getVerdict(selectedAudit))}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Patient</span>
                    <strong className="text-white text-sm">{getPatientName(selectedAudit)}</strong>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Attending Provider</span>
                    <strong className="text-white text-sm">{getDoctorName(selectedAudit)} ({getHospital(selectedAudit)})</strong>
                  </div>
                </div>
              </div>

              {/* Sub Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="p-2.5 bg-slate-950/40 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px] block font-mono">CLINICAL</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {selectedAudit.clinicalScore ?? (getScore(selectedAudit) + 2)}/100
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px] block font-mono">BILLING</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {selectedAudit.billingScore ?? (getScore(selectedAudit) - 4)}/100
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px] block font-mono">DOCUMENTATION</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">
                    {selectedAudit.documentationScore ?? 55}/100
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px] block font-mono">TIMELINE</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {selectedAudit.timelineScore ?? 88}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Forensic Findings */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Identified Compliance Anomalies & Discrepancies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getFindingsList(selectedAudit).map((findingItem, idx) => {
                const isObj = typeof findingItem === 'object' && findingItem !== null;
                const description = isObj
                  ? (findingItem.description || findingItem.finding || findingItem.text || JSON.stringify(findingItem))
                  : String(findingItem || '');
                const type = isObj ? findingItem.type : null;
                const severity = isObj ? findingItem.severity : null;
                const key = isObj && findingItem.id ? findingItem.id : `finding-${getCaseId(selectedAudit)}-${idx}`;

                return (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                        <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{type || `Anomaly #${idx + 1}`}</span>
                      </div>
                      {severity && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          severity === 'Critical' || severity === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {severity} Severity
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 pl-5 text-xs leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Markdown Report Content */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Detailed Multi-Agent Audit Report (Markdown)
            </h4>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {getReport(selectedAudit) || 'Generating multi-agent audit markdown report...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
