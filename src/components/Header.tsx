import React from "react";
import { Shield, Inbox, Building, HelpCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingComplaintsCount: number;
  checkingApi: boolean;
  isApiReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingComplaintsCount,
  checkingApi,
  isApiReady,
}) => {
  return (
    <header className="flex items-center justify-between px-6 bg-[#161B22]/90 backdrop-blur-md border-b border-[#30363D]/80 select-none shadow-lg z-20 h-15 shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#21262D]/90 border border-blue-500/40 flex items-center justify-center shadow-md shadow-blue-500/5 transition-transform duration-200 hover:scale-105">
          <Shield className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-wider text-white flex items-center gap-1.5 uppercase">
            🩺 MedicalAuditor v2.1{" "}
            <span className="text-[8px] tracking-widest uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#58A6FF] border border-blue-500/20 shadow-sm">
              Clinical Forensics Engine
            </span>
          </h1>
        </div>
      </div>

      {/* Global Nav Tabs */}
      <div className="flex gap-1 h-full pt-1.5">
        <button
          onClick={() => setActiveTab("investigator")}
          className={`px-4 text-xs font-semibold border-b-2 hover:text-white transition-all flex items-center gap-2 h-13 uppercase tracking-widest cursor-pointer ${
            activeTab === "investigator"
              ? "border-blue-500 text-white bg-[#0D1117]/60"
              : "border-transparent text-[#8B949E] hover:bg-[#161B22]/40"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Forensic Investigator
        </button>

        <button
          onClick={() => setActiveTab("complaints")}
          className={`px-4 text-xs font-semibold border-b-2 hover:text-white transition-all flex items-center gap-2 h-13 relative uppercase tracking-widest cursor-pointer ${
            activeTab === "complaints"
              ? "border-blue-500 text-white bg-[#0D1117]/60"
              : "border-transparent text-[#8B949E] hover:bg-[#161B22]/40"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Complaint Review Queue
          {pendingComplaintsCount > 0 && (
            <span className="absolute top-2.5 right-1.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold bg-[#F85149] text-white flex items-center justify-center shadow shadow-red-500/20 animate-pulse">
              {pendingComplaintsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("registry")}
          className={`px-4 text-xs font-semibold border-b-2 hover:text-white transition-all flex items-center gap-2 h-13 uppercase tracking-widest cursor-pointer ${
            activeTab === "registry"
              ? "border-blue-500 text-white bg-[#0D1117]/60"
              : "border-transparent text-[#8B949E] hover:bg-[#161B22]/40"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Analytics & Reliability Registry
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`px-4 text-xs font-semibold border-b-2 hover:text-white transition-all flex items-center gap-2 h-13 uppercase tracking-widest cursor-pointer ${
            activeTab === "about"
              ? "border-blue-500 text-white bg-[#0D1117]/60"
              : "border-transparent text-[#8B949E] hover:bg-[#161B22]/40"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          System Guide
        </button>
      </div>

      {/* Dynamic connection badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {checkingApi ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
              <span className="font-mono text-[10px]">Syncing connection...</span>
            </div>
          ) : isApiReady ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/40 text-[#3FB950] border border-[#2ea043]/30 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] animate-pulse"></span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">API READY</span>
            </div>
          ) : (
            <div className="group relative inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-950/40 text-[#F85149] border border-red-800/20 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F85149]"></span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">SIMULATION DRIVEN</span>
              <div className="absolute right-0 top-6.5 hidden group-hover:block bg-[#161B22] border border-[#30363D] rounded p-2 text-[9px] leading-relaxed w-52 text-[#8B949E] shadow-2xl z-50">
                Audit engine runs with professional clinical simulation models. Add process.env.GEMINI_API_KEY for dynamic
                live PDF analysis.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
