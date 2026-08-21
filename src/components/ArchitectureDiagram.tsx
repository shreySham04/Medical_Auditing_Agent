import React from 'react';
import { Cpu, Server, ShieldCheck, Database, Code2, Network, CheckCircle2 } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const agents = [
    { title: 'Document Agent', role: 'Data Ingestion & EHR Extraction', desc: 'Parses raw medical records, operative logs, discharge summaries, and insurance claims into structured schema.' },
    { title: 'Clinical Agent', role: 'Medical Practice Guidelines', desc: 'Cross-checks recorded diagnoses and treatments against evidence-based medical practice guidelines.' },
    { title: 'Billing Agent', role: 'CPT Upcoding & Fraud Detection', desc: 'Analyzes billed CPT/HCPCS codes against procedural complexity to identify upcoding anomalies.' },
    { title: 'Documentation Agent', role: 'Compliance & Completeness', desc: 'Audits missing physician signatures, required consents, and clinical justification gaps.' },
    { title: 'Timeline Agent', role: 'Chronological Integrity', desc: 'Validates timestamp sequences between ER arrival, operative notes, and medication administration.' },
    { title: 'Supervisor / Referee Agent', role: 'Conflict Resolution & Final Verdict', desc: 'Aggregates multi-agent findings, resolves inter-agent discrepancies, and computes calibrated compliance score.' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Autonomous Multi-Agent System & MCP Architecture
        </h2>
        <p className="text-xs text-slate-400">
          MedicalAuditor relies on a dual-validation pipeline powered by 6 specialized autonomous agents communicating with a Python FastAPI REST engine and Model Context Protocol (MCP) server.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={i} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2.5 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Agent 0{i + 1}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">{agent.title}</h3>
            <div className="text-xs font-semibold text-indigo-400">{agent.role}</div>
            <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
          </div>
        ))}
      </div>

      {/* Backend & MCP Integration Technical Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Python FastAPI REST Endpoints
          </h3>
          <ul className="text-xs space-y-2 text-slate-300 font-mono">
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">GET /health</span> — System status & engine diagnostics
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-blue-400 font-bold">GET /api/audits</span> — Retrieves active forensic case file records
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-bold">POST /api/reaudit</span> — Triggers multi-agent re-evaluation pipeline
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold">GET /api/training/samples</span> — Accesses 10,000 dataset benchmark
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-rose-400 font-bold">POST /api/copilot</span> — Interactive agent query pipeline
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            Model Context Protocol (MCP) Server Capabilities
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The app includes an integrated MCP server (`mcp_server.py`) exposing standardized tools for external LLM client integration:
          </p>
          <ul className="text-xs space-y-2 text-slate-300 font-mono">
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              🛠️ <strong className="text-cyan-400">query_audits()</strong> — Queries clinical cases by case_id or patient name
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              🛠️ <strong className="text-cyan-400">run_pipeline()</strong> — Invokes full multi-agent forensic evaluation
            </li>
            <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              🛠️ <strong className="text-cyan-400">check_cpt_benchmark()</strong> — Compares billed vs. recommended CPT codes
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
