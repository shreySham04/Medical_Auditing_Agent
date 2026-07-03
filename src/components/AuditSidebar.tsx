import React, { useState } from "react";
import { Clock, Folder, FileText, Trash2 } from "lucide-react";
import { AuditItem } from "../types";

interface AuditSidebarProps {
  audits: AuditItem[];
  selectedAuditId: string | null;
  syncActiveItem: (item: AuditItem) => void;
  purgeAuditFile: (id: string, e: React.MouseEvent) => void;
}

export const AuditSidebar: React.FC<AuditSidebarProps> = ({
  audits,
  selectedAuditId,
  syncActiveItem,
  purgeAuditFile,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <aside className="w-72 bg-[#10141D] border-r border-[#21262D] flex flex-col overflow-hidden h-full shadow-inner select-none">
      <div className="p-4 border-b border-[#21262D] bg-[#090D14]/80 flex items-center justify-between select-none">
        <span className="text-[10px] font-bold uppercase text-[#8B949E] tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" /> Audit Repository ({audits.length})
        </span>
        <span className="text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 bg-blue-950/40 rounded-full text-blue-400 border border-blue-800/30">
          SYSTEM DIRECTORY
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {audits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 h-full font-mono text-[10px] leading-relaxed">
            <Folder className="w-6 h-6 text-[#30363D] mb-1.5" />
            <span>No previous medical audits found on directory. Ingest a document model to record findings.</span>
          </div>
        ) : (
          audits.map((item) => {
            const isSelected = selectedAuditId === item.id;
            const isConfirming = confirmDeleteId === item.id;
            const ratingColor =
              item.complianceScore >= 70
                ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/20"
                : item.complianceScore >= 40
                ? "text-amber-400 bg-amber-950/30 border-amber-500/20"
                : "text-red-400 bg-red-950/30 border-red-500/20";

            return (
              <div
                key={item.id}
                onClick={() => syncActiveItem(item)}
                className={`group p-3 pl-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                  isSelected
                    ? "bg-[#161B22] border-blue-500/30 shadow-md shadow-blue-500/5"
                    : "bg-[#11151C]/60 border-transparent hover:bg-[#161B22]/40 hover:border-[#21262D]"
                }`}
              >
                {/* Dynamic Score Left Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.complianceScore > 70
                      ? "bg-emerald-500"
                      : item.complianceScore >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-100 truncate pr-4" title={item.fileName}>
                      {item.fileName}
                    </span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-1.5 rounded border leading-none py-0.5 ${ratingColor}`}>
                    {item.complianceScore}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 font-medium">
                      {(item.doctorName || "Unknown Doctor").replace("Dr. ", "")}
                    </span>
                    <span>•</span>
                    <span>{item.department || "General"}</span>
                  </div>
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}</span>
                </div>

                <div className="flex items-center justify-between text-[9px] mt-0.5">
                  {item.complaint ? (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[8.5px] uppercase font-bold tracking-wider leading-none ${
                        item.complaint.status === "REGISTERED"
                          ? "bg-red-950 text-[#F85149] border border-red-800/30"
                          : "bg-amber-950/60 text-[#D29922] border border-amber-800/20"
                      }`}
                    >
                      {item.complaint.status}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-mono text-[8px] uppercase">Review Clean</span>
                  )}
                </div>

                {/* Delete confirmation overlay */}
                {isConfirming ? (
                  <div 
                    className="absolute inset-0 bg-[#0d1117]/95 flex flex-col items-center justify-center p-2 z-10 text-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-gray-200 font-bold">Purge record permanently?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          purgeAuditFile(item.id, e);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase px-2 py-1 rounded cursor-pointer"
                      >
                        Yes, Purge
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[9px] font-bold uppercase px-2 py-1 rounded border border-[#21262D] cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Delete entry icon button */
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(item.id);
                    }}
                    className="absolute right-1 bottom-1 p-1 rounded hover:bg-red-950/40 hover:text-[#F85149] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    title="Purge log session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
