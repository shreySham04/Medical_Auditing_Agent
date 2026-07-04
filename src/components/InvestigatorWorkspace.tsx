import React from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Download,
  RefreshCw,
  Play,
  Layers,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { AuditItem } from "../types";
import { MarkdownViewer } from "./MarkdownViewer";

interface InvestigatorWorkspaceProps {
  activeAudit: AuditItem | null;
  investigatorSubView: "report" | "patient" | "locker" | "ai";
  setInvestigatorSubView: (view: "report" | "patient" | "locker" | "ai") => void;
  selectedFile: { name: string; size: string; type: string; data: string } | null;
  isLoading: boolean;
  auditStage: "idle" | "ingesting" | "primary_agent" | "verification_agent" | "completed" | "failed";
  auditStageMessage: string;
  verdictText: string;
  verdictState: "none" | "Pass" | "Flagged" | "Failed";
  savedPathMsg: string;
  executeComplianceAudit: () => void;
  triggerPicker: () => void;
  isRecheckingAsSupervisor: boolean;
  triggerSupervisorRecheck: () => void;
  supervisorError: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  doctorName: string;
  setDoctorName: (name: string) => void;
  doctorSpecialization: string;
  setDoctorSpecialization: (spec: string) => void;
  hospitalName: string;
  setHospitalName: (name: string) => void;
  department: "Cardiology" | "Orthopedics" | "Radiology" | "Emergency Medicine";
  setDepartment: (dept: "Cardiology" | "Orthopedics" | "Radiology" | "Emergency Medicine") => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleInputUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOverHandler: (e: React.DragEvent) => void;
  onDragLeaveHandler: (e: React.DragEvent) => void;
  onDropHandler: (e: React.DragEvent) => void;
  isDragging: boolean;
  clearWorkspace: () => void;
  targetScore: number;
}

const getForensicLockerExplanation = (audit: AuditItem | null) => {
  if (!audit) return null;

  const evidenceFindings = audit.explainableAI?.evidenceFindings;
  const hasDynamicFindings = evidenceFindings && evidenceFindings.length > 0;
  const dynamicSummary = audit.complaint?.evidenceSummary;
  const whyScoreDropped = audit.explainableAI?.whyScoreDropped;
  const deductionSummary = audit.complaint?.evidenceLockerExcerpt;

  if (hasDynamicFindings) {
    return (
      <div className="space-y-3">
        {dynamicSummary && (
          <p className="text-gray-300 text-[11px] leading-relaxed font-mono">
            {dynamicSummary}
          </p>
        )}
        <div className="space-y-2">
          {evidenceFindings.map((findingItem, idx) => {
            const isConfirmed = findingItem.confidence === "Confirmed";
            const isLikely = findingItem.confidence === "Likely";

            let badgeColor = "text-red-400 bg-red-950/30 border-red-900/40";
            let dotColor = "bg-red-400";
            if (isConfirmed) {
              badgeColor = "text-emerald-400 bg-emerald-950/30 border-emerald-900/40";
              dotColor = "bg-emerald-400";
            } else if (isLikely) {
              badgeColor = "text-amber-400 bg-amber-950/30 border-amber-900/40";
              dotColor = "bg-amber-400";
            }

            const cleanFindingName = findingItem.finding.replace(/\**$/, "").trim();
            const category = findingItem.category || "General Compliance";
            const severity = findingItem.severity || "Medium";
            const remediation = findingItem.remediation || "Adhere to standard billing and clinical guidelines.";

            let severityColor = "text-gray-400 bg-gray-900/30 border-gray-800";
            if (severity === "Critical") severityColor = "text-rose-400 bg-rose-950/30 border-rose-900/40";
            else if (severity === "High") severityColor = "text-orange-400 bg-orange-950/30 border-orange-900/40";
            else if (severity === "Medium") severityColor = "text-amber-400 bg-amber-950/30 border-amber-900/40";
            else if (severity === "Low") severityColor = "text-sky-400 bg-sky-950/30 border-sky-900/40";

            return (
              <div key={idx} className="p-3 rounded bg-[#0D1117]/60 border border-[#30363D] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                    <span className="font-semibold text-gray-200 text-[11px]">
                      {cleanFindingName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 font-mono border border-gray-700">
                      {category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${severityColor}`}>
                      {severity}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${badgeColor}`}>
                      {findingItem.confidence}
                    </span>
                  </div>
                </div>
                {findingItem.explanation && (
                  <p className="text-[10px] text-gray-400 leading-relaxed pl-3 font-mono">
                    {findingItem.explanation}
                  </p>
                )}
                {remediation && (
                  <div className="mt-1.5 p-2 rounded bg-emerald-950/15 border border-emerald-900/20 text-[10px] font-mono text-emerald-300/90 leading-relaxed">
                    <span className="font-semibold text-emerald-400">💡 Dynamic Corrective Action:</span> {remediation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-[11px]">
      {dynamicSummary ? (
        <div className="space-y-1">
          <span className="text-amber-400 font-bold block">Summary of Compliance Deviation</span>
          <p className="text-gray-300 leading-relaxed">{dynamicSummary}</p>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed">
          No specific standard-of-care deviations detected. The patient chart shows strong compliance with current hospital clinical and financial billing guidelines.
        </p>
      )}
      {whyScoreDropped && (
        <div className="space-y-1">
          <span className="text-amber-400 font-bold block">Impact on Audit Rating</span>
          <p className="text-gray-300 leading-relaxed">{whyScoreDropped}</p>
        </div>
      )}
      {deductionSummary && (
        <div className="space-y-1">
          <span className="text-amber-400 font-bold block">Specific Point Deductions</span>
          <p className="text-gray-300 leading-relaxed">{deductionSummary}</p>
        </div>
      )}
    </div>
  );
};

export const InvestigatorWorkspace: React.FC<InvestigatorWorkspaceProps> = ({
  activeAudit,
  investigatorSubView,
  setInvestigatorSubView,
  selectedFile,
  isLoading,
  auditStage,
  auditStageMessage,
  verdictText,
  verdictState,
  savedPathMsg,
  executeComplianceAudit,
  triggerPicker,
  isRecheckingAsSupervisor,
  triggerSupervisorRecheck,
  supervisorError,
  canvasRef,
  doctorName,
  setDoctorName,
  doctorSpecialization,
  setDoctorSpecialization,
  hospitalName,
  setHospitalName,
  department,
  setDepartment,
  fileInputRef,
  handleInputUpload,
  onDragOverHandler,
  onDragLeaveHandler,
  onDropHandler,
  isDragging,
  clearWorkspace,
  targetScore,
}) => {
  const [currentScore, setCurrentScore] = React.useState<number>(0);
  const [supervisorTab, setSupervisorTab] = React.useState<"overview" | "agents" | "guidelines" | "redteam">("overview");

  // Soft animation tick for rating gauge
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScore((prev) => {
        if (prev < targetScore) {
          return Math.min(prev + 2, targetScore);
        } else if (prev > targetScore) {
          return Math.max(prev - 2, targetScore);
        }
        return prev;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [targetScore]);

  // Redraw circular canvas ScoreMeter
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const x = width / 2;
    const y = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Outer Background Track
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = "#1C2128";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Determine color code based on compliance thresholds
    let gaugeColor = "#F85149"; // Critical (Red)
    if (currentScore >= 70) {
      gaugeColor = "#3FB950"; // Pass (Green)
    } else if (currentScore >= 40) {
      gaugeColor = "#D29922"; // Warn (Amber)
    }

    // Process arc ratio
    if (currentScore > 0) {
      const percentage = currentScore / 100;
      const startAngle = 0.75 * Math.PI;
      const endAngle = startAngle + 1.5 * Math.PI * percentage;

      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.strokeStyle = gaugeColor;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();

      // Soft layout glow ring
      ctx.beginPath();
      ctx.arc(x, y, radius - 8, startAngle, endAngle);
      ctx.strokeStyle = gaugeColor + "15";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Compliance Score Value
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Segoe UI', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${currentScore}%`, x, y - 5);

    ctx.fillStyle = "#8B949E";
    ctx.font = "bold 10px 'Segoe UI', Inter, sans-serif";
    ctx.fillText("OVERALL SCORE", x, y + 18);
  }, [currentScore]);

  const exportReport = () => {
    if (!activeAudit?.reportMarkdown) return;
    try {
      const anchorValue = document.createElement("a");
      const blob = new Blob([activeAudit.reportMarkdown], { type: "text/markdown;charset=utf-8" });
      anchorValue.href = URL.createObjectURL(blob);
      const docName = activeAudit?.doctorName || "Doctor";
      anchorValue.download = `Forensic_Audit_Report_${docName.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
      document.body.appendChild(anchorValue);
      anchorValue.click();
      document.body.removeChild(anchorValue);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-5 bg-[#090D14] space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Uploader area and customizable parameters */}
        <section className="xl:col-span-5 space-y-5">
          {/* UPLOAD CONTAINER */}
          <div
            onDragOver={onDragOverHandler}
            onDragLeave={onDragLeaveHandler}
            onDrop={onDropHandler}
            className={`border-2 border-dashed rounded-2xl p-6 text-center select-none cursor-pointer transition-all ${
              isDragging ? "border-blue-500 bg-blue-950/10 scale-[0.99]" : "border-[#30363D] hover:border-blue-500/50 bg-[#121620]/60"
            }`}
            onClick={triggerPicker}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputUpload}
              className="hidden"
              accept="application/pdf,image/png,image/jpeg,image/jpg"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3.5 rounded-full bg-[#1c212e] text-blue-400 border border-blue-500/10">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Drag & Drop Clinical Records
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  Supports electronic medical summaries, PDFs, or EKG scans (Max 10MB)
                </p>
              </div>
              {selectedFile ? (
                <div className="mt-2 inline-flex items-center gap-2 bg-[#1C2128] border border-[#30363D] px-3.5 py-1.5 rounded-xl text-xs max-w-full">
                  <span className="text-emerald-400 font-semibold font-mono">✓ Ingested:</span>
                  <span className="text-gray-200 truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-gray-500 text-[10px] font-mono shrink-0">({selectedFile.size})</span>
                </div>
              ) : (
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider font-mono mt-1">
                  Or select standard system files
                </span>
              )}
            </div>
          </div>

          {/* PARAMETERS TARGETING ENGINE */}
          <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              🛡️ Target Clinician Parameter Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Attending Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090D14] border border-[#21262D] text-white focus:outline-none focus:border-blue-500 select-text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Physician Specialization</label>
                <input
                  type="text"
                  value={doctorSpecialization}
                  onChange={(e) => setDoctorSpecialization(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090D14] border border-[#21262D] text-white focus:outline-none focus:border-blue-500 select-text"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Hospital Facility Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090D14] border border-[#21262D] text-white focus:outline-none focus:border-blue-500 select-text"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Acuity Department Division</label>
                <div className="w-full p-3 rounded-xl bg-[#090D14]/80 border border-[#21262D] text-blue-400 font-semibold text-xs flex items-center justify-between select-none shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>{department || "Not Assigned"}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider font-normal">Auto-detected from file</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Rating Gauge and Consensus tabs */}
        <section className="xl:col-span-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* radial compliance gauge gauge */}
            <div className="md:col-span-5 bg-[#121620] border border-[#21262D] rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-44 h-44 flex items-center justify-center select-none">
                <canvas ref={canvasRef} width="176" height="176" className="w-44 h-44" />
              </div>

              <div className="space-y-1 font-mono">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block">Audit Status Verdict</span>
                <span
                  className={`text-sm font-extrabold uppercase tracking-widest block ${
                    verdictState === "Pass"
                      ? "text-emerald-400"
                      : verdictState === "Flagged"
                      ? "text-amber-400 animate-pulse"
                      : verdictState === "Failed"
                      ? "text-red-500 font-black animate-bounce"
                      : "text-gray-400"
                  }`}
                >
                  {verdictText}
                </span>
                {savedPathMsg && (
                  <span className="text-[9px] text-gray-500 block truncate max-w-[200px]" title={savedPathMsg}>
                    📂 Ref: {savedPathMsg.split("/").pop()}
                  </span>
                )}
              </div>
            </div>

            {/* PIPELINE LIVE STAGES CHRONOMETER */}
            <div className="md:col-span-7 bg-[#121620] border border-[#21262D] rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1 select-none">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block font-mono">
                  Dual-Agent Forensic Chronometer
                </span>
                <p className="text-[10px] text-gray-400 font-mono">
                  Sequence mapping from document ingestion down to verified referee consensus.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                {/* Stage 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        auditStage === "completed" ||
                        auditStage === "primary_agent" ||
                        auditStage === "verification_agent"
                          ? "bg-emerald-500"
                          : auditStage === "ingesting"
                          ? "bg-blue-500 animate-ping"
                          : "bg-[#21262D]"
                      }`}
                    />
                    <span className="text-white font-medium">1. Document Ingestion Pipeline</span>
                  </div>
                  <span className="text-gray-500">Passed</span>
                </div>

                {/* Stage 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        auditStage === "completed" || auditStage === "verification_agent"
                          ? "bg-emerald-500"
                          : auditStage === "primary_agent"
                          ? "bg-blue-500 animate-ping"
                          : "bg-[#21262D]"
                      }`}
                    />
                    <span className="text-white font-medium">2. Primary Agent Clinical Audit</span>
                  </div>
                  <span className="text-gray-500">Passed</span>
                </div>

                {/* Stage 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        auditStage === "completed"
                          ? "bg-emerald-500"
                          : auditStage === "verification_agent"
                          ? "bg-pink-500 animate-ping"
                          : "bg-[#21262D]"
                      }`}
                    />
                    <span className="text-white font-medium">3. Dual-Agent Verification Consensus</span>
                  </div>
                  <span className="text-gray-500">Passed</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#21262D] pt-4 mt-1 font-mono">
                <div className="flex gap-2.5">
                  <button
                    onClick={executeComplianceAudit}
                    disabled={!selectedFile || isLoading}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all justify-center tracking-wider uppercase cursor-pointer ${
                      selectedFile && !isLoading
                        ? "bg-blue-600 hover:bg-blue-500 hover:scale-102 text-white shadow-lg shadow-blue-500/10"
                        : "bg-[#1c212e] text-gray-500 border border-[#21262D] cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-white" />
                        <span>Run Forensic Audit</span>
                      </>
                    )}
                  </button>
                  {selectedFile && (
                    <button
                      onClick={clearWorkspace}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-[#30363D] hover:bg-[#21262D] text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE FORENSICS TAB REVIEWS */}
          <div className="bg-[#121620] border border-[#21262D] rounded-2xl overflow-hidden shadow">
            {/* Tab controls */}
            <div className="flex justify-between items-center bg-[#161B22]/60 px-5 py-2.5 border-b border-[#21262D] select-none">
              <div className="flex items-center gap-1.5 bg-[#090D14] p-1 rounded-xl border border-[#21262D]">
                <button
                  onClick={() => setInvestigatorSubView("report")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    investigatorSubView === "report"
                      ? "bg-[#161B22] text-blue-400 border border-[#21262D] shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Forensic Report
                </button>
                <button
                  onClick={() => setInvestigatorSubView("patient")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    investigatorSubView === "patient"
                      ? "bg-[#161B22] text-blue-400 border border-[#21262D] shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Patient Translator
                </button>
                <button
                  onClick={() => setInvestigatorSubView("locker")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    investigatorSubView === "locker"
                      ? "bg-[#161B22] text-blue-400 border border-[#21262D] shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Evidence Locker
                </button>
                <button
                  onClick={() => setInvestigatorSubView("ai")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    investigatorSubView === "ai"
                      ? "bg-[#161B22] text-blue-400 border border-[#21262D] shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  🧠 Explainable AI
                </button>
              </div>

              {activeAudit && investigatorSubView === "report" && (
                <button
                  onClick={exportReport}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1c212e] hover:bg-[#252b3a] border border-[#21262D] text-white flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" /> Export Markdown (.md)
                </button>
              )}
            </div>

            {/* TAB SUB-CONTENT WINDOW STAGED FOR AUDITS */}
            <div className="p-5 bg-[#090D14] min-h-[300px] max-h-[480px] overflow-y-auto custom-scrollbar select-text selection:bg-blue-900/30">
              {/* OPTION A: TECHNICAL FORENSIC REPORT */}
              {investigatorSubView === "report" && (
                <div className="space-y-4">
                  {activeAudit ? (
                    <>
                      {activeAudit.verificationDetails && (
                        <div className="p-4 rounded-xl bg-[#161B22] border border-pink-500/20 font-sans relative overflow-hidden shadow-sm mb-5">
                          {/* Ambient Background Glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

                          <div className="flex items-center justify-between border-b border-[#30363D] pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                              <span className="font-bold text-xs text-pink-400 tracking-wider uppercase font-mono">
                                Dual-Agent Consensus Verification Engine V2.0
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-md border ${
                                activeAudit.verificationDetails.consensus === "APPROVED & CERTIFIED"
                                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/40"
                                  : "bg-amber-950/30 text-amber-400 border-amber-900/40"
                              }`}
                            >
                              {activeAudit.verificationDetails.consensus}
                            </span>
                          </div>

                          {/* Main Metrics Comparison Bar */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] flex flex-col justify-between">
                              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider font-mono">
                                Baseline Compliance Score
                              </span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-xl font-bold text-blue-400 font-mono">
                                  {activeAudit.primaryScore ?? activeAudit.complianceScore}
                                </span>
                                <span className="text-xs text-gray-500">/100</span>
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1">Primary forensic agent rating</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0D1117] border border-pink-500/20 flex flex-col justify-between relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-pink-500/10 px-2 py-0.5 text-[8px] font-mono font-bold text-pink-400 rounded-bl-lg">
                                REFEREE CERTIFIED
                              </div>
                              <span className="text-[9px] text-pink-400 uppercase font-bold tracking-wider font-mono">
                                Consensus Referee Rating
                              </span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-xl font-extrabold text-pink-400 font-mono">
                                  {activeAudit.verificationDetails.verifiedScore}
                                </span>
                                <span className="text-xs text-gray-500">/100</span>
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1">Consensus-calibrated consensus rating</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] flex flex-col justify-between">
                              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider font-mono">
                                Calibrated Score Variance
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-xl font-bold font-mono ${
                                    activeAudit.verificationDetails.variance > 0
                                      ? "text-emerald-400"
                                      : activeAudit.verificationDetails.variance < 0
                                      ? "text-red-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {activeAudit.verificationDetails.variance > 0 ? "+" : ""}
                                  {activeAudit.verificationDetails.variance} pts
                                </span>
                                <span className="text-xs text-gray-500">calibration</span>
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1 font-mono">Referee audit calibration deviation</span>
                            </div>
                          </div>

                          {/* Multi-dimensional Checked Rubrics */}
                          {(activeAudit.verificationDetails.documentationScore !== undefined ||
                            activeAudit.verificationDetails.timelineScore !== undefined ||
                            activeAudit.verificationDetails.clinicalScore !== undefined) && (
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-3.5 mb-4 space-y-3">
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block font-mono">
                                Consensus Certified Criteria Rubrics
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                                    <span>Documentation Quantity</span>
                                    <span className="font-mono text-gray-200">
                                      {activeAudit.verificationDetails.documentationScore ??
                                        Math.min(100, (activeAudit.primaryScore ?? 80) + 5)}
                                      /100
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-blue-500 h-full"
                                      style={{
                                        width: `${
                                          activeAudit.verificationDetails.documentationScore ??
                                          Math.min(100, (activeAudit.primaryScore ?? 80) + 5)
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                                    <span>Timeline Chronology</span>
                                    <span className="font-mono text-gray-200">
                                      {activeAudit.verificationDetails.timelineScore ??
                                        Math.min(100, (activeAudit.primaryScore ?? 80) + 3)}
                                      /100
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-emerald-500 h-full"
                                      style={{
                                        width: `${
                                          activeAudit.verificationDetails.timelineScore ??
                                          Math.min(100, (activeAudit.primaryScore ?? 80) + 3)
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                                    <span>Clinical Protocol Standard</span>
                                    <span className="font-mono text-gray-200">
                                      {activeAudit.verificationDetails.clinicalScore ?? (activeAudit.primaryScore ?? 80)}
                                      /100
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-pink-500 h-full"
                                      style={{
                                        width: `${
                                          activeAudit.verificationDetails.clinicalScore ?? (activeAudit.primaryScore ?? 80)
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* High-Fidelity Diagnostic Verification Checklist */}
                          {activeAudit.verificationDetails.checks && activeAudit.verificationDetails.checks.length > 0 && (
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-3.5 mb-4 space-y-2.5">
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block font-mono">
                                Forensic Referee Verification Checklist
                              </span>
                              <div className="space-y-2">
                                {activeAudit.verificationDetails.checks.map((chk, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-xs border-b border-[#161B22] pb-2 last:border-0 last:pb-0"
                                  >
                                    {chk.status === "pass" && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                    )}
                                    {chk.status === "warn" && (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                    )}
                                    {chk.status === "fail" && (
                                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                    )}
                                    <div>
                                      <div className="font-semibold text-gray-200 font-sans">{chk.criterion}</div>
                                      <div className="text-[10.5px] text-gray-400 mt-0.5 leading-relaxed font-sans">{chk.details}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chief Verifier Consensus Note */}
                          <div className="text-xs leading-relaxed bg-[#0D1117] p-3.5 rounded-xl border border-[#30363D] font-mono">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Award className="w-3.5 h-3.5 text-pink-400" />
                              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                                Chief Referee Verification Findings:
                              </span>
                            </div>
                            <p className="italic text-gray-200 text-[11px] leading-relaxed">
                              "{activeAudit.verificationDetails.notes}"
                            </p>
                          </div>
                        </div>
                      )}

                      <MarkdownViewer content={activeAudit.reportMarkdown} />

                      {/* CLINICIAN RECHECK ASSISTANT */}
                      <div className="border-t border-[#21262D] pt-5 mt-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Clinician Feedback & Supervisor Re-evaluation
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-gray-400 leading-relaxed font-mono">
                          Disputing any points or clinical timeline errors? Trigger an automated Supervisor re-evaluation to
                          verify baseline deductions with alternative medical board rules.
                        </p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={triggerSupervisorRecheck}
                            disabled={isRecheckingAsSupervisor}
                            className="px-4 py-2 text-xs font-bold font-mono text-white bg-pink-600 hover:bg-pink-500 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow hover:scale-102"
                          >
                            {isRecheckingAsSupervisor ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Supervisor Re-evaluating...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Supervisor Appeal Recheck</span>
                              </>
                            )}
                          </button>
                        </div>
                        {supervisorError && (
                          <div className="p-3 bg-red-950/20 border border-red-500/20 text-[10px] text-red-400 rounded-xl leading-relaxed font-mono">
                            {supervisorError}
                          </div>
                        )}

                        {activeAudit.supervisorRecheck && (
                          <div className="mt-6 border border-pink-500/20 bg-[#0F0E13] rounded-2xl p-6 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#21262D] pb-4">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                                <h3 className="font-sans font-black text-sm uppercase tracking-wider text-white">
                                  Supervisor Verdict & Trust Assessment
                                </h3>
                              </div>
                              <span className="self-start sm:self-auto text-[9px] font-mono font-black uppercase tracking-widest bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2.5 py-1 rounded-full">
                                Verified Audit Resolution
                              </span>
                            </div>

                            {/* SECTION 1: SCORE */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                <span>1. Compliance Score & Verdict</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                  <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider mb-1">
                                    Final Compliance Score
                                  </span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-pink-400 font-mono">
                                      {activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.final_score ?? activeAudit.complianceScore}
                                    </span>
                                    <span className="text-sm text-gray-500 font-mono">/100</span>
                                  </div>
                                  <span className="text-[10px] text-gray-500 font-mono mt-1">
                                    Original Score: {activeAudit.complianceScore}/100
                                  </span>
                                </div>

                                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                  <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider mb-2">
                                    Security & Risk Verdict
                                  </span>
                                  <span className={`text-[10px] uppercase font-mono font-black tracking-wider inline-block px-3 py-1 rounded-md ${
                                    (activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.verdict ?? "FLAGGED") === "PASS"
                                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                      : (activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.verdict ?? "FLAGGED") === "FLAGGED"
                                      ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                                      : "bg-red-950/60 text-red-400 border-red-500/30"
                                  }`}>
                                    {activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.verdict ?? "FLAGGED"}
                                  </span>
                                  <span className="text-[9px] font-mono text-gray-500 mt-2">
                                    {activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.risk_level ?? "High"} Risk Level
                                  </span>
                                </div>

                                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                  <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider mb-1">
                                    Decision Reliability
                                  </span>
                                  <span className="text-xl font-black text-emerald-400 font-mono">
                                    {activeAudit.supervisorRecheck.forensicUpgrade?.uncertainty_engine?.reliability_level ?? "HIGH"}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono mt-1">
                                    Uncertainty Index: {activeAudit.supervisorRecheck.forensicUpgrade?.uncertainty_engine?.overall_uncertainty ?? 15}%
                                  </span>
                                </div>
                              </div>

                              {activeAudit.supervisorRecheck.forensicUpgrade?.patient_summary && (
                                <div className="bg-[#161B22]/30 border border-[#30363D]/60 rounded-xl p-4">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-2.5">
                                    De-Identified Patient Profile Context
                                  </span>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                                    <div>
                                      <span className="text-gray-400 block text-[10px] font-sans mb-0.5">Patient Initials:</span>
                                      <span className="font-bold text-gray-200 font-mono">{activeAudit.supervisorRecheck.forensicUpgrade.patient_summary.name}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block text-[10px] font-sans mb-0.5">Patient Age:</span>
                                      <span className="font-bold text-gray-200 font-mono">{activeAudit.supervisorRecheck.forensicUpgrade.patient_summary.age} Years</span>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                      <span className="text-gray-400 block text-[10px] font-sans mb-0.5">Primary Diagnosis:</span>
                                      <span className="font-bold text-pink-400 font-sans">{activeAudit.supervisorRecheck.forensicUpgrade.patient_summary.diagnosis}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 2: REASON */}
                            <div className="space-y-4 border-t border-[#21262D] pt-6">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                <span>2. Ruling Reasoning & Advisory</span>
                              </div>

                              {activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.reasoning && (
                                <div className="bg-[#161B22]/40 border border-[#30363D] rounded-xl p-4.5 space-y-2">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                                    Supervisor's Narrative Reasoning
                                  </span>
                                  <p className="text-xs text-gray-300 leading-relaxed font-sans select-text">
                                    {activeAudit.supervisorRecheck.forensicUpgrade.supervisor_decision.reasoning}
                                  </p>
                                </div>
                              )}

                              {activeAudit.supervisorRecheck.reviewText && (
                                <div className="bg-[#1C1217] border border-pink-500/10 rounded-xl p-4.5 space-y-2.5">
                                  <span className="text-[9px] font-mono text-pink-300 uppercase tracking-widest block">
                                    Certified Public Patient Safety Advisory Text
                                  </span>
                                  <div className="text-xs text-pink-200/90 font-mono whitespace-pre-wrap leading-relaxed bg-black/30 p-3.5 rounded-lg border border-pink-500/5 select-text">
                                    {activeAudit.supervisorRecheck.reviewText}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 3: EVIDENCE */}
                            <div className="space-y-4 border-t border-[#21262D] pt-6">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                <span>3. Verified Clinical Evidence</span>
                              </div>

                              {activeAudit.supervisorRecheck.forensicUpgrade?.supervisor_decision?.top_evidence_based_findings && (
                                <div className="space-y-2.5">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                                    Validated Clinical & Financial Discrepancies
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {activeAudit.supervisorRecheck.forensicUpgrade.supervisor_decision.top_evidence_based_findings.map((finding, idx) => (
                                      <div key={idx} className="flex items-start gap-2.5 bg-[#161B22]/40 border border-[#30363D] rounded-xl p-3.5">
                                        <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                                        <span className="text-xs text-gray-300 font-sans leading-relaxed">{finding}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {activeAudit.supervisorRecheck.forensicUpgrade?.rag_guidelines && activeAudit.supervisorRecheck.forensicUpgrade.rag_guidelines.length > 0 && (
                                <div className="space-y-3 pt-2">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                                    Grounding Guideline Matches (WHO, CMS, ACC/AHA)
                                  </span>
                                  <div className="space-y-2.5">
                                    {activeAudit.supervisorRecheck.forensicUpgrade.rag_guidelines.map((gl, idx) => (
                                      <div key={idx} className="bg-[#161B22]/20 border border-[#30363D]/40 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                                        <div className="space-y-1.5 max-w-3xl">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400 px-1.5 py-0.5 bg-pink-500/10 rounded">
                                              {gl.source}
                                            </span>
                                            <span className="text-[11px] font-sans font-bold text-gray-200">{gl.rule}</span>
                                          </div>
                                          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                                            {gl.relevance}
                                          </p>
                                        </div>
                                        <span className={`text-[8.5px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded-full border self-start md:self-auto ${
                                          gl.match_status === "MATCHED"
                                            ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20"
                                            : "bg-[#21262D]/60 text-gray-400 border-gray-700/40"
                                        }`}>
                                          {gl.match_status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 4: RISK */}
                            <div className="space-y-4 border-t border-[#21262D] pt-6">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                <span>4. Adversarial Trust & Verification Check</span>
                              </div>

                              {activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.attacked_findings && (
                                <div className="space-y-3">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                                    Adversarial Critique & Verification of Finding Validity
                                  </span>
                                  <div className="space-y-2.5">
                                    {activeAudit.supervisorRecheck.forensicUpgrade.red_team_analysis.attacked_findings.map((attack, idx) => {
                                      let statusColor = "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
                                      if (attack.attack_result === "OVERSTATED") {
                                        statusColor = "text-amber-400 bg-amber-950/40 border-amber-500/20";
                                      } else if (attack.attack_result === "INVALID") {
                                        statusColor = "text-red-400 bg-red-950/40 border-red-500/20";
                                      } else if (attack.attack_result === "UNCERTAIN") {
                                        statusColor = "text-gray-400 bg-gray-900/40 border-gray-800/40";
                                      }

                                      return (
                                        <div key={idx} className="bg-[#161B22]/40 border border-[#30363D] rounded-xl p-4 space-y-2.5">
                                          <div className="flex items-center justify-between gap-2 border-b border-[#21262D] pb-2">
                                            <span className="text-xs font-bold text-gray-200">{attack.original_finding}</span>
                                            <span className={`text-[8.5px] font-mono uppercase font-black px-2 py-0.5 rounded border tracking-wider ${statusColor}`}>
                                              {attack.attack_result}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                                            <span className="text-pink-400 font-mono text-[9px] uppercase font-bold block mb-0.5">Verification Evaluation:</span>
                                            {attack.reason}
                                          </p>
                                          {attack.missing_context && attack.missing_context !== "None" && (
                                            <p className="text-[10.5px] text-gray-400 italic font-sans pt-2 border-t border-[#21262D]/60">
                                              <span className="font-bold">Missing Clinical Context analyzed:</span> {attack.missing_context}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div className="bg-[#161B22]/30 border border-[#30363D] rounded-xl p-4.5 space-y-4">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                                  Adversarial Safety Meter Parameters
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                                  <div className="p-3 bg-[#0D1117] rounded-lg border border-[#21262D]">
                                    <span className="text-gray-500 text-[9px] block font-mono uppercase">Hallucination Risk</span>
                                    <div className="flex items-center justify-between gap-2 mt-1.5">
                                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-red-500 h-full rounded-full"
                                          style={{ width: `${activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.hallucination_risk ?? 5}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-bold text-red-400 font-mono shrink-0">
                                        {activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.hallucination_risk ?? 5}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-[#0D1117] rounded-lg border border-[#21262D]">
                                    <span className="text-gray-500 text-[9px] block font-mono uppercase">Overflagging Risk</span>
                                    <div className="flex items-center justify-between gap-2 mt-1.5">
                                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-amber-500 h-full rounded-full"
                                          style={{ width: `${activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.overflagging_risk ?? 15}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-bold text-amber-400 font-mono shrink-0">
                                        {activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.overflagging_risk ?? 15}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-[#0D1117] rounded-lg border border-[#21262D]">
                                    <span className="text-gray-500 text-[9px] block font-mono uppercase">False Negative Risk</span>
                                    <div className="flex items-center justify-between gap-2 mt-1.5">
                                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-sky-500 h-full rounded-full"
                                          style={{ width: `${activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.false_negative_risk ?? 5}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-bold text-sky-400 font-mono shrink-0">
                                        {activeAudit.supervisorRecheck.forensicUpgrade?.red_team_analysis?.risk_assessment?.false_negative_risk ?? 5}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {activeAudit.supervisorRecheck.forensicUpgrade?.uncertainty_engine?.score_adjustments && (
                                  <div className="pt-3 border-t border-[#21262D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs leading-relaxed font-sans">
                                    <div className="text-gray-400">
                                      Adversarial Penalty applied:{" "}
                                      <span className="text-red-400 font-bold font-mono">
                                        -{activeAudit.supervisorRecheck.forensicUpgrade.uncertainty_engine.score_adjustments.penalty} Pts
                                      </span>
                                    </div>
                                    <div className="text-gray-400">
                                      Adversarial Score restoration boost:{" "}
                                      <span className="text-emerald-400 font-bold font-mono">
                                        +{activeAudit.supervisorRecheck.forensicUpgrade.uncertainty_engine.score_adjustments.boost} Pts
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {activeAudit.supervisorRecheck.forensicUpgrade?.complaint_recommendation && (
                                <div className="bg-pink-950/10 border border-pink-500/10 rounded-xl p-4.5 space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] uppercase font-bold text-pink-300 tracking-wider">
                                      Forensic Complaint Recommendation
                                    </span>
                                    <span className={`text-[8.5px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                                      activeAudit.supervisorRecheck.forensicUpgrade.complaint_recommendation.should_file_complaint
                                        ? "bg-red-950/40 text-red-400 border-red-500/20"
                                        : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                                    }`}>
                                      {activeAudit.supervisorRecheck.forensicUpgrade.complaint_recommendation.should_file_complaint
                                        ? "FILE COMPLAINT RECOMMENDED"
                                        : "NO COMPLAINT REQUIRED"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                                    <span className="font-bold text-gray-400">Action Plan:</span> {activeAudit.supervisorRecheck.forensicUpgrade.complaint_recommendation.reason}
                                  </p>
                                  <div className="text-[9px] text-gray-500 font-mono">
                                    Approval Process: <span className="text-pink-400 font-bold uppercase">{activeAudit.supervisorRecheck.forensicUpgrade.complaint_recommendation.approval_required}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center text-gray-500 font-mono text-[11px] leading-relaxed">
                      <Layers className="w-7 h-7 text-[#30363D] mb-2" />
                      <span>No active compliance report found. Ingest file and execute audit diagnostics.</span>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION B: PATIENT SUMMARY TRANSLATOR (8TH GRADE LEVEL COMPANION) */}
              {investigatorSubView === "patient" && (
                <div className="space-y-5 select-text">
                  {activeAudit && activeAudit.patientSummary ? (
                    <div className="space-y-5 font-mono text-xs">
                      {/* Grading Header Card info */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/20 border border-[#2ea043]/30">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#3FB950]" />
                          <span className="font-semibold text-[#3FB950] tracking-wide text-xs font-sans">
                            Patient Companion Reading Hub
                          </span>
                        </div>
                        <span className="font-bold text-[9.5px] uppercase bg-emerald-900/40 text-[#3FB950] border border-[#2ea043]/40 px-2 py-0.5 rounded">
                          {activeAudit.patientSummary.gradeLevel}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            Simplified Narrative Summary
                          </span>
                          <p className="text-[#C9D1D9] text-xs leading-relaxed leading-5 bg-[#161B22]/60 p-3.5 rounded-lg border border-[#30363D] font-sans">
                            {activeAudit.patientSummary.summaryText}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                              Preserved Core Diagnoses
                            </span>
                            <div className="space-y-1.5 p-3 rounded-lg bg-[#161B22]/30 border border-[#30363D]">
                              {(activeAudit.patientSummary.diagnoses || []).map((diag, i) => (
                                <p key={i} className="flex gap-1.5 text-[#C9D1D9] text-[11px] font-sans">
                                  <span className="text-[#3FB950] font-bold">•</span>
                                  <span>{diag}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                              Preserved Core Medications
                            </span>
                            <div className="space-y-1.5 p-3 rounded-lg bg-[#161B22]/30 border border-[#30363D]">
                              {(activeAudit.patientSummary.medications || []).map((med, i) => (
                                <p key={i} className="flex gap-1.5 text-[#C9D1D9] text-[11px] font-sans">
                                  <span className="text-blue-400 font-bold">•</span>
                                  <span>{med}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            Follow-Up Protocols & Care Instructions
                          </span>
                          <div className="p-3 bg-[#161B22]/30 border border-[#30363D] rounded-lg space-y-2">
                            {(activeAudit.patientSummary.followUpInstructions || []).map((inst, i) => (
                              <div key={i} className="flex gap-1.5 text-[11px] text-gray-300 font-sans">
                                <span className="text-amber-400 font-bold font-mono">{i + 1}.</span>
                                <span>{inst}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* JARGON TRANSLATION GLOSSARY */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                            Medical Terminology Decoded in Context
                          </span>
                          <div className="grid grid-cols-1 gap-2.5">
                            {(activeAudit.patientSummary.explainedTerms || []).map((term, i) => (
                              <div
                                key={i}
                                className="p-3 bg-[#1C2128]/45 border border-[#30363D] rounded-lg space-y-1 hover:border-gray-700 transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-amber-400 font-sans">{term.term}</span>
                                  <span className="text-[9px] text-[#8B949E] uppercase font-mono bg-amber-950/20 border border-amber-800/20 px-1 py-0.2 rounded font-bold">
                                    Decoded
                                  </span>
                                </div>
                                <p className="text-gray-300 text-[11px] leading-snug font-sans">
                                  <span className="text-gray-500 italic block mb-0.5 font-mono text-[9px] uppercase tracking-wider">
                                    Translation:
                                  </span>
                                  {term.definition}
                                </p>
                                <p className="text-xs text-[#8B949E] leading-snug font-sans">
                                  <span className="text-[#58A6FF]/70 font-mono text-[9.5px]">Context in Record:</span> &ldquo;
                                  {term.context}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center text-gray-500 font-mono text-[11px] leading-relaxed">
                      <BookOpen className="w-7 h-7 text-[#30363D] mb-2" />
                      <span>
                        {activeAudit
                          ? "No patient companion reading summary available for this case. Try re-running the audit."
                          : "Awaiting audit file initialization to construct human-digestible summaries."}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION C: EVIDENCE LOCKER */}
              {investigatorSubView === "locker" && (
                <div className="space-y-4">
                  {activeAudit ? (
                    <div className="font-mono text-xs space-y-4.5 select-text">
                      <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-lg flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-[#D19A23] mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-[#D19A23] uppercase text-[10px] tracking-wider mb-0.5">
                            Evidence Defense System Active
                          </h4>
                          <p className="text-gray-300 text-[11px] leading-relaxed font-sans">
                            This locker stores exact certified transcript excerpts and specific chronological violations to
                            construct standard, legally defensible audit claims against hospitals/clinics.
                          </p>
                        </div>
                      </div>

                      {/* Scoring breakdown parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-[#161B22]/50 border border-[#30363D] rounded-lg space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block border-b border-[#30363D] pb-1">
                            Technical Timeline Metrics
                          </span>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Documentation Completeness:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.technicalMetrics?.docCompleteness ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sequence Consistency:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.technicalMetrics?.recConsistency ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Billing Accuracy Rating:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.technicalMetrics?.billingAccuracy ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Upcoding Clearance Integrity:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.technicalMetrics?.upcodingScore ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Code/CPT Regulator Conformance:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.technicalMetrics?.procedureCompliance ?? 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-[#161B22]/50 border border-[#30363D] rounded-lg space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block border-b border-[#30363D] pb-1">
                            Clinical Judgment Metrics
                          </span>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Negligence Index Cleared:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.healthcareMetrics?.clinicalNegligenceScore ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Diagnostic Alignment:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.healthcareMetrics?.diagnosticConsistency ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Treatment Appropriateness:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.healthcareMetrics?.treatmentAppropriateness ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Patient Safety Score:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.healthcareMetrics?.patientSafetyScore ?? 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Medication Safety Protocols:</span>
                              <span className="font-bold text-[#58A6FF]">
                                {activeAudit.healthcareMetrics?.medicationMgmt ?? 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Evidence segment */}
                      <div className="p-3 bg-[#1C2128] border border-red-800/10 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block font-mono">
                          Sec. 419.0.B Verified Infraction Lockbox
                        </span>
                        <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-md text-[11px] font-mono text-gray-300 italic">
                          &ldquo;
                          {activeAudit.complaint?.evidenceLockerExcerpt ||
                            "Record clinically compliant. Minor filing delays observed - no triggerable safety negligence locked."}
                          &rdquo;
                        </div>
                      </div>

                      {/* Dynamic clinical deviations & treatment measures description */}
                      <div className="p-3.5 bg-amber-950/15 border border-amber-800/20 rounded-lg space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block font-mono">
                          Clinical Deviations & Treatment Compliance Review
                        </span>
                        {getForensicLockerExplanation(activeAudit)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center text-gray-500 font-mono text-[11px] leading-relaxed">
                      <Layers className="w-7 h-7 text-[#30363D] mb-2" />
                      <span>Run forensic rating to unlock secure sequence locker database.</span>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION D: EXPLAINABLE AI */}
              {investigatorSubView === "ai" && (
                <div className="space-y-4">
                  {activeAudit ? (
                    <div className="font-mono text-xs space-y-4 select-text">
                      <div className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                          <span className="font-bold text-xs text-blue-400 tracking-wide uppercase font-sans">
                            Deduction Explanative Factor Analysis
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 font-bold border border-blue-800/50">
                          Confidence Level: {activeAudit.explainableAI?.confidenceLevel ?? 0}%
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-1">
                            Why Did the Audit Score Drop?
                          </span>
                          <p className="text-gray-300 leading-relaxed bg-[#161B22]/70 p-3.5 rounded-lg border border-[#30363D]">
                            {activeAudit.explainableAI?.whyScoreDropped || "No rating deductions compiled."}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-1.5">
                            Audit Findings & Evidence Confidence
                          </span>
                          <div className="space-y-3">
                            {activeAudit.explainableAI?.evidenceFindings &&
                            activeAudit.explainableAI.evidenceFindings.length > 0 ? (
                              activeAudit.explainableAI.evidenceFindings.map((findingItem, idx) => {
                                const isConfirmed = findingItem.confidence === "Confirmed";
                                const isLikely = findingItem.confidence === "Likely";

                                let badgeColor = "bg-red-950/40 text-red-400 border-red-900/50";
                                let dotColor = "bg-red-400";
                                let iconEmoji = "🔴";
                                if (isConfirmed) {
                                  badgeColor = "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
                                  dotColor = "bg-emerald-400";
                                  iconEmoji = "🟢";
                                } else if (isLikely) {
                                  badgeColor = "bg-amber-950/40 text-amber-400 border-amber-900/50";
                                  dotColor = "bg-amber-400";
                                  iconEmoji = "🟡";
                                }

                                const cleanFindingName = findingItem.finding.replace(/\**$/, "").trim();
                                const category = findingItem.category || "General Compliance";
                                const severity = findingItem.severity || "Medium";
                                const remediation = findingItem.remediation || "Adhere to standard billing and clinical guidelines.";

                                let severityColor = "bg-gray-900/40 text-gray-400 border-gray-800/50";
                                if (severity === "Critical") severityColor = "bg-rose-950/40 text-rose-400 border-rose-900/50";
                                else if (severity === "High") severityColor = "bg-orange-950/40 text-orange-400 border-orange-900/50";
                                else if (severity === "Medium") severityColor = "bg-amber-950/40 text-amber-400 border-amber-900/50";
                                else if (severity === "Low") severityColor = "bg-sky-950/40 text-sky-400 border-sky-900/50";

                                return (
                                  <div
                                    key={idx}
                                    className="p-3.5 rounded-lg bg-[#1C2128]/70 border border-[#30363D] space-y-2.5 transition-all hover:border-gray-700"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                                        <span className="font-semibold text-gray-200 text-xs">
                                          {cleanFindingName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 text-gray-300 font-mono border border-gray-700/50 font-bold">
                                          {category}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${severityColor}`}>
                                          {severity}
                                        </span>
                                        <span
                                          className={`text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${badgeColor}`}
                                        >
                                          <span>{iconEmoji}</span>
                                          <span>{findingItem.confidence}</span>
                                        </span>
                                      </div>
                                    </div>
                                    {findingItem.explanation && (
                                      <p className="text-[11px] text-gray-400 leading-relaxed bg-[#0D1117]/60 p-2.5 rounded font-sans">
                                        {findingItem.explanation}
                                      </p>
                                    )}
                                    {remediation && (
                                      <div className="p-2.5 rounded bg-emerald-950/15 border border-emerald-900/20 text-[10.5px] text-emerald-300/90 leading-relaxed font-sans">
                                        <span className="font-bold text-emerald-400 font-mono text-[9px] uppercase tracking-wider block mb-1">
                                          💡 Dynamic Corrective Action
                                        </span>
                                        {remediation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-4 bg-[#090D14] rounded-xl border border-[#21262D] text-[#8B949E] text-[10px] text-center italic">
                                Zero rating deduction items mapped for this record.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center text-gray-500 font-mono text-[11px] leading-relaxed">
                      <Layers className="w-7 h-7 text-[#30363D] mb-2" />
                      <span>Run forensic rating to unlock explainable AI deduction breakdowns.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
