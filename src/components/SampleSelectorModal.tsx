import React from 'react';
import { X, FileText, Check, Sparkles, Building2, User, Stethoscope } from 'lucide-react';
import { AuditRecord } from '../types';

export interface SampleCase {
  id: string;
  title: string;
  patientName: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  department: string;
  cptBilled: string;
  summary: string;
  recordText: string;
  expectedVerdict: 'Flagged' | 'Pass' | 'Failed';
  expectedScore: number;
}

export const PRESET_SAMPLE_CASES: SampleCase[] = [
  {
    id: 'CASE-101',
    title: 'Sarah Jenkins — Cardiology CPT Upcoding & High BP Discharge',
    patientName: 'Sarah Jenkins',
    doctorName: 'Dr. Angela Vance',
    specialization: 'Cardiology',
    hospitalName: 'Metro Heart Hospital',
    department: 'Cardiac Emergency Division',
    cptBilled: 'CPT 99291 ($1,200)',
    summary: 'Critical care code billed for 12-minute checkup; discharge authorized with BP 165/100.',
    expectedVerdict: 'Flagged',
    expectedScore: 42,
    recordText: `PATIENT CLINICAL RECORD
Patient Name: Sarah Jenkins | Age: 58 | Sex: F | MRN: 90281-Card
Attending Doctor: Dr. Angela Vance | Specialization: Cardiology
Facility: Metro Heart Hospital | Dept: Cardiac Emergency Division

CHIEF COMPLAINT:
Intermittent chest tightness and palpitation lasting 3 hours.

HISTORY OF PRESENT ILLNESS:
Patient presented to ED at 08:30 AM. Vitals at intake: BP 165/100 mmHg, HR 98 bpm, SpO2 97% on room air.
Electrocardiogram performed: Sinus tachycardia without acute ST elevation.

PHYSICIAN ORDERS & INTERVENTIONS:
08:45 AM - Sublingual nitroglycerin 0.4mg administered.
09:00 AM - Bedside checkup by Dr. Angela Vance. Physician evaluated patient at bedside for 12 minutes.
09:30 AM - Patient reported mild symptomatic improvement. Discharge approved despite BP remaining elevated at 165/100.

FINANCIAL & BILLING LEDGER:
- CPT 99291 (Critical Care, first 30-74 minutes) - Billed: $1,200.00
- CPT 93010 (12-Lead EKG interpretation) - Billed: $150.00
- Facility High Acuity Tier 4 Surcharge - Billed: $850.00

FORENSIC AUDIT DISCREPANCY:
1. Duration for CPT 99291 explicitly requires 30-74 minutes of direct physician critical management. Documented physician bedside care was only 12 minutes (constitutes billing upcoding).
2. Patient discharged with unaddressed Stage 2 Hypertension (165/100).`,
  },
  {
    id: 'CASE-102',
    title: 'Robert Davis — Orthopedic Closed Fracture Reduction (Exemplary Compliance)',
    patientName: 'Robert Davis',
    doctorName: 'Dr. Tyler Chase',
    specialization: 'Orthopedics',
    hospitalName: 'County Bone & Joint Clinic',
    department: 'Orthopedic Trauma Center',
    cptBilled: 'CPT 25605 ($850)',
    summary: 'AAOS guidelines strictly adhered to with pre/post reduction neurovascular checks and signed consent.',
    expectedVerdict: 'Pass',
    expectedScore: 92,
    recordText: `PATIENT CLINICAL RECORD
Patient Name: Robert Davis | Age: 34 | Sex: M | MRN: 44912-Ortho
Attending Doctor: Dr. Tyler Chase | Specialization: Orthopedics
Facility: County Bone & Joint Clinic | Dept: Orthopedic Trauma Center

CHIEF COMPLAINT:
Right wrist deformity and acute pain following fall onto outstretched hand while cycling.

PHYSICAL EXAMINATION:
Obvious dinner-fork deformity of right distal forearm. Radial pulse 2+ and symmetric. Sensation intact in median, radial, and ulnar distributions.
Informed written consent obtained from patient after discussing risks and alternatives.

PROCEDURE:
Closed reduction of right distal radius fracture with hematoma block anesthesia under sterile conditions. Post-reduction radiographs verify anatomic alignment with restoration of volar tilt and radial height.
Post-procedure distal neurovascular exam verified normal. Placed in well-padded sugar-tong splint.

FINANCIAL & BILLING LEDGER:
- CPT 25605 (Closed treatment of distal radial fracture; with manipulation) - Billed: $850.00
- CPT 73110 (Radiologic exam, wrist; complete minimum 3 views) - Billed: $120.00

FORENSIC AUDIT DISCREPANCY:
None. Procedural notes, timestamps, anesthesia logs, and pre/post X-ray confirmation strictly conform to clinical and billing guidelines.`,
  },
  {
    id: 'CASE-103',
    title: 'Eleanor Vance — Emergency Medicine Level 5 Upcoding & Delayed Laparoscopy',
    patientName: 'Eleanor Vance',
    doctorName: 'Dr. Marcus Reyes',
    specialization: 'Emergency Medicine',
    hospitalName: 'St. Jude General Hospital',
    department: 'Level 1 Trauma Center',
    cptBilled: 'CPT 99285 ($1,450)',
    summary: 'High complexity ER code billed for uncomplicated mild gastroenteritis; delayed surgical signoff.',
    expectedVerdict: 'Failed',
    expectedScore: 35,
    recordText: `PATIENT CLINICAL RECORD
Patient Name: Eleanor Vance | Age: 42 | Sex: F | MRN: 67104-ED
Attending Doctor: Dr. Marcus Reyes | Specialization: Emergency Medicine
Facility: St. Jude General Hospital | Dept: Level 1 Trauma Center

CHIEF COMPLAINT:
Right lower quadrant tenderness and low-grade nausea.

CLINICAL EVALUATION:
Patient arrived ambulatory. Vitals stable: BP 122/76, HR 78, Temp 98.6°F.
Ultrasound abdomen: Mild localized wall thickening of appendix without perforation or abscess.
Patient observed in holding for 4 hours. No intensive resuscitation or complex multi-system interventions were required.

FINANCIAL & BILLING LEDGER:
- CPT 99285 (Emergency department visit, highest complexity medical decision making) - Billed: $1,450.00
- CPT 99232 (Subsequent hospital care, high complexity) - Billed: $420.00
- Pharmacy IV Push high-complexity charge - Billed: $380.00

FORENSIC AUDIT DISCREPANCY:
1. Medical Decision Making (MDM) documented meets criteria for CPT 99283/99284 (Moderate complexity), NOT CPT 99285. This constitutes financial upcoding.
2. Missing supervisor countersignature on observation discharge summary.`,
  },
];

interface SampleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const SampleSelectorModal: React.FC<SampleSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101c] border border-[#212f48] rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1a2538] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Select Standard Clinical System Files
              </h3>
              <p className="text-xs text-slate-400">
                Choose a pre-configured EHR benchmark case to ingest into the multi-agent pipeline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151f33] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {PRESET_SAMPLE_CASES.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => {
                onSelectSample(caseItem);
                onClose();
              }}
              className="p-4 rounded-xl border border-[#1e2b40] bg-[#0d1424] hover:border-cyan-500/50 hover:bg-[#111a2f] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                      {caseItem.id}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {caseItem.patientName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {caseItem.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-500" />
                      {caseItem.specialization}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {caseItem.hospitalName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400 block">
                    {caseItem.cptBilled}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-mono font-bold uppercase mt-1 ${
                      caseItem.expectedVerdict === 'Pass'
                        ? 'text-emerald-400'
                        : caseItem.expectedVerdict === 'Flagged'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    Expected: {caseItem.expectedVerdict} ({caseItem.expectedScore}%)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
                {caseItem.summary}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#1a2538] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-400 hover:text-white bg-[#151f33] hover:bg-[#1c2a45] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
