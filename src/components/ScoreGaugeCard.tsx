import React from 'react';

interface ScoreGaugeCardProps {
  score: number;
  verdict: string;
  isAuditing?: boolean;
}

export const ScoreGaugeCard: React.FC<ScoreGaugeCardProps> = ({
  score,
  verdict,
  isAuditing = false,
}) => {
  const isPass = verdict.toLowerCase().includes('pass') || verdict.toLowerCase().includes('compliant');
  const isFlagged = verdict.toLowerCase().includes('flag');
  const isAwaiting = verdict.toLowerCase().includes('await') || score === 0;

  // Determine stroke & glow colors
  let primaryColor = '#38bdf8'; // cyan default
  let strokeColor = '#38bdf8';
  let glowColor = 'rgba(56, 189, 248, 0.25)';

  if (!isAwaiting) {
    if (score >= 80 || isPass) {
      primaryColor = '#34d399'; // Emerald
      strokeColor = '#10b981';
      glowColor = 'rgba(16, 185, 129, 0.3)';
    } else if (score >= 50 || isFlagged) {
      primaryColor = '#fbbf24'; // Amber
      strokeColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.3)';
    } else {
      primaryColor = '#f87171'; // Rose
      strokeColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.3)';
    }
  } else {
    primaryColor = '#94a3b8';
    strokeColor = '#334155';
    glowColor = 'transparent';
  }

  // Calculate SVG arc
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Let's make an open circular arc or full circular gauge
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0c1220]/90 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg h-full min-h-[360px]">
      {/* Background ambient radial glow */}
      <div
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: isAwaiting ? '#0284c7' : strokeColor }}
      />

      {/* Radial Gauge SVG */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#151e2e"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Foreground Progress Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={isAwaiting ? '#1f293d' : strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={isAwaiting ? circumference : progressOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: isAwaiting ? 'none' : `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-bold font-mono tracking-tight transition-colors duration-500 ${
              isAwaiting ? 'text-white' : ''
            }`}
            style={{ color: isAwaiting ? '#ffffff' : primaryColor }}
          >
            {isAuditing ? (
              <span className="animate-pulse">--%</span>
            ) : (
              `${score}%`
            )}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase mt-1">
            OVERALL SCORE
          </span>
        </div>
      </div>

      {/* Audit Status Verdict */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-400 uppercase">
          AUDIT STATUS VERDICT
        </span>

        <div
          className={`text-base sm:text-lg font-mono font-black tracking-widest uppercase transition-all duration-500 ${
            isAwaiting
              ? 'text-slate-300'
              : ''
          }`}
          style={{ color: isAwaiting ? '#cbd5e1' : primaryColor }}
        >
          {isAuditing ? (
            <span className="inline-flex items-center gap-2 animate-pulse text-cyan-400">
              ANALYZING SEQUENCE...
            </span>
          ) : (
            verdict || 'AWAITING AUDIT...'
          )}
        </div>
      </div>
    </div>
  );
};
