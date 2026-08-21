import React, { useState } from 'react';
import { Complaint } from '../types';
import { Scale, PlusCircle, AlertCircle, Clock, CheckCircle, Send, Building2, User } from 'lucide-react';

interface ComplaintQueueProps {
  complaints: Complaint[];
  onSubmitComplaint: (complaint: Partial<Complaint>) => Promise<void>;
  isLoading: boolean;
}

export const ComplaintQueue: React.FC<ComplaintQueueProps> = ({
  complaints,
  onSubmitComplaint,
  isLoading
}) => {
  const [patient, setPatient] = useState('');
  const [facility, setFacility] = useState('');
  const [category, setCategory] = useState('Surgical Negligence');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !facility || !description) return;

    await onSubmitComplaint({
      patient,
      facility,
      category,
      description,
      status: 'Under Multi-Agent Audit',
      submitted_at: new Date().toISOString().split('T')[0]
    });

    setPatient('');
    setFacility('');
    setDescription('');
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'Under Multi-Agent Audit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Multi-Agent Auditing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Medical Malpractice & Negligence Complaint Queue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit patient complaints or hospital compliance concerns for immediate multi-agent AI triage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Complaint File</span>
        </button>
      </div>

      {/* Complaint List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complaints.map((c) => (
          <div key={c.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {c.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  {c.patient}
                </h3>
              </div>
              {getStatusBadge(c.status)}
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.facility}</span>
              </div>
              <div className="text-slate-300 font-medium">Category: {c.category}</div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {c.description}
            </p>

            <div className="text-[11px] text-slate-500 font-mono text-right">
              Submitted: {c.submitted_at}
            </div>
          </div>
        ))}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-400" />
                File Medical Malpractice Complaint
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hospital / Medical Facility</label>
                <input
                  type="text"
                  required
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Metro General Surgical Wing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Complaint Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option>Surgical Negligence</option>
                  <option>CPT Upcoding & Billing Fraud</option>
                  <option>EHR Documentation Omission</option>
                  <option>Informed Consent Failure</option>
                  <option>Post-Operative Complication Anomaly</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Case Allegation</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the clinical timeline, unbilled procedures, or physician negligence..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
