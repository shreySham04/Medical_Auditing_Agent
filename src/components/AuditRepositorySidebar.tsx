import React, { useState } from 'react';
import { Clock, Folder, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Trash2, Check, X, Plus, FilePlus2 } from 'lucide-react';
import { AuditRecord } from '../types';

interface AuditRepositorySidebarProps {
  audits: AuditRecord[];
  selectedAuditId: string | null;
  onSelectAudit: (audit: AuditRecord) => void;
  onNewAudit: () => void;
  onRefresh: () => void;
  onOpenDirectoryModal: () => void;
  onDeleteAudit?: (auditId: string) => void;
}

export const AuditRepositorySidebar: React.FC<AuditRepositorySidebarProps> = ({
  audits,
  selectedAuditId,
  onSelectAudit,
  onNewAudit,
  onRefresh,
  onOpenDirectoryModal,
  onDeleteAudit,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, auditId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDeleteId === auditId) {
      // Confirmed -> delete immediately
      if (onDeleteAudit) {
        onDeleteAudit(auditId);
      }
      setConfirmDeleteId(null);
    } else {
      // Prompt inline confirmation
      setConfirmDeleteId(auditId);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDeleteId(null);
  };

  const isDraftActive = !selectedAuditId || selectedAuditId === 'NEW_DRAFT';

  return (
    <aside className="w-72 sm:w-80 flex-shrink-0 bg-[#070b12] border-r border-[#1a2333] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1a2333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Audits ({audits.length})
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

      {/* Action: Add New Report Tab Button */}
      <div className="p-3 border-b border-[#1a2333]/80 bg-[#080d17]">
        <button
          type="button"
          onClick={onNewAudit}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-mono text-xs font-bold tracking-wide transition-all cursor-pointer shadow-sm ${
            isDraftActive
              ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
              : 'bg-[#0d1527] hover:bg-cyan-950/40 border border-[#21304a] hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300'
          }`}
          title="Create a new audit report tab"
        >
          <div className="w-4 h-4 rounded-md bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>+ NEW REPORT TAB</span>
        </button>
      </div>

      {/* Audit List or Empty State */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {/* Active Draft Tab Card if in Draft mode */}
        {isDraftActive && (
          <div
            onClick={onNewAudit}
            className="p-3 rounded-xl border border-cyan-500/60 bg-[#0d1829] shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30 cursor-pointer relative"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  NEW AUDIT DRAFT
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                ACTIVE TAB
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white truncate mb-1">
              Awaiting Document Ingestion...
            </h4>
            <div className="text-[10px] text-slate-400 font-mono">
              Upload PDF / TXT to execute audit
            </div>
          </div>
        )}

        {audits.length === 0 && !isDraftActive ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
            <div className="w-14 h-14 rounded-2xl border border-[#212c40] bg-[#0c1322] flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <Folder className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="text-xs text-slate-400 max-w-[210px] leading-relaxed font-sans">
              No previous medical audits found. Click "+ New Report Tab" or select a case to begin.
            </p>
          </div>
        ) : (
          audits.map((audit) => {
            const auditId = audit.id || audit.case_id || 'CASE-000';
            const isSelected = auditId === selectedAuditId;
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
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                  isSelected
                    ? 'bg-[#0f172a] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'bg-[#0b101c] border-[#1a2333] hover:border-[#2b3a54] hover:bg-[#0e1526]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        {auditId}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {patient}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Score Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
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

                    {/* Interactive Delete Button with Inline Confirm */}
                    {onDeleteAudit && (
                      <div className="flex items-center gap-1 relative z-20">
                        {isPendingConfirm ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/50 rounded-lg p-0.5 shadow-lg animate-in fade-in">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, auditId)}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-0.5"
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-slate-800/80 hover:border-rose-500/40 transition-all cursor-pointer"
                            title={`Delete ${auditId}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 truncate mb-1">
                  {doctor}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {hospital}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Directory Footer Actions */}
      <div className="p-3 border-t border-[#1a2333] bg-[#060910] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          FASTAPI / REST LINKED
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#121b2f] rounded transition-colors cursor-pointer"
          title="Refresh repository audits"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
