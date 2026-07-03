import React from "react";
import { AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Check } from "lucide-react";
import { AuditItem } from "../types";

interface ComplaintDialogProps {
  show: boolean;
  audit: AuditItem | null;
  googleReviewDraft: string;
  setGoogleReviewDraft: (draft: string) => void;
  isGeneratingGoogleReview: boolean;
  googleReviewError: string;
  googleReviewSource: string;
  showGoogleReviewPublishSandbox: boolean;
  setShowGoogleReviewPublishSandbox: (show: boolean) => void;
  generateGoogleReviewDraft: (id: string) => void;
  onAction: (action: "REGISTERED" | "DISMISSED" | "SAVED FOR REVIEW" | "PENDING USER APPROVAL") => void;
  setAppStatus: (status: string) => void;
  onClose: () => void;
}

export const ComplaintDialog: React.FC<ComplaintDialogProps> = ({
  show,
  audit,
  googleReviewDraft,
  setGoogleReviewDraft,
  isGeneratingGoogleReview,
  googleReviewError,
  googleReviewSource,
  showGoogleReviewPublishSandbox,
  setShowGoogleReviewPublishSandbox,
  generateGoogleReviewDraft,
  onAction,
  setAppStatus,
  onClose,
}) => {
  if (!show || !audit) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in select-text">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-full ${
              audit.complianceScore < 60
                ? "bg-red-950/40 text-[#F85149] border border-red-800/30"
                : "bg-emerald-950/40 text-[#3FB950] border border-[#2ea043]/30"
            }`}
          >
            {audit.complianceScore < 60 ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1.5 min-w-0 flex-1">
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-gray-500 block">
              Regulatory Complaint Recommendation Router
            </span>

            {audit.complianceScore < 60 ? (
              <h3 className="text-md font-semibold text-white leading-snug">
                High-risk compliance concerns detected. Would you like to register this complaint?
              </h3>
            ) : (
              <h3 className="text-md font-semibold text-white leading-snug">
                No critical concerns detected. Do you still wish to register a complaint?
              </h3>
            )}

            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs font-mono space-y-1 mt-3">
              <p>
                <span className="text-[#8B949E]">Record File:</span> {audit.fileName}
              </p>
              <p>
                <span className="text-[#8B949E]">Physician Monitored:</span> {audit.doctorName}
              </p>
              <p>
                <span className="text-[#8B949E]">Overall Compliance Score:</span>{" "}
                <span className={audit.complianceScore < 60 ? "text-[#F85149]" : "text-[#3FB950]"}>
                  {audit.complianceScore}/100
                </span>
              </p>
              <p>
                <span className="text-[#8B949E]">Severity Classification:</span>{" "}
                <span className="text-[#D29922]">{audit.riskClassification} Risk</span>
              </p>
            </div>
          </div>
        </div>

        {/* AGENTIC PATIENT SAFETY REGISTRY ADVISORY COMPILER TRIGGER */}
        {audit.complianceScore < 45 && (
          <div className="bg-[#0D1117] border border-amber-500/25 rounded-lg p-3.5 space-y-2.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Patient Safety Registry Draft Assistant</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-normal font-sans">
              Compliance score is under <strong>45%</strong> ({audit.complianceScore}%). Clinical care audit failed.
              Would you like the AI Agent to compile a de-identified public safety advisory draft detailing these findings?
            </p>

            {googleReviewError && (
              <div className="p-2 rounded bg-red-950/20 border border-red-900/20 text-red-400 text-[10px]">
                {googleReviewError}
              </div>
            )}

            {!googleReviewDraft ? (
              <button
                onClick={() => generateGoogleReviewDraft(audit.id)}
                disabled={isGeneratingGoogleReview}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold py-1.5 px-3 rounded text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                {isGeneratingGoogleReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Compiling safety evidence...
                  </>
                ) : (
                  "Draft Safety Registry Advisory"
                )}
              </button>
            ) : (
              <div className="space-y-2 animate-fade-in text-[10.5px]">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">
                    De-identified safety report draft:
                  </span>
                  <textarea
                    value={googleReviewDraft}
                    onChange={(e) => setGoogleReviewDraft(e.target.value)}
                    className="w-full text-xs font-sans rounded bg-[#161B22] border border-[#30363D] text-gray-200 p-2 min-h-[100px] focus:outline-none focus:border-amber-500 select-text leading-relaxed font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-[#8B949E] font-mono">
                  <span>Source: {googleReviewSource === "GEMINI_AI_AGENT" ? "Clinical LLM" : "Safety Rules"}</span>
                  <span className="text-emerald-400 font-bold">HIPAA Compliant</span>
                </div>

                {showGoogleReviewPublishSandbox && (
                  <p className="text-[9px] text-emerald-400 font-bold animate-fade-in">
                    ✅ Review successfully staged and published to sandboxed reviews list!
                  </p>
                )}

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(googleReviewDraft);
                      setAppStatus("Safety Registry draft copied to system clipboard!");
                      alert("Copied to clipboard!");
                    }}
                    className="bg-[#21262D] hover:bg-[#30363D] text-white px-2 py-1 rounded border border-[#30363D] text-[10px] font-bold cursor-pointer"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => {
                      setShowGoogleReviewPublishSandbox(true);
                      setAppStatus("Published compliance draft to reviews Sandbox.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                  >
                    🚀 Publish Sandbox
                  </button>
                  <button
                    onClick={() => {
                      setGoogleReviewDraft("");
                      setShowGoogleReviewPublishSandbox(false);
                    }}
                    className="bg-[#21262D] hover:bg-[#30363D] text-gray-400 px-2 py-1 rounded border border-[#30363D] text-[10px] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#30363D] pt-4">
          <span className="text-[9px] text-[#8B949E] font-mono leading-tight">
            System prevents automatic filing to boards. Manual selection required.
          </span>

          <div className="flex gap-2">
            {audit.complianceScore < 60 ? (
              <>
                <button
                  onClick={() => onAction("DISMISSED")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#21262D] text-gray-300 hover:bg-[#30363D] transition-colors cursor-pointer"
                >
                  Dismiss Case
                </button>
                <button
                  onClick={() => onAction("SAVED FOR REVIEW")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-amber-800/40 text-[#D29922] hover:bg-amber-950/20 transition-colors cursor-pointer"
                >
                  Save for Review
                </button>
                <button
                  onClick={() => onAction("REGISTERED")}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Register Complaint
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAction("DISMISSED")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#21262D] text-gray-300 hover:bg-[#30363D] transition-colors font-mono cursor-pointer"
                >
                  No (Dismiss)
                </button>
                <button
                  onClick={() => onAction("REGISTERED")}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors font-mono cursor-pointer"
                >
                  Yes, Register Anyway
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
