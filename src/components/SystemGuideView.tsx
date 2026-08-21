import React from 'react';
import {
  BookOpen,
  Layers,
  Scale,
  Building2,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Search,
  Sparkles,
  Info,
  Lightbulb,
} from 'lucide-react';

export const SystemGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SECTION 2: EVIDENCE LOCKER & AUDITING */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              2. EVIDENCE LOCKER & AUDITING
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Deciphering verified infractions and clinical correction protocols
            </p>
          </div>
        </div>

        {/* Operational Overview */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Operational Overview
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            The <strong className="text-white">Evidence Locker</strong> acts as a legally-defensible directory of concrete timeline discrepancies. Unlike standard summaries, it isolates exactly where billing claims and treatment charts fail to align with hospital protocols.
          </p>
        </div>

        {/* System Guide Box */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>System Guide: Dynamic Evidence Ingestion vs. Fallbacks</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            The <strong className="text-amber-300">EVIDENCE LOCKER</strong> is fully dynamic. When you execute a forensic audit, Google Gemini processes the clinical markdown to extract custom evidence findings, points of deviation, and trust ratings.
          </p>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            If an audit was generated with legacy static schemas, or when dynamic parsing yields completely empty findings, the system displays standardized high-acuity department guidelines (e.g., the <strong className="text-amber-400">140-minute Cardiology telemetry tracking activation delay</strong> example) as a baseline regulatory reference.
          </p>
        </div>

        {/* Evidence Confidence Levels Box */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Evidence Confidence Levels:</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Each dynamic clinical deviation or compliance issue is assessed and assigned a specific trust validation rating:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-start gap-4">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold whitespace-nowrap">
                [CONFIRMED]
              </span>
              <span className="text-slate-300">
                Direct, uncontradictable objective proof has been identified in the clinical electronic record, digital signatures, or administrative timestamp logs.
              </span>
            </div>

            <div className="flex items-start gap-4">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold whitespace-nowrap">
                [LIKELY]
              </span>
              <span className="text-slate-300">
                Highly consistent circumstantial data, timeline overlaps, or clinical sequence indications suggest standard of care deviation.
              </span>
            </div>

            <div className="flex items-start gap-4">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold whitespace-nowrap">
                [UNSUPPORTED]
              </span>
              <span className="text-slate-300">
                Claims, diagnoses, or charges are found in the billings without corresponding charting documentation in the medical record.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Data vs. Regulatory Benchmarks */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Dynamic Data vs. Regulatory Benchmarks:
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            For any newly executed audit, the clinical facts (such as saturation drops, medication timestamps, or timeline overlaps) are automatically mapped under the <strong className="text-white">Clinical Deviations & Treatment Compliance Review</strong> card to ensure zero redundancy and exact matching across distinct records.
          </p>
        </div>
      </div>

      {/* SECTION 3 & 4: COMPLAINT REVIEW QUEUE & ANALYTICS REGISTRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 3: Complaint Review Queue */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
                3. COMPLAINT REVIEW QUEUE
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Submitting files and routing non-compliant cases to state boards
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <h4 className="text-rose-400 font-bold mb-0.5">Step A: Identify Flagged Records</h4>
              <p className="text-slate-300 leading-relaxed">
                When a forensic audit receives a low-compliance rating score (e.g. welfare risk index failure), the system flags the practitioner. Click <strong className="text-white">Registry Transfer</strong> inside the audit results pane to enqueue the record for licensing board filing.
              </p>
            </div>

            <div>
              <h4 className="text-rose-400 font-bold mb-0.5">Step B: Inspect the Queue</h4>
              <p className="text-slate-300 leading-relaxed">
                Switch to the <strong className="text-white">Complaint Review Queue</strong> tab. It lists all pending files currently requiring administrative attention. You can view the computed diagnostic alignment, risk indicators, and severity levels.
              </p>
            </div>

            <div>
              <h4 className="text-rose-400 font-bold mb-0.5">Step C: Seal & Issue the Complaint</h4>
              <p className="text-slate-300 leading-relaxed">
                Click the red <strong className="text-rose-300">Lock Registry & Certify Complaint</strong> button. Confirm the action in the secure overlay modal. This stores the record in the immutable clinical registry permanently.
              </p>
            </div>

            <div>
              <h4 className="text-rose-400 font-bold mb-0.5">Step D: Discard Outdated Claims</h4>
              <p className="text-slate-300 leading-relaxed">
                If an administrative correction has cleared a flagged provider, you can remove records from the queue by choosing the <strong className="text-rose-400">Discard Case</strong> trigger safely.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Analytics & Reliability Registry */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
                4. ANALYTICS & RELIABILITY REGISTRY
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Performing credential checks and predicting clinical risks
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <h4 className="text-emerald-400 font-bold mb-0.5">A: Real-time Database Search Lookup</h4>
              <p className="text-slate-300 leading-relaxed">
                Use the search panel to input practitioner names (e.g. <strong className="text-white">"Jenkins"</strong>). The system query matches active provider credentials, registration state, rating profiles, and any registered violations.
              </p>
            </div>

            <div>
              <h4 className="text-emerald-400 font-bold mb-0.5">B: Visualizing Department Error Frequencies</h4>
              <p className="text-slate-300 leading-relaxed">
                Study the live <strong className="text-white">Department Error Metric Trends</strong> bar graph on the right. This represents which division (Cardiology, Orthopedics, Radiology, etc.) exhibits the highest percentage frequency of clinical compliance gaps.
              </p>
            </div>

            <div>
              <h4 className="text-emerald-400 font-bold mb-0.5">C: Overall Compliance Statistics</h4>
              <p className="text-slate-300 leading-relaxed">
                See system stats at a glance: Total Cases, Severity Level 4 counts, low-risk cases, and average system rating scores fetched from clinical directories.
              </p>
            </div>

            <div>
              <h4 className="text-emerald-400 font-bold mb-0.5">D: AI Risk Prediction Engine</h4>
              <p className="text-slate-300 leading-relaxed">
                The predictive forecasting routine reviews past anomalies continuously. If severity warnings rise, it toggles the <strong className="text-rose-400">High Probability Anomalies</strong> forecasting level, recommending immediate focus audits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: INTERACTIVE MEDICAL & CLINICAL COPILOT */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              5. INTERACTIVE MEDICAL & CLINICAL COPILOT
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Answering general medical doubts, therapeutic recommendations, and dosage educational guidelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-4">
            <div>
              <h4 className="text-pink-400 font-bold mb-1">Case-Specific Inquiries</h4>
              <p className="text-slate-300 leading-relaxed">
                When reviewing a specific patient audit, ask the Copilot to clarify clinical discrepancies, explain score deductions, or highlight specific diagnostic upcoding patterns directly from the record context.
              </p>
            </div>

            <div>
              <h4 className="text-pink-400 font-bold mb-1">Medical Doubt Resolution & Common Diseases</h4>
              <p className="text-slate-300 leading-relaxed">
                The Copilot supports open-ended clinical Q&A. You can consult it on common conditions like the <strong className="text-white">common cold, cough, seasonal flu, allergic rhinitis, or minor fevers</strong> to understand standard supportive therapy guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-pink-400 font-bold mb-1">Standard Therapeutic Recommendations</h4>
              <p className="text-slate-300 leading-relaxed">
                Get details on standard, clinically accepted over-the-counter (OTC) medications and home remedies, such as <strong className="text-white">antipyretics</strong> (Acetaminophen/Ibuprofen), <strong className="text-white">antitussives/expectorants</strong> (Dextromethorphan), and antihistamines, as well as general hydration advice.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-pink-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Clinical Disclaimer Note</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All guidelines, remedies, and drug details provided by the Copilot are strictly for educational and audit reference purposes. Attesting practitioners must verify specific dosages and patient sensitivities independently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
