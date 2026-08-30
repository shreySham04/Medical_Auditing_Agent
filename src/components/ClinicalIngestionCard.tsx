import React, { useRef, useState } from 'react';
import { UploadCloud, Shield, FileText, CheckCircle2, X } from 'lucide-react';
import { ClinicianParams } from '../types';

interface ClinicalIngestionCardProps {
  clinicianParams: ClinicianParams;
  onUpdateParams: (params: Partial<ClinicianParams>) => void;
  onFileUpload: (file: File) => void;
  onSelectStandardFile: () => void;
  onClearFile?: () => void;
  loadedFileName?: string;
}

export const ClinicalIngestionCard: React.FC<ClinicalIngestionCardProps> = ({
  clinicianParams,
  onUpdateParams,
  onFileUpload,
  onSelectStandardFile,
  onClearFile,
  loadedFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const isPending = (val: string) => !val || val.toLowerCase().includes('pending');

  return (
    <div className="flex flex-col gap-4">
      {/* Drag & Drop Clinical Records Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            : 'border-[#1e293b] bg-[#0c1220]/80 hover:border-cyan-500/50 hover:bg-[#0f172a]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.json,.md,.csv,.xml"
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase mb-1">
          Drag & Drop Clinical Record / EHR
        </h3>
        <p className="text-[11px] text-slate-400 max-w-[290px] leading-relaxed mb-2 font-sans">
          Supports clinical charts, discharge summaries, operative notes, and medical billing claims (PDF / TXT, Max 10MB)
        </p>

        {loadedFileName ? (
          <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] max-w-full">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[170px]">{loadedFileName}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            {onClearFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFile();
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStandardFile();
            }}
            className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 tracking-wider uppercase underline underline-offset-4 cursor-pointer mt-1"
          >
            Or Select Standard System Files
          </button>
        )}
      </div>

      {/* Target Clinician Parameter Settings */}
      <div className="p-5 rounded-2xl border border-[#1e293b] bg-[#0c1220]/90 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
          </div>
          <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-200 uppercase">
            Target Clinician Parameter Settings
          </h4>
        </div>

        {/* Row 1: Doctor Name & Specialization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Doctor Name */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 gap-1 overflow-hidden">
              <span className="truncate">ATTENDING DOCTOR</span>
              <span className="px-1.5 py-0.2 rounded border border-[#2b3a54] bg-[#070b14] text-slate-400 text-[8px] flex-shrink-0">
                AUTO
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b] text-xs font-mono text-slate-300 min-w-0">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isPending(clinicianParams.doctorName)
                    ? 'bg-slate-600'
                    : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
              />
              <input
                type="text"
                value={clinicianParams.doctorName}
                onChange={(e) => onUpdateParams({ doctorName: e.target.value })}
                placeholder="Pending Ingestion"
                className="bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-slate-500 text-slate-200 truncate"
              />
            </div>
          </div>

          {/* Physician Specialization */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 gap-1 overflow-hidden">
              <span className="truncate">SPECIALIZATION</span>
              <span className="px-1.5 py-0.2 rounded border border-[#2b3a54] bg-[#070b14] text-slate-400 text-[8px] flex-shrink-0">
                AUTO
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b] text-xs font-mono text-slate-300 min-w-0">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isPending(clinicianParams.specialization)
                    ? 'bg-slate-600'
                    : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
              />
              <input
                type="text"
                value={clinicianParams.specialization}
                onChange={(e) => onUpdateParams({ specialization: e.target.value })}
                placeholder="Pending Ingestion"
                className="bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-slate-500 text-slate-200 truncate"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Hospital Facility Name */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 gap-1 overflow-hidden">
            <span className="truncate">HOSPITAL FACILITY NAME</span>
            <span className="px-1.5 py-0.2 rounded border border-[#2b3a54] bg-[#070b14] text-slate-400 text-[8px] flex-shrink-0">
              AUTO
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b] text-xs font-mono text-slate-300 min-w-0">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isPending(clinicianParams.hospitalName)
                  ? 'bg-slate-600'
                  : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
              }`}
            />
            <input
              type="text"
              value={clinicianParams.hospitalName}
              onChange={(e) => onUpdateParams({ hospitalName: e.target.value })}
              placeholder="Pending Ingestion"
              className="bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-slate-500 text-slate-200 truncate"
            />
          </div>
        </div>

        {/* Row 3: Acuity Department Division */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 gap-1 overflow-hidden">
            <span className="truncate">ACUITY DEPARTMENT DIVISION</span>
            <span className="px-1.5 py-0.2 rounded border border-[#2b3a54] bg-[#070b14] text-slate-400 text-[8px] flex-shrink-0">
              AUTO
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b] text-xs font-mono text-slate-300 min-w-0">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isPending(clinicianParams.department)
                  ? 'bg-slate-600'
                  : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
              }`}
            />
            <input
              type="text"
              value={clinicianParams.department}
              onChange={(e) => onUpdateParams({ department: e.target.value })}
              placeholder="Pending Ingestion"
              className="bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-slate-500 text-slate-200 truncate"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
