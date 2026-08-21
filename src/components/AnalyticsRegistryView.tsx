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

const RLHF_HISTORY = [
  { cycle: 'Baseline (Raw LLM)', certainty: 68.4, fpRate: 34.2, brier: '0.24' },
  { cycle: 'Cycle 1 (NER + RAG Rules)', certainty: 79.1, fpRate: 21.6, brier: '0.16' },
  { cycle: 'Cycle 2 (CAG Dept Styles)', certainty: 89.5, fpRate: 11.4, brier: '0.09' },
  { cycle: 'Cycle 3 (DPO Human Overrides)', certainty: 94.8, fpRate: 5.8, brier: '0.05' },
  { cycle: 'Current (Continuous RLHF/CAG)', certainty: 97.4, fpRate: 3.1, brier: '0.02' },
];

const DEPARTMENT_CAG_ALIGNMENT = [
  { dept: 'Cardiology', alignment: 99.1, shorthands: 3, alertFatigueDrop: '84.1%', status: 'Calibrated' },
  { dept: 'Emergency Medicine', alignment: 98.4, shorthands: 4, alertFatigueDrop: '83.4%', status: 'Calibrated' },
  { dept: 'Orthopedic Surgery', alignment: 97.8, shorthands: 2, alertFatigueDrop: '82.8%', status: 'Calibrated' },
  { dept: 'ICU & Anesthesiology', alignment: 99.5, shorthands: 2, alertFatigueDrop: '84.5%', status: 'Calibrated' },
  { dept: 'Neurology', alignment: 96.9, shorthands: 2, alertFatigueDrop: '81.9%', status: 'Calibrated' },
];

export const AnalyticsRegistryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Jenkins');
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerProfile | null>(PRACTITIONERS[0]);
  const [activeTab, setActiveTab] = useState<'practitioners' | 'rlhf_decision_boundaries' | 'regulatory_sync'>('rlhf_decision_boundaries');

  const filteredPractitioners = PRACTITIONERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.npi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SECTION 4 BANNER */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              4. ANALYTICS REGISTRY & RLHF DECISION BOUNDARIES
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Reward model certainty metrics, dynamic CMS/AMA regulatory sync, and department documentation learning
            </p>
          </div>
        </div>

        {/* Global RLHF Stats Snapshot */}
        <div className="flex items-center gap-2.5 text-xs font-mono flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">REWARD MODEL CERTAINTY</span>
            <strong className="text-emerald-400 font-bold text-sm">97.4%</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">FALSE POSITIVE REDUCTION</span>
            <strong className="text-cyan-400 font-bold text-sm">91.2% (3.1% FP)</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">REGULATORY SYNC</span>
            <strong className="text-purple-400 font-bold text-xs">CMS-2026.4 / AMA</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tabs for Deep Inspection */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('rlhf_decision_boundaries')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rlhf_decision_boundaries'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Auditable Decision Boundaries & RLHF Calibration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('regulatory_sync')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'regulatory_sync'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dynamic Regulatory Updates (RAG/CAG)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practitioners')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'practitioners'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Practitioner Registry & Credentials</span>
        </button>
      </div>

      {/* VIEW 1: AUDITABLE RLHF DECISION BOUNDARIES */}
      {activeTab === 'rlhf_decision_boundaries' && (
        <div className="space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">DECISION MARGIN</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400">+28.4 dB</p>
              <p className="text-[10px] font-mono text-slate-400">High confidence separation from decision boundary threshold</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">BRIER CALIBRATION</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-cyan-400">0.024</p>
              <p className="text-[10px] font-mono text-slate-400">Optimal probabilistic calibration (&lt;0.05 is gold tier)</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">FALSE POSITIVE RATE</span>
                <TrendingUp className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-400">3.1%</p>
              <p className="text-[10px] font-mono text-slate-400">Reduced from 34.2% initial uncalibrated baseline</p>
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

          {/* 2-Column: Continuous Learning Flywheel Curve + Department Documentation Alignment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Continuous Trajectory Curve */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Continuous RLHF Training Cycle & False-Positive Reduction
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  DPO / RLAIF Active
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {RLHF_HISTORY.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#070b14] border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-200 font-bold">{item.cycle}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">Certainty: {item.certainty}%</span>
                        <span className="text-rose-400 font-bold">FP Rate: {item.fpRate}%</span>
                      </div>
                    </div>
                    {/* Visual bar */}
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

            {/* Right: Department Documentation Style Learning (CAG) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Department Documentation Style Learning (CAG)
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">5 Divisions Active</span>
              </div>

              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Prevents alert fatigue by learning department-specific macros and shorthand without manual rule rewrites.
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                {DEPARTMENT_CAG_ALIGNMENT.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white text-xs block">{d.dept}</strong>
                      <span className="text-[10px] text-slate-400">
                        {d.shorthands} macros recognized • Fatigue drop: <strong className="text-emerald-400">{d.alertFatigueDrop}</strong>
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

      {/* VIEW 2: DYNAMIC REGULATORY SYNC (RAG/CAG) */}
      {activeTab === 'regulatory_sync' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Dynamic CMS & AMA CPT 2026 Regulatory Knowledge Base
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Human corrections rapidly align the agent when regulatory guidelines update annually.
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>DYNAMIC SYNC: CMS-2026.4</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>CPT 99291 / 99292</span>
                  <span className="text-[10px] text-slate-400">AMA 2026 Standard</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Enforces strict 30-minute direct physician face-to-face requirement while distinguishing bedside nursing support.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>CPT 99285 vs 99284</span>
                  <span className="text-[10px] text-slate-400">Emergency MDM</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Evaluates Level 5 high-risk medical decision making criteria against objective EHR clinical severity markers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Modifier -59 / -XE / -XP</span>
                  <span className="text-[10px] text-slate-400">NCCI Unbundling</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Automatically exempts post-reduction surgical splinting in acute displaced fracture trauma cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRACTITIONERS LOOKUP */}
      {activeTab === 'practitioners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Practitioner Search & Credential Lookup
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {filteredPractitioners.length} Matches Found
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search practitioner (e.g. 'Jenkins', 'Vance'), NPI, or hospital..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredPractitioners.map((p) => {
                  const isSelected = selectedPractitioner?.npi === p.npi;
                  return (
                    <div
                      key={p.npi}
                      onClick={() => setSelectedPractitioner(p)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-[#070b14] border-slate-800/80 hover:bg-slate-800/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-mono font-bold text-white">
                            {p.name}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-400">
                            {p.npi}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          {p.specialty} • {p.hospital}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            p.status === 'Compliant'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : p.status === 'Flagged'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          Score: <strong className="text-white">{p.ratingScore}%</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedPractitioner && (
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">
                      {selectedPractitioner.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      Verified Clinical Credentials & Board Standing
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Last Audited: {selectedPractitioner.lastAudit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">COMPLIANCE INDEX</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedPractitioner.ratingScore}/100
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">TOTAL CASES</span>
                  <span className="text-base font-bold text-white">
                    {selectedPractitioner.totalCases}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
