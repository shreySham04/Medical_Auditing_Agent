import React from 'react';
import { ShieldCheck, Scale, Building2, HelpCircle, Activity, Server, FileCheck, Award } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendHealthy: boolean;
  trainingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
}) => {
  const tabs = [
    { id: 'investigator', label: 'FORENSIC INVESTIGATOR', icon: ShieldCheck },
    { id: 'dataset', label: 'SYNTHETIC BENCHMARK & EVALUATION', icon: Award },
    { id: 'analytics', label: 'HUMAN-FEEDBACK CALIBRATION', icon: Building2 },
    { id: 'queue', label: 'COMPLAINT REVIEW QUEUE', icon: Scale },
    { id: 'guide', label: 'SYSTEM ARCHITECTURE GUIDE', icon: HelpCircle },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0c1017]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0c1017] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">MedicalAuditor</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Research Prototype v2.1
                </span>
                <span className="hidden sm:inline-block text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Rule Grounding & Calibration
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Evidence-Based Multi-Agent Clinical & Billing Compliance Audit Pipeline
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Evidence Engine: <strong className="text-slate-100 font-mono">CMS/AMA Grounded</strong></span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isBackendHealthy
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Activity className={`w-3.5 h-3.5 ${isBackendHealthy ? 'animate-pulse' : ''}`} />
              <span className="font-medium">
                {isBackendHealthy ? 'Calibrated Engine Active' : 'Connecting to Backend...'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-px no-scrollbar border-t border-slate-800/40 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
