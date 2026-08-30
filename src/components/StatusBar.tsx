import React from 'react';
import { Zap } from 'lucide-react';

interface StatusBarProps {
  systemStatus: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ systemStatus }) => {
  return (
    <footer className="h-8 flex-shrink-0 bg-[#050810] border-t border-[#121927] px-4 flex items-center justify-between text-[11px] font-mono select-none overflow-hidden z-20">
      {/* Left System Status with proper min-w-0 and truncation */}
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-3 overflow-hidden">
        <span className="text-[#475569] flex-shrink-0 text-[10px] tracking-wider uppercase">System Status:</span>
        <span className="text-[#cbd5e1] font-semibold truncate block" title={systemStatus}>
          {systemStatus}
        </span>
      </div>

      {/* Right Platform Credentials */}
      <div className="flex items-center gap-3 flex-shrink-0 text-[10px]">
        <div className="flex items-center gap-1.5 text-[#ffd600] font-bold tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-[#ffd600] text-[#ffd600]" />
          <span className="hidden sm:inline">DOCTRINE INTEGRATION READY</span>
          <span className="sm:hidden">READY</span>
        </div>
        <span className="text-[#64748b] hidden md:inline font-mono">
          © 2026 MedicalAuditor Forensics Hub
        </span>
      </div>
    </footer>
  );
};

