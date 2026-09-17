import React from 'react';
import { Plus, X, FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ReportTab } from '../types';

interface ReportTabBarProps {
  tabs: ReportTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
}

export const ReportTabBar: React.FC<ReportTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-[#1a2333] bg-[#070b13] px-3 py-1.5 gap-2 overflow-x-auto flex-shrink-0">
      {/* Tabs list */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          const isAudited = Boolean(tab.audit && tab.score > 0);
          const isPass = tab.verdict?.toLowerCase().includes('pass');
          const isFlagged = tab.verdict?.toLowerCase().includes('flag');

          const displayName = tab.patientName || tab.title || `Report Tab #${idx + 1}`;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? 'bg-[#0f172a] border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/30 font-bold'
                  : 'bg-[#090d16] border-[#1a2333] text-slate-400 hover:text-slate-200 hover:border-[#2a384e] hover:bg-[#0c1220]'
              }`}
              title={displayName}
            >
              {/* Tab Icon / Status */}
              <div className="flex items-center gap-1.5">
                {isAudited ? (
                  isPass ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : isFlagged ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-rose-400" />
                  )
                ) : (
                  <FileText className={`w-3 h-3 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                )}

                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {displayName}
                </span>
              </div>

              {/* Score or Draft Pill */}
              {isAudited ? (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                    isPass
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isFlagged
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {tab.score}%
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  DRAFT
                </span>
              )}

              {/* Close Button: only if more than 1 tab open */}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors ml-0.5"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Plus Button to explicitly add a new report tab */}
        <button
          type="button"
          onClick={onNewTab}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-[#243249] hover:border-cyan-500/60 bg-[#090d16] hover:bg-cyan-950/20 text-slate-400 hover:text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          title="Open a new report tab"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Tab</span>
        </button>
      </div>

      {/* Tab count info */}
      <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 whitespace-nowrap">
        <span>
          {tabs.length} {tabs.length === 1 ? 'TAB' : 'TABS'} OPEN
        </span>
      </div>
    </div>
  );
};
