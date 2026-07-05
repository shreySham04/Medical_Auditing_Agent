import React from "react";
import { HelpCircle, Shield, Key, Inbox, Building, Info } from "lucide-react";

interface AboutTabProps {
  onGoToAuditor: () => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ onGoToAuditor }) => {
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-[#090D14] space-y-6 select-text">
      {/* HERO BLOCK */}
      <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-6 shadow-md select-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <HelpCircle className="w-40 h-40 text-blue-400" />
        </div>
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold font-mono tracking-widest bg-blue-950/45 text-blue-400 border border-blue-500/20 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            system guide & operation manual
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            MedicalAuditor v2.1 Operating Guidelines
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Welcome to the clinical forensics control center. This documentation outlines the procedural logic, technical requirements, and core compliance checklists used to inspect electronic health records (EHR), track clinical discrepancies, submit disciplinary reports, analyze practitioner data safely, and consult our interactive AI copilot for general medical doubts and therapeutic recommendations.
          </p>
        </div>
      </div>

      {/* AGENTIC WORKFLOW PIPELINE BLUEPRINT */}
      <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-6 shadow-md select-none">
        <div className="mb-6 space-y-1">
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block font-mono">
            Clinical Forensics Architecture Blueprint
          </span>
          <h3 className="text-sm font-bold text-white tracking-tight font-sans">
            Multi-Agent Consensus & Safety Evaluation Flow
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
            Detailed workflow representing the sequential hand-off, individual reasoning loops, and final consensus certification.
          </p>
        </div>

        {/* Desktop Pipeline Visual Flow (horizontal with arrows) / Mobile stacked */}
        <div className="hidden xl:flex items-stretch justify-between gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {/* Node 1: Medical PDF */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
              1
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Medical PDF</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Source clinical record artifact ingested into system buffer.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 2: Document Agent */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
              2
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Document Agent</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              OCR, text extraction, structural sanitization & layout metadata parse.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 3: Clinical Agent */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-pink-950/40 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs font-mono">
              3
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Clinical Agent</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Cross-references symptoms, vitals & standard clinical care guidelines.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 4: Billing Agent */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-pink-950/40 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs font-mono">
              4
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Billing Agent</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Validates billing documentation, coding consistency, and detects upcoding indicators.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 5: Documentation Agent */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
              5
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Documentation Agent</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Validates attestation signatures, notes completeness & format.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 6: Timeline Agent */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
              6
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Timeline Agent</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Reconstructs chronological sequences of events and detects inconsistencies.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 7: Supervisor */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
              7
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Supervisor</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Performs red-team verification, penalizes hallucinations & scoring.
            </p>
          </div>

          <div className="flex items-center text-gray-600 font-bold select-none text-base px-1">→</div>

          {/* Node 8: Final Audit */}
          <div className="flex-1 min-w-[120px] bg-[#090D14] border border-[#21262D] rounded-xl p-3.5 space-y-2 text-center relative group hover:border-blue-500/30 transition-all duration-300">
            <div className="mx-auto w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
              8
            </div>
            <span className="text-[11px] font-bold text-white block font-mono">Final Audit</span>
            <p className="text-[9px] text-[#8B949E] leading-normal font-sans">
              Consensus certified reports and board complaint transfer queue.
            </p>
          </div>
        </div>

        {/* Mobile Pipeline Flow (Stacked) */}
        <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">1</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Medical PDF</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Source clinical record artifact ingested into system buffer.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">2</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Document Agent</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">OCR, text extraction, structural sanitization & layout metadata parse.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-pink-950/40 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs font-mono">3</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Clinical Agent</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Cross-references symptoms, vitals & standard clinical care guidelines.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-pink-950/40 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs font-mono">4</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Billing Agent</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Validates billing documentation, coding consistency, and detects upcoding indicators.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">5</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Documentation Agent</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Validates attestation signatures, notes completeness & format.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">6</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Timeline Agent</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Reconstructs chronological sequences of events and detects inconsistencies.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">7</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Supervisor</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Performs red-team verification, penalizes hallucinations & scoring.</p>
            </div>
          </div>
          <div className="bg-[#090D14] border border-[#21262D] rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">8</div>
            <div>
              <span className="text-xs font-bold text-white font-mono">Final Audit</span>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Consensus certified reports and board complaint transfer queue.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: FORENSIC INVESTIGATOR PROCEDURES */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-blue-500/10 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#21262D] pb-3.5">
            <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                1. Forensic Investigator
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                How to upload, configure, and execute medical record audits
              </p>
            </div>
          </div>

          <div className="space-y-4 text-[11px] font-mono text-gray-300">
            <div className="space-y-1">
              <span className="text-blue-400 font-bold block">Step A: Customize Target Parameters</span>
              <p className="text-[#8B949E] leading-relaxed">
                Before uploading a patient file, use the <strong className="text-gray-200">Physician Details</strong> settings board to set the expected parameters: name, specialty, affiliated hospital, and department (e.g. Cardiology). The system matches the ingested file findings against these targets dynamically.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-blue-400 font-bold block">Step B: File Ingestion & Drag-and-Drop</span>
              <p className="text-[#8B949E] leading-relaxed">
                Drag-and-drop a patient document or click <strong className="text-gray-200">Browse Files...</strong> to load a clinical record (.pdf, .png, .jpg). The system loads the record in cache local buffer and lights up the tracking engine.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-blue-400 font-bold block">Step C: Run Forensic Audit Calculations</span>
              <p className="text-[#8B949E] leading-relaxed">
                Click the green <strong className="text-gray-200">Run Forensic Audit</strong> button to trigger the calculations. The system runs multi-tiered evaluation checks to review accuracy, determine upcoding compliance, and compile real-time diagnostic reports.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-blue-400 font-bold block">Step D: Toggle Sub-view Perspectives</span>
              <p className="text-[#8B949E] leading-relaxed">
                Switch between the <strong className="text-gray-200">Technical Report</strong>, <strong className="text-gray-200">Patient Summary</strong>, <strong className="text-gray-200">Evidence Locker</strong>, and <strong className="text-gray-200">Explainable AI</strong> tabs to deep-dive into the compiled audit data comprehensively.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: EVIDENCE LOCKER MANUAL */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-amber-500/10 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#21262D] pb-3.5">
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/20 text-[#D29922]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                2. Evidence Locker & Auditing
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Deciphering verified infractions and clinical correction protocols
              </p>
            </div>
          </div>

          <div className="space-y-4 text-[11px] font-mono text-gray-300">
            <div className="space-y-1">
              <span className="text-amber-400 font-bold block">Operational Overview</span>
              <p className="text-[#8B949E] leading-relaxed">
                The <strong className="text-gray-200">Evidence Locker</strong> acts as a legally-defensible directory of concrete timeline discrepancies. Unlike standard summaries, it isolates exactly where billing claims and treatment charts fail to align with hospital protocols.
              </p>
            </div>

            <div className="p-3.5 bg-amber-950/10 border border-amber-500/15 rounded-xl text-gray-300 leading-relaxed text-[11px] space-y-2">
              <span className="text-amber-400 font-bold block">💡 System Guide: Dynamic Evidence Ingestion vs. Fallbacks</span>
              <p className="text-gray-400 text-xs">
                The <strong className="text-amber-400 font-bold font-mono text-[9px] uppercase tracking-wider">Evidence Locker</strong> is fully dynamic. When you execute a forensic audit, Google Gemini processes the clinical markdown to extract custom evidence findings, points of deviation, and trust ratings.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                If an audit was generated with legacy static schemas, or when dynamic parsing yields completely empty findings, the system displays standardized high-acuity department guidelines (e.g., the <strong className="text-amber-400">140-minute Cardiology telemetry tracking activation delay</strong> example) as a baseline regulatory reference.
              </p>
            </div>

            <div className="p-3.5 bg-[#090D14] border border-[#21262D] rounded-xl text-gray-300 leading-relaxed text-[11px] space-y-2">
              <span className="text-gray-200 font-bold block">🔍 Evidence Confidence Levels:</span>
              <div className="space-y-1.5 text-xs font-mono">
                <p className="text-[#8B949E] text-[10px]">
                  Each dynamic clinical deviation or compliance issue is assessed and assigned a specific trust validation rating:
                </p>
                <ul className="list-none space-y-2.5 text-[10px] text-[#8B949E] pl-1">
                  <li className="flex gap-2.5">
                    <span className="text-emerald-400 font-bold min-w-[85px] uppercase tracking-wider">[Confirmed]</span>
                    <span>Direct, uncontradictable objective proof has been identified in the clinical electronic record, digital signatures, or administrative timestamp logs.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-amber-400 font-bold min-w-[85px] uppercase tracking-wider">[Likely]</span>
                    <span>Highly consistent circumstantial data, timeline overlaps, or clinical sequence indications suggest standard of care deviation.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-rose-400 font-bold min-w-[85px] uppercase tracking-wider">[Unsupported]</span>
                    <span>Claims, diagnoses, or charges are found in the billings without corresponding charting documentation in the medical record.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-amber-400 font-bold block">Dynamic Data vs. Regulatory Benchmarks:</span>
              <p className="text-[#8B949E] leading-relaxed">
                For any newly executed audit, the clinical facts (such as saturation drops, medication timestamps, or timeline overlaps) are automatically mapped under the <strong className="text-gray-200">Clinical Deviations & Treatment Compliance Review</strong> card to ensure zero redundancy and exact matching across distinct records.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: COMPLAINT REVIEW QUEUE PROCESS */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-red-500/10 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#21262D] pb-3.5">
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/20 text-[#FF7B72]">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                3. Complaint Review Queue
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Submitting files and routing non-compliant cases to state boards
              </p>
            </div>
          </div>

          <div className="space-y-4 text-[11px] font-mono text-gray-300">
            <div className="space-y-1">
              <span className="text-red-400 font-bold block">Step A: Identify Flagged Records</span>
              <p className="text-[#8B949E] leading-relaxed">
                When a forensic audit receives a low-compliance rating score (e.g. welfare risk index failure), the system flags the practitioner. Click <strong className="text-gray-200">Registry Transfer</strong> inside the audit results pane to enqueue the record for licensing board filing.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-red-400 font-bold block">Step B: Inspect the Queue</span>
              <p className="text-[#8B949E] leading-relaxed">
                Switch to the <strong className="text-gray-200">Complaint Review Queue</strong> tab. It lists all pending files currently requiring administrative attention. You can view the computed diagnostic alignment, risk indicators, and severity levels.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-red-400 font-bold block">Step C: Seal & Issue the Complaint</span>
              <p className="text-[#8B949E] leading-relaxed">
                Click the red <strong className="text-red-400">Lock Registry & Certify Complaint</strong> button. Confirm the action in the secure overlay modal. This stores the record in the immutable clinical registry permanently.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-red-400 font-bold block">Step D: Discard Outdated Claims</span>
              <p className="text-[#8B949E] leading-relaxed">
                If an administrative correction has cleared a flagged provider, you can remove records from the queue by choosing the <strong className="text-gray-200 text-red-400">Discard Case</strong> trigger safely.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 4: ANALYTICS & REGISTRY OPERATIONS */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-emerald-500/10 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#21262D] pb-3.5">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[#3FB950]">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                4. Analytics & Reliability Registry
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Performing credential checks and predicting clinical risks
              </p>
            </div>
          </div>

          <div className="space-y-4 text-[11px] font-mono text-gray-300">
            <div className="space-y-1">
              <span className="text-[#3FB950] font-bold block">A: Real-time Database Search Lookup</span>
              <p className="text-[#8B949E] leading-relaxed">
                Use the search panel to input practitioner names (e.g. <strong className="text-gray-200">"Jenkins"</strong>). The system query matches active provider credentials, registration state, rating profiles, and any registered violations.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#3FB950] font-bold block">B: Visualizing Department Error Frequencies</span>
              <p className="text-[#8B949E] leading-relaxed">
                Study the live <strong className="text-gray-200">Department Error Metric Trends</strong> bar graph on the right. This represents which division (Cardiology, Orthopedics, Radiology, etc.) exhibits the highest percentage frequency of clinical compliance gaps.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#3FB950] font-bold block">C: Overall Compliance Statistics</span>
              <p className="text-[#8B949E] leading-relaxed">
                See system stats at a glance: Total Cases, Severity Level 4 counts, low-risk cases, and average system rating scores fetched from clinical directories.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#3FB950] font-bold block">D: AI Risk Prediction Engine</span>
              <p className="text-[#8B949E] leading-relaxed">
                The predictive forecasting routine reviews past anomalies continuously. If severity warnings rise, it toggles the <strong className="text-red-400 font-bold">High Probability Anomalies</strong> forecasting level, recommending immediate focus audits.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 5: INTERACTIVE MEDICAL & CLINICAL COPILOT */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow lg:col-span-2 hover:border-pink-500/10 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#21262D] pb-3.5">
            <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/20 text-pink-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                5. Interactive Medical & Clinical Copilot
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Answering general medical doubts, therapeutic recommendations, and dosage educational guidelines
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-mono text-gray-300">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-pink-400 font-bold block">Case-Specific Inquiries</span>
                <p className="text-[#8B949E] leading-relaxed">
                  When reviewing a specific patient audit, ask the Copilot to clarify clinical discrepancies, explain score deductions, or highlight specific diagnostic upcoding patterns directly from the record context.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-pink-400 font-bold block">Medical Doubt Resolution & Common Diseases</span>
                <p className="text-[#8B949E] leading-relaxed">
                  The Copilot supports open-ended clinical Q&A. You can consult it on common conditions like the <strong className="text-gray-200">common cold, cough, seasonal flu, allergic rhinitis, or minor fevers</strong> to understand standard supportive therapy guidelines.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-pink-400 font-bold block">Standard Therapeutic Recommendations</span>
                <p className="text-[#8B949E] leading-relaxed">
                  Get details on standard, clinically accepted over-the-counter (OTC) medications and home remedies, such as <strong className="text-gray-200">antipyretics</strong> (Acetaminophen/Ibuprofen), <strong className="text-gray-200">antitussives/expectorants</strong> (Dextromethorphan), and antihistamines, as well as general hydration advice.
                </p>
              </div>

              <div className="p-3 bg-pink-950/10 border border-pink-500/15 rounded-xl text-gray-300 leading-relaxed text-[11px]">
                <span className="text-pink-400 font-bold block mb-1">⚠️ Clinical Disclaimer Note</span>
                <p className="text-gray-400 text-xs">
                  All guidelines, remedies, and drug details provided by the Copilot are strictly for educational and audit reference purposes. Attesting practitioners must verify specific dosages and patient sensitivities independently.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* POLICY AND INFO SUB-BANNER */}
      <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none shadow">
        <div className="flex items-center gap-2.5 text-[11px] font-mono text-gray-300">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            All forensic calculations, model lookups, and audit trails strictly conform to the clinical validation framework setup.
          </span>
        </div>
        <button 
          onClick={onGoToAuditor}
          className="px-4.5 py-2.2 rounded-xl bg-blue-600 hover:bg-blue-500 hover:scale-102 border border-blue-500/20 text-[10px] uppercase font-bold text-white font-mono tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/10"
        >
          Go to Auditor Tools
        </button>
      </div>
    </main>
  );
};
