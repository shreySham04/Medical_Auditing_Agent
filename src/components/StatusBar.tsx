import React from 'react';
import { Zap } from 'lucide-react';

interface StatusBarProps {
  systemStatus: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ systemStatus }) => {
  return (
    <footer className="h-8 flex-shrink-0 bg-[#050810] border-t border-[#121927] px-4 flex items-center justify-between text-[11px] font-mono select-none">
      {/* Left System Status */}
      <div className="flex items-center gap-2 truncate">
        <span className="text-[#475569]">System Status:</span>
        <span className="text-[#cbd5e1] font-semibold truncate">{systemStatus}</span>
      </div>

      {/* Right Platform Credentials */}
      <div className="flex items-center gap-3 flex-shrink-0 text-[10px]">
        <div className="flex items-center gap-1.5 text-[#ffd600] font-bold tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-[#ffd600] text-[#ffd600]" />
          <span>POSITIVE INTEGRATION READY</span>
        </div>
        <span className="text-[#64748b] hidden sm:inline font-mono">
          © 2026 MedicalAuditor Forensics Hub
        </span>
      </div>
    </footer>
  );
};
