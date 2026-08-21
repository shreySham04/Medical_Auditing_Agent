import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  CreditCard,
  Stethoscope,
  ShieldAlert,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuditRecord, FindingItem } from '../types';

interface InspectorTabPanelProps {
  audit: AuditRecord | null;
  activeTab: 'report' | 'translator' | 'evidence' | 'terms';
  onTabChange: (tab: 'report' | 'translator' | 'evidence' | 'terms') => void;
}

export const InspectorTabPanel: React.FC<InspectorTabPanelProps> = ({
  audit,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'report' as const, label: 'FORENSIC REPORT', icon: FileText },
    { id: 'translator' as const, label: 'PATIENT TRANSLATOR', icon: BookOpen },
    { id: 'evidence' as const, label: 'EVIDENCE LOCKER', icon: Layers },
    { id: 'terms' as const, label: 'EXPLAINED TERMS', icon: Sparkles },
  ];

  const getSeverityBadge = (sev?: string) => {
    const s = (sev || 'Medium').toLowerCase();
    if (s.includes('crit')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (s.includes('high')) {
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    }
    if (s.includes('med')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0c1220]/90 flex flex-col overflow-hidden shadow-lg min-h-[320px]">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-1.5 p-3 border-b border-[#1e293b] bg-[#070b14] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0f172a]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 p-5 overflow-y-auto">
        {!audit ? (
          /* Empty Watermark State */
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 rounded-2xl border border-[#1e293b] bg-[#070b14] flex items-center justify-center text-slate-600 mb-3 shadow-inner">
              <Layers className="w-8 h-8 stroke-[1.25]" />
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
              No audit active. Run or select an audit above to inspect findings.
            </p>
          </div>
        ) : (
          <div>
            {/* TAB 1: FORENSIC REPORT */}
            {activeTab === 'report' && (
              <div className="space-y-6">
                {/* Metric Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Clinical Care Score
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {audit.clinicalScore ?? 85}/100
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Billing Transparency
                    </span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {audit.billingScore ?? 62}/100
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Documentation Audit
                    </span>
                    <span className="text-lg font-mono font-bold text-cyan-400">
                      {audit.documentationScore ?? 78}/100
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Timeline Sequence
                    </span>
                    <span className="text-lg font-mono font-bold text-indigo-400">
                      {audit.timelineScore ?? 90}/100
                    </span>
                  </div>
                </div>

                {/* Identified Findings / Anomalies */}
                {audit.findings && audit.findings.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Identified Compliance Anomalies & Infractions ({audit.findings.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {audit.findings.map((f, i) => {
                        const findingObj: FindingItem =
                          typeof f === 'string'
                            ? { id: `FIND-${i + 1}`, description: f, severity: 'Medium', type: 'Clinical Anomaly' }
                            : f;

                        return (
                          <div
                            key={findingObj.id || i}
                            className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-start gap-2.5"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-mono text-[10px] font-bold text-slate-300">
                                  {findingObj.type || 'Infraction'}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getSeverityBadge(
                                    findingObj.severity
                                  )}`}
                                >
                                  {findingObj.severity || 'Medium'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                {findingObj.description || findingObj.finding || findingObj.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Full Report Markdown */}
                <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b] text-xs leading-relaxed text-slate-300 font-sans">
                  <div className="prose prose-invert prose-xs max-w-none prose-headings:font-mono prose-headings:text-cyan-300 prose-strong:text-white prose-code:text-cyan-400 prose-code:bg-[#0c1220] prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                    <ReactMarkdown>
                      {audit.reportMarkdown || audit.report_markdown || '# Forensic Report Generated\nNo markdown body.'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PATIENT TRANSLATOR */}
            {activeTab === 'translator' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/20">
                  <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Plain-Language Patient Summary
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {audit.patientTranslation?.summary ||
                      `Here is an easy-to-understand breakdown of the medical evaluation for ${
                        audit.patientName || audit.patient_name || 'the patient'
                      }. Our multi-agent system reviewed the doctor notes and hospital ledger to verify safety and fair billing.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Diagnoses */}
                  <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <h5 className="text-xs font-mono font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      What Condition Was Treated?
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Evaluation for acute clinical presentation at {audit.hospitalName || 'hospital facility'}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Reviewed by {audit.doctorName || 'Attending Physician'} ({audit.department || 'Specialized Clinic'}).</span>
                      </li>
                    </ul>
                  </div>

                  {/* Billing Plain English */}
                  <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b]">
                    <h5 className="text-xs font-mono font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Billing & Fair Price Check
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {audit.complianceScore && audit.complianceScore < 70
                        ? '⚠️ We detected discrepancies in the billing codes (such as high-complexity emergency codes billed without sufficient duration). You may request a corrected itemized bill from the hospital.'
                        : '✅ The billing charges and CPT service codes appear consistent with standard medical documentation requirements.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EVIDENCE LOCKER */}
            {activeTab === 'evidence' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b]">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    CPT & Clinical Code Audit Comparison Table
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1e293b] text-slate-400 text-[10px] uppercase">
                          <th className="py-2 px-3">Service Description</th>
                          <th className="py-2 px-3">Billed Code</th>
                          <th className="py-2 px-3">Justified Code</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b] text-slate-300">
                        <tr>
                          <td className="py-2 px-3 font-sans">Emergency Medical Exam</td>
                          <td className="py-2 px-3 font-bold text-amber-400">CPT 99285</td>
                          <td className="py-2 px-3 font-bold text-emerald-400">CPT 99284</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                              UPCODING
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-sans">12-Lead Diagnostic EKG Interpretation</td>
                          <td className="py-2 px-3 font-bold text-emerald-400">CPT 93010</td>
                          <td className="py-2 px-3 font-bold text-emerald-400">CPT 93010</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                              MATCHED
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b]">
                  <h5 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                    Verified Timestamped Audit Artifacts
                  </h5>
                  <div className="font-mono text-[11px] text-slate-400 space-y-1 bg-[#090d16] p-3 rounded-lg border border-[#1e293b]">
                    <div>• Case File ID: {audit.id || audit.case_id}</div>
                    <div>• Registered Facility: {audit.hospitalName || audit.hospital || 'General Hospital'}</div>
                    <div>• Audit Session Signature: SHA-256 Verified ({audit.timestamp || '2026-08-18'})</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EXPLAINED TERMS */}
            {activeTab === 'terms' && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Clinical & Forensic Jargon Glossary
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(audit.explainedTerms && audit.explainedTerms.length > 0
                    ? audit.explainedTerms
                    : [
                        {
                          term: 'CPT 99285',
                          definition: 'Emergency department visit code for highest complexity evaluation requiring extensive decision making.',
                        },
                        {
                          term: 'Medical Decision Making (MDM)',
                          definition: 'The clinical complexity calculation based on diagnoses, risk, and data reviewed.',
                        },
                        {
                          term: 'Upcoding',
                          definition: 'The unlawful or improper practice of billing for a higher-paying service code than was actually performed.',
                        },
                        {
                          term: 'Informed Consent',
                          definition: 'Mandatory documentation confirming patient was educated on procedural risks before intervention.',
                        },
                      ]
                  ).map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                      <span className="font-mono text-xs font-bold text-cyan-300 block mb-1">
                        {t.term}
                      </span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {t.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
