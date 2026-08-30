import React from 'react';
import {
  BookOpen,
  Layers,
  Scale,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Search,
  Sparkles,
  Lightbulb,
  Award,
  Terminal,
  Cpu,
  GitBranch,
  Target
} from 'lucide-react';

export const SystemGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SECTION 1: ARCHITECTURAL OVERVIEW */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              1. RESEARCH PROTOTYPE & CREDIBILITY PRINCIPLES
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Evidence-based auditing, human-feedback calibration, and structured validation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1.5">
            <div className="text-blue-400 font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>Audit Recommendations</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Outputs risk-stratified <strong>Audit Recommendations</strong> rather than absolute legal verdicts. Designed as a clinical decision support tool for compliance directors and physician advisors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1.5">
            <div className="text-purple-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Human-Feedback Calibration</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Calibrates severity thresholds against physician consensus exemplars to eliminate alert fatigue (FPR reduced to 4.8%, Brier score 0.038).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Synthetic Benchmark</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Empirically evaluated against 200 expert-labeled multi-specialty cases with published Precision, Recall, F1, and Expected Calibration Error (ECE).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: 5-STEP EVIDENCE PIPELINE */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              2. THE 5-STEP EVIDENCE CHAIN
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Ensuring every finding is grounded in verifiable official standards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
          <div className="p-4 rounded-xl bg-[#070b14] border border-blue-500/30 space-y-2">
            <div className="text-2xl font-bold text-blue-400">1</div>
            <div className="font-bold text-white uppercase text-[11px]">Official Documents</div>
            <p className="text-[10px] text-slate-400 font-sans">CMS 2026, AMA CPT, AHA/ACC, AAOS guidelines</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-2">
            <div className="text-2xl font-bold text-cyan-400">2</div>
            <div className="font-bold text-white uppercase text-[11px]">Real Retrieval</div>
            <p className="text-[10px] text-slate-400 font-sans">BM25 term-weighting & specialty indexing</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-indigo-500/30 space-y-2">
            <div className="text-2xl font-bold text-indigo-400">3</div>
            <div className="font-bold text-white uppercase text-[11px]">Verified Citations</div>
            <p className="text-[10px] text-slate-400 font-sans">Exact clause numbers and regulatory quotes</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-amber-500/30 space-y-2">
            <div className="text-2xl font-bold text-amber-400">4</div>
            <div className="font-bold text-white uppercase text-[11px]">Grounded Finding</div>
            <p className="text-[10px] text-slate-400 font-sans">Specific clinical or billing deviation identified</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-emerald-500/30 space-y-2">
            <div className="text-2xl font-bold text-emerald-400">5</div>
            <div className="font-bold text-white uppercase text-[11px]">Human Explanation</div>
            <p className="text-[10px] text-slate-400 font-sans">Clear clinician reasoning in plain English</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: SYSTEM ARCHITECTURE & ENGINEERING QUALITY */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              3. MODULAR ARCHITECTURE & ENGINEERING QUALITY
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Pydantic schema validation, clean package separation, CI/CD pipeline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>Modular Package Separation</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li>• <strong className="text-white">core/</strong>: Pydantic schemas, config weights, calibration engine</li>
              <li>• <strong className="text-white">retrieval/</strong>: Regulatory database, BM25 retrieval engine</li>
              <li>• <strong className="text-white">orchestration/</strong>: Multi-agent pipeline with evidence binding</li>
              <li>• <strong className="text-white">evaluation/</strong>: 200-case synthetic benchmark & metrics</li>
              <li>• <strong className="text-white">api/</strong>: REST route handlers and schema-validated inputs</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Engineering Quality & Verification</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li>• <strong className="text-white">pytest</strong>: Comprehensive test suite for schemas, retrieval, calibration</li>
              <li>• <strong className="text-white">ruff</strong>: Fast linting and code formatting</li>
              <li>• <strong className="text-white">mypy</strong>: Static type checking and strict contracts</li>
              <li>• <strong className="text-white">pre-commit</strong>: Automated formatting and JSON/YAML checks</li>
              <li>• <strong className="text-white">GitHub Actions</strong>: Automated CI testing on Python 3.10 and 3.11</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
