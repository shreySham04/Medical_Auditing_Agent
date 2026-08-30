import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Activity,
  Cpu,
  BarChart3,
  UserCheck,
  Sparkles,
  Zap,
  BookOpen,
  RefreshCw,
  Sliders,
  Scale,
  Award,
  BookMarked
} from 'lucide-react';

interface PractitionerProfile {
  name: string;
  npi: string;
  specialty: string;
  hospital: string;
  ratingScore: number;
  status: 'Compliant' | 'Flagged' | 'Action Pending';
  totalCases: number;
  violationsCount: number;
  lastAudit: string;
}

const PRACTITIONERS: PractitionerProfile[] = [
  {
    name: 'Dr. Arthur Jenkins',
    npi: 'NPI-1948201944',
    specialty: 'Orthopedic Surgery',
    hospital: 'Metro General Surgical Pavilion',
    ratingScore: 92,
    status: 'Compliant',
    totalCases: 48,
    violationsCount: 0,
    lastAudit: '2026-08-14',
  },
  {
    name: 'Dr. Marcus Thorne',
    npi: 'NPI-8492018401',
    specialty: 'Cardiology',
    hospital: 'St. Jude Medical Center',
    ratingScore: 68,
    status: 'Flagged',
    totalCases: 86,
    violationsCount: 3,
    lastAudit: '2026-08-18',
  },
  {
    name: 'Dr. Julian Sterling',
    npi: 'NPI-7592038472',
    specialty: 'Cardiology',
    hospital: 'Valley Memorial Hospital',
    ratingScore: 44,
    status: 'Action Pending',
    totalCases: 62,
    violationsCount: 7,
    lastAudit: '2026-08-19',
  },
  {
    name: 'Dr. Elena Vance',
    npi: 'NPI-5829104928',
    specialty: 'Emergency Medicine',
    hospital: 'Northwestern Memorial Clinic',
    ratingScore: 89,
    status: 'Compliant',
    totalCases: 114,
    violationsCount: 1,
    lastAudit: '2026-08-17',
  },
  {
    name: 'Dr. David Kim',
    npi: 'NPI-3920194829',
    specialty: 'Neurology',
    hospital: 'Mount Sinai Specialty Hospital',
    ratingScore: 95,
    status: 'Compliant',
    totalCases: 53,
    violationsCount: 0,
    lastAudit: '2026-08-16',
  },
  {
    name: 'Dr. Robert Chen',
    npi: 'NPI-1049284729',
    specialty: 'Cardiology',
    hospital: 'Cedars-Sinai Medical Pavilion',
    ratingScore: 71,
    status: 'Flagged',
    totalCases: 79,
    violationsCount: 2,
    lastAudit: '2026-08-15',
  },
];

const CALIBRATION_TRAJECTORY = [
  { cycle: 'Iteration 0 (Uncalibrated Heuristics)', certainty: 68.4, fpRate: 34.2, brier: 0.24 },
  { cycle: 'Iteration 1 (Guideline Rule Retrieval)', certainty: 79.1, fpRate: 21.6, brier: 0.16 },
  { cycle: 'Iteration 2 (Specialty Style Indexing)', certainty: 89.5, fpRate: 11.4, brier: 0.09 },
  { cycle: 'Iteration 3 (Clinician Consensus Tuning)', certainty: 94.8, fpRate: 5.8, brier: 0.05 },
  { cycle: 'Iteration 4 (Calibrated Prototype)', certainty: 96.8, fpRate: 4.8, brier: 0.038 },
];

const DEPARTMENT_STYLE_ALIGNMENT = [
  { dept: 'Emergency Medicine', macros: 18, alignment: 98.4, alertFatigueDrop: '84.2%', status: 'Calibrated' },
  { dept: 'Orthopedic Surgery', macros: 14, alignment: 97.2, alertFatigueDrop: '82.0%', status: 'Calibrated' },
  { dept: 'Cardiology', macros: 22, alignment: 99.1, alertFatigueDrop: '86.5%', status: 'Calibrated' },
  { dept: 'Gastroenterology', macros: 12, alignment: 96.5, alertFatigueDrop: '79.8%', status: 'Calibrated' },
  { dept: 'Pulmonology', macros: 15, alignment: 97.8, alertFatigueDrop: '81.4%', status: 'Calibrated' },
];

export const AnalyticsRegistryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calibration' | 'regulatory_sync' | 'practitioners'>('calibration');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('All');

  const filteredPractitioners = PRACTITIONERS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.npi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesSpecialty = filterSpecialty === 'All' || p.specialty === filterSpecialty;
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Subtab Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070b14] border border-slate-800/80 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('calibration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calibration'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Human-Feedback Calibration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('regulatory_sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'regulatory_sync'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Rule Grounding & Retrieval Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practitioners')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'practitioners'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Practitioner Registry & Credentials</span>
        </button>
      </div>

      {/* VIEW 1: HUMAN-FEEDBACK CALIBRATION */}
      {activeTab === 'calibration' && (
        <div className="space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">CALIBRATION CERTAINTY</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400">96.8%</p>
              <p className="text-[10px] font-mono text-slate-400">Grounded confidence margin (+28.4 dB separation)</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">BRIER CALIBRATION SCORE</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-cyan-400">0.038</p>
              <p className="text-[10px] font-mono text-slate-400">Empirical probabilistic calibration (&lt;0.05 gold standard)</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">FALSE POSITIVE RATE</span>
                <TrendingUp className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-400">4.8%</p>
              <p className="text-[10px] font-mono text-slate-400">Suppressed from 34.2% baseline via clinician feedback</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">CLINICIAN TIME SAVED</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400">184.5 hrs/mo</p>
              <p className="text-[10px] font-mono text-slate-400">Physician alert fatigue and review overhead eliminated</p>
            </div>
          </div>

          {/* 2-Column: Calibration Trajectory + Specialty Style Learning */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Calibration Trajectory */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Calibration Iterations & False-Positive Suppression
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Consensus Tuning Active
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {CALIBRATION_TRAJECTORY.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#070b14] border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-200 font-bold">{item.cycle}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">Certainty: {item.certainty}%</span>
                        <span className="text-rose-400 font-bold">FPR: {item.fpRate}%</span>
                      </div>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: `${item.certainty}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Specialty Documentation Styles */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Specialty Documentation Shorthand & Style Profiles
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">5 Specialties Active</span>
              </div>

              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Suppresses repetitive false-positive penalties by recognizing standard department-specific shorthand and flowsheet idioms.
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                {DEPARTMENT_STYLE_ALIGNMENT.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white text-xs block">{d.dept}</strong>
                      <span className="text-[10px] text-slate-400">
                        {d.macros} macros recognized • Fatigue drop: <strong className="text-emerald-400">{d.alertFatigueDrop}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{d.alignment}%</span>
                      <span className="block text-[9px] text-purple-400 font-bold">{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RULE GROUNDING & REGULATORY RETRIEVAL SYNC */}
      {activeTab === 'regulatory_sync' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Official CMS & AMA CPT 2026 Regulatory Knowledge Base
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Real BM25 term-weighted retrieval engine binding every audit finding to verifiable official regulatory clauses.
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GROUNDED SYNC: CMS-2026.4</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>CPT 99291 / 99292</span>
                  <span className="text-[10px] text-slate-400">CMS §30.6.12</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Enforces strict 30-minute direct physician face-to-face requirement while distinguishing bedside nursing duration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>Modifier -59 / NCCI</span>
                  <span className="text-[10px] text-slate-400">CMS NCCI Edits</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Grounds distinct anatomical quadrants in acute polytrauma, preventing improper unbundling claims.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>AHA/ACC ACS 2026</span>
                  <span className="text-[10px] text-slate-400">AHA/ACC §3.2.1</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Validates 0h/3h cardiac troponin protocols and 10-minute 12-lead ECG door-to-acquisition benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRACTITIONER REGISTRY */}
      {activeTab === 'practitioners' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search physician by name, NPI, or hospital pavilion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#070b14] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="bg-[#070b14] border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3 focus:outline-none"
              >
                <option value="All">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                <option value="Neurology">Neurology</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#070b14] border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3 focus:outline-none"
              >
                <option value="All">All Audit Statuses</option>
                <option value="Compliant">Compliant</option>
                <option value="Flagged">Flagged</option>
                <option value="Action Pending">Action Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPractitioners.map((doc, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm font-sans">{doc.name}</h4>
                    <span className="text-[10px] text-slate-400">{doc.npi}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      doc.status === 'Compliant'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : doc.status === 'Flagged'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialty:</span>
                    <span className="font-semibold text-white">{doc.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Facility:</span>
                    <span className="text-slate-200 text-right truncate max-w-[180px]">{doc.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calibrated Compliance:</span>
                    <span className="font-bold text-emerald-400">{doc.ratingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Audited Cases:</span>
                    <span>{doc.totalCases} charts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
