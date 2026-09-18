import React, { useState } from 'react';
import {
  Clock,
  Folder,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Trash2,
  Check,
  X,
  Plus,
  FileText,
  Layers,
  Archive,
} from 'lucide-react';
import { AuditRecord, ReportTab } from '../types';

interface AuditRepositorySidebarProps {
  audits: AuditRecord[];
  reportTabs: ReportTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewAudit: () => void;
  onSelectAudit: (audit: AuditRecord) => void;
  onRefresh: () => void;
  onOpenDirectoryModal: () => void;
  onDeleteAudit?: (auditId: string) => void;
  onPurgeAllAudits?: () => void;
}

export const AuditRepositorySidebar: React.FC<AuditRepositorySidebarProps> = ({
  audits,
  reportTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewAudit,
  onSelectAudit,
  onRefresh,
  onOpenDirectoryModal,
  onDeleteAudit,
  onPurgeAllAudits,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmPurgeAll, setConfirmPurgeAll] = useState<boolean>(false);

  const handleDeleteClick = (e: React.MouseEvent, auditId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDeleteId === auditId) {
      if (onDeleteAudit) {
        onDeleteAudit(auditId);
      }
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(auditId);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDeleteId(null);
  };

  return (
    <aside className="w-72 sm:w-80 flex-shrink-0 bg-[#070b12] border-r border-[#1a2333] flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#1a2333] flex items-center justify-between bg-[#080d17]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Workspaces ({reportTabs.length})
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDirectoryModal}
          className="px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-full transition-all cursor-pointer hover:border-blue-400 whitespace-nowrap"
        >
          DIRECTORY
        </button>
      </div>

      {/* Action: Add New Report Tab Button - EXPLICIT USER GENERATION ONLY */}
      <div className="p-3 border-b border-[#1a2333]/80 bg-[#080d17]">
        <button
          type="button"
          onClick={onNewAudit}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-mono text-xs font-bold tracking-wide transition-all cursor-pointer shadow-sm bg-[#0d1527] hover:bg-cyan-950/40 border border-[#21304a] hover:border-cyan-500/50 text-cyan-300 hover:text-white group"
          title="Explicitly generate a new report tab"
        >
          <div className="w-4 h-4 rounded-md bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>+ NEW REPORT TAB</span>
        </button>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Section 1: Active Open Report Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Open Report Tabs ({reportTabs.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {reportTabs.map((tab, idx) => {
              const isActive = tab.id === activeTabId;
              const isAudited = Boolean(tab.audit && tab.score > 0);
              const isPass = tab.verdict?.toLowerCase().includes('pass');
              const isFlagged = tab.verdict?.toLowerCase().includes('flag');
              const displayName = tab.patientName || tab.title || `Report Tab #${idx + 1}`;

              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                    isActive
                      ? 'bg-[#0f172a] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : 'bg-[#0b101c] border-[#1a2333] hover:border-[#2b3a54] hover:bg-[#0e1526]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                          TAB #{idx + 1}
                        </span>
                        {isActive && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-white' : 'text-slate-300 group-hover:text-cyan-300'
                        }`}
                      >
                        {displayName}
                      </h4>
                      <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                        {tab.fileName || (isAudited ? 'Audit Completed' : 'Awaiting Ingestion...')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isAudited ? (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                            isPass
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isFlagged
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isPass ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : isFlagged ? (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5" />
                          )}
                          {tab.score}%
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          DRAFT
                        </span>
                      )}

                      {/* Close Tab Button */}
                      {reportTabs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(tab.id);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Close this tab"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Saved Database Archive Cases */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1 pt-2 border-t border-[#1a2333]/60">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Archive className="w-3 h-3 text-slate-500" />
              Database Cases ({audits.length})
            </span>
            <div className="flex items-center gap-1.5">
              {audits.length > 0 && onPurgeAllAudits && (
                confirmPurgeAll ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurgeAllAudits();
                        setConfirmPurgeAll(false);
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40 rounded hover:bg-rose-500/30"
                      title="Confirm purge all"
                    >
                      CONFIRM PURGE
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmPurgeAll(false);
                      }}
                      className="px-1 py-0.5 text-[9px] font-mono text-slate-400 hover:text-slate-200"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmPurgeAll(true);
                    }}
                    className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 hover:text-rose-400 transition-colors"
                    title="Clear all saved audit reports"
                  >
                    CLEAR ALL
                  </button>
                )
              )}
              <button
                type="button"
                onClick={onRefresh}
                className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Refresh database records"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {audits.length === 0 ? (
            <div className="py-6 px-3 rounded-xl border border-dashed border-[#1a2333] text-center">
              <div className="text-[11px] text-slate-400 font-mono">
                No database records saved yet.
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1">
                Ingest or upload a clinical record to generate your first audit report.
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {audits.map((audit) => {
                const auditId = audit.id || audit.case_id || 'CASE-000';
                const score = audit.complianceScore ?? audit.compliance_rating ?? audit.primaryScore ?? 75;
                const verdict = audit.verdict || (score >= 80 ? 'Pass' : score >= 50 ? 'Flagged' : 'Failed');
                const patient = audit.patientName || audit.patient_name || 'Patient Record';
                const doctor = audit.doctorName || audit.doctor_name || 'Attending Physician';
                const hospital = audit.hospitalName || audit.hospital || 'Medical Center';

                const isPass = verdict.toLowerCase().includes('pass') || verdict.toLowerCase().includes('compliant');
                const isFlagged = verdict.toLowerCase().includes('flag');
                const isPendingConfirm = confirmDeleteId === auditId;

                return (
                  <div
                    key={auditId}
                    onClick={() => onSelectAudit(audit)}
                    className="p-2.5 rounded-xl border border-[#162030] bg-[#090e18] hover:border-[#273852] hover:bg-[#0c1424] transition-all cursor-pointer group relative"
                    title={`Load ${auditId} into current tab`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-mono text-[9px] font-bold text-slate-400 group-hover:text-cyan-400 uppercase tracking-wider">
                            {auditId}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                          {patient}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                            isPass
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isFlagged
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isPass ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : isFlagged ? (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5" />
                          )}
                          {score}%
                        </span>

                        {/* Interactive Delete with Confirmation */}
                        {onDeleteAudit && (
                          <div className="flex items-center relative z-20">
                            {isPendingConfirm ? (
                              <div className="flex items-center gap-0.5 bg-rose-950/90 border border-rose-500/50 rounded-lg p-0.5 shadow-lg">
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteClick(e, auditId)}
                                  className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-0.5"
                                  title="Confirm Delete"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Del</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelDelete}
                                  className="p-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteClick(e, auditId)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer opacity-40 group-hover:opacity-100"
                                title={`Delete ${auditId} from database`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      {doctor}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {hospital}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-[#1a2333] bg-[#060910] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PERSISTENCE SYNCED
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#121b2f] rounded transition-colors cursor-pointer"
          title="Refresh repository audits"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
