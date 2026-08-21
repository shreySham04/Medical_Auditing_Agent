import React from 'react';
import {
  FileText,
  Cpu,
  Stethoscope,
  CreditCard,
  ClipboardCheck,
  Scale,
  Play,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { PipelineStage } from '../types';

interface MultiAgentPipelineCardProps {
  stages: PipelineStage[];
  isRunningAudit: boolean;
  onRunAudit: () => void;
  canRun: boolean;
  hasDocument: boolean;
}

export const MultiAgentPipelineCard: React.FC<MultiAgentPipelineCardProps> = ({
  stages,
  isRunningAudit,
  onRunAudit,
  canRun,
  hasDocument,
}) => {
  const getIcon = (type: PipelineStage['iconType'], status: PipelineStage['status']) => {
    const isCompleted = status === 'completed';
    const isRunning = status === 'running';

    const baseClass = `w-4 h-4 transition-colors ${
      isCompleted
        ? 'text-cyan-400'
        : isRunning
        ? 'text-cyan-300 animate-pulse'
        : 'text-slate-400'
    }`;

    switch (type) {
      case 'file':
        return <FileText className={baseClass} />;
      case 'cpu':
        return <Cpu className={baseClass} />;
      case 'stethoscope':
        return <Stethoscope className={baseClass} />;
      case 'card':
        return <CreditCard className={baseClass} />;
      case 'clipboard':
        return <ClipboardCheck className={baseClass} />;
      case 'scale':
        return <Scale className={baseClass} />;
      default:
        return <Cpu className={baseClass} />;
    }
  };

  const getBadgeStyle = (status: PipelineStage['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold';
      case 'running':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 animate-pulse font-bold';
      case 'awaiting':
      case 'pending':
      default:
        return 'bg-[#0f172a] text-slate-400 border-[#1e293b] font-medium';
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-[#1e293b] bg-[#0c1220]/90 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div>
        <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-1">
          Multi-Agent Forensic Pipeline
        </h3>
        <p className="text-[11px] text-slate-400 font-sans leading-tight mb-4">
          Real-time sequence tracing across specialized analytical agents.
        </p>

        {/* Timeline List */}
        <div className="relative pl-6 space-y-4 my-2">
          {/* Vertical Dashed Line */}
          <div className="absolute left-[11px] top-2 bottom-3 w-[1px] border-l border-dashed border-slate-700 pointer-events-none" />

          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isRunning = stage.status === 'running';

            return (
              <div key={stage.id} className="relative flex items-start justify-between gap-2 group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#0b1b2b] border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : isRunning
                      ? 'bg-cyan-950 border-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      : 'bg-[#090d16] border-[#222f44]'
                  }`}
                >
                  {getIcon(stage.iconType, stage.status)}
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1 pr-1">
                  <h4 className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {stage.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border whitespace-nowrap ${getBadgeStyle(
                    stage.status
                  )}`}
                >
                  {isRunning ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      RUNNING
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {stage.statusLabel || 'COMPLETED'}
                    </span>
                  ) : (
                    stage.statusLabel || 'PENDING'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-[#1e293b]">
        <button
          type="button"
          onClick={onRunAudit}
          disabled={isRunningAudit || !hasDocument}
          className={`w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
            isRunningAudit
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 cursor-wait'
              : !hasDocument
              ? 'bg-[#080d16] border-[#1e293b] text-slate-500 cursor-not-allowed opacity-75'
              : 'bg-[#0f192c] hover:bg-cyan-500/20 text-cyan-400 hover:text-white border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer'
          }`}
          title={!hasDocument ? 'Please upload a PDF or select a case first' : 'Execute multi-agent audit'}
        >
          {isRunningAudit ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>RUNNING MULTI-AGENT PIPELINE...</span>
            </>
          ) : !hasDocument ? (
            <>
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>INGEST DOCUMENT TO AUDIT</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
              <span>RUN FORENSIC AUDIT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
