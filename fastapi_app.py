import os
import sys
import json
import asyncio
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Add workspace root to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from tools.database import ForensicDB
from tools.training_dataset import TrainingDataset
from tools.rag_cag_engine import RAG_CAG_IngestionEngine
from tools.rlhf_reward_model import RLHFRewardModelService
from agents.referee_agent import run_forensic_pipeline
from agents.chatbot_agent import query_forensic_copilot

PORT = 8088

HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedicalAuditor V2.1 — Python FastAPI Clinical Forensics Engine</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #090d14; color: #f0f6fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .card-bg { background-color: #121620; border: 1px solid #21262d; }
        .badge-pass { background-color: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid rgba(63, 185, 80, 0.3); }
        .badge-flagged { background-color: rgba(210, 153, 34, 0.15); color: #d29922; border: 1px solid rgba(210, 153, 34, 0.3); }
        .badge-failed { background-color: rgba(248, 81, 73, 0.15); color: #f85149; border: 1px solid rgba(248, 81, 73, 0.3); }
    </style>
</head>
<body class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-[#21262d] bg-[#0d1117] px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg">
                🛡️
            </div>
            <div>
                <h1 class="text-lg font-bold text-white tracking-wide">MedicalAuditor <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Python FastAPI v2.1</span></h1>
                <p class="text-xs text-gray-400">Multi-Agent Medical & Billing Compliance Evaluation Engine</p>
            </div>
        </div>
        <div class="flex items-center space-x-3 text-xs">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span> FastAPI Engine Active (Port 3000)
            </span>
        </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-[#0d1117] border-b border-[#21262d] px-6 flex space-x-1 text-sm font-medium">
        <button onclick="switchTab('investigator')" id="tab-investigator" class="tab-btn py-3 px-4 border-b-2 border-blue-500 text-blue-400 font-semibold flex items-center gap-2">
            🔍 Forensic Investigator
        </button>
        <button onclick="switchTab('dataset')" id="tab-dataset" class="tab-btn py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-200 flex items-center gap-2">
            🎓 10,000 Training Dataset & Benchmark
        </button>
        <button onclick="switchTab('queue')" id="tab-queue" class="tab-btn py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-200 flex items-center gap-2">
            ⚖️ Complaint Queue
        </button>
        <button onclick="switchTab('copilot')" id="tab-copilot" class="tab-btn py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-200 flex items-center gap-2">
            💬 AI Forensic Copilot
        </button>
    </nav>

    <!-- Main Workspace Container -->
    <main class="flex-1 p-6 max-w-7xl w-full mx-auto">
        <!-- TAB 1: INVESTIGATOR WORKSPACE -->
        <div id="view-investigator" class="tab-content space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold text-white">Active Case File Forensic Audit</h2>
                    <p class="text-xs text-gray-400">Evaluate clinical records for negligence, CPT upcoding, and chronological anomalies.</p>
                </div>
                <button onclick="triggerReaudit()" id="reaudit-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all">
                    <i class="fa-solid fa-arrows-rotate"></i> 🔎 Re-Audit File (Multi-Agent Engine)
                </button>
            </div>

            <!-- Audit Cards Grid -->
            <div id="audit-cards-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="card-bg p-6 rounded-xl border border-[#21262d]">
                    <div class="animate-pulse space-y-3">
                        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div class="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                </div>
            </div>

            <!-- Active Audit Detailed View -->
            <div id="active-audit-detail" class="card-bg p-6 rounded-xl border border-[#21262d] space-y-4">
                <h3 class="text-lg font-bold text-white border-b border-[#21262d] pb-3">Forensic Inspection Report</h3>
                <div id="audit-report-body" class="prose prose-invert max-w-none text-sm text-gray-300">
                    Loading forensic inspection details...
                </div>
            </div>
        </div>

        <!-- TAB 2: 10,000 TRAINING DATASET -->
        <div id="view-dataset" class="tab-content hidden space-y-6">
            <div>
                <h2 class="text-xl font-bold text-white">🎓 10,000-Sample Medical Forensic Benchmark Dataset</h2>
                <p class="text-xs text-gray-400">Ground-truth clinical and billing training dataset across 25 medical specialties powered by Python FastAPI.</p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="card-bg p-4 rounded-xl text-center">
                    <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Training Reports</p>
                    <p class="text-2xl font-bold text-blue-400 mt-1">10,000</p>
                </div>
                <div class="card-bg p-4 rounded-xl text-center">
                    <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Medical Specialties</p>
                    <p class="text-2xl font-bold text-purple-400 mt-1">25</p>
                </div>
                <div class="card-bg p-4 rounded-xl text-center">
                    <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ground-Truth Pass</p>
                    <p class="text-2xl font-bold text-emerald-400 mt-1">4,000</p>
                </div>
                <div class="card-bg p-4 rounded-xl text-center">
                    <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Flagged / Failed</p>
                    <p class="text-2xl font-bold text-rose-400 mt-1">6,000</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-3 card-bg p-4 rounded-xl border border-[#21262d]">
                <input type="text" id="dataset-search" oninput="filterDataset()" placeholder="🔍 Search CPT code, doctor, patient or keywords..." class="flex-1 min-w-[240px] bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <select id="dataset-topic" onchange="filterDataset()" class="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="All Topics">All 25 Medical Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="ICU & Anesthesiology">ICU & Anesthesiology</option>
                </select>
            </div>

            <div id="dataset-list-container" class="space-y-3">
                <div class="card-bg p-4 rounded-lg text-sm text-gray-400">Loading training dataset samples...</div>
            </div>
        </div>

        <!-- TAB 3: COMPLAINT QUEUE -->
        <div id="view-queue" class="tab-content hidden space-y-6">
            <div>
                <h2 class="text-xl font-bold text-white">⚖️ Clinical & Financial Complaint Filings</h2>
                <p class="text-xs text-gray-400">Logged compliance infractions ready for re-checking and formal supervisory review.</p>
            </div>

            <div id="complaint-queue-list" class="space-y-4">
                <div class="card-bg p-4 rounded-lg text-sm text-gray-400">Loading complaint queue...</div>
            </div>
        </div>

        <!-- TAB 4: COPILOT -->
        <div id="view-copilot" class="tab-content hidden space-y-4">
            <div>
                <h2 class="text-xl font-bold text-white">💬 AI Forensic Copilot Agent</h2>
                <p class="text-xs text-gray-400">Ask questions regarding CPT upcoding, clinical care standards, or specific case file records.</p>
            </div>

            <div class="card-bg p-4 rounded-xl border border-[#21262d] h-[450px] flex flex-col">
                <div id="chat-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    <div class="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg text-blue-200">
                        🤖 <strong>AI Forensic Copilot:</strong> Welcome! I am initialized with the Python FastAPI forensic agent backend. Ask me to explain CPT codes, re-audit any case file, or check clinical compliance.
                    </div>
                </div>
                <div class="flex gap-2 mt-3 pt-3 border-t border-[#21262d]">
                    <input type="text" id="chat-input" placeholder="Type your clinical audit question..." class="flex-1 bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" onkeydown="if(event.key==='Enter') sendChatMessage()">
                    <button onclick="sendChatMessage()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold">Send</button>
                </div>
            </div>
        </div>
    </main>

    <script>
        let currentAudits = [];
        let allDatasetSamples = [];
        let activeAuditId = null;

        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(el => {
                el.classList.remove('border-blue-500', 'text-blue-400');
                el.classList.add('border-transparent', 'text-gray-400');
            });

            document.getElementById('view-' + tabName).classList.remove('hidden');
            const activeBtn = document.getElementById('tab-' + tabName);
            activeBtn.classList.add('border-blue-500', 'text-blue-400');
            activeBtn.classList.remove('border-transparent', 'text-gray-400');

            if (tabName === 'dataset' && allDatasetSamples.length === 0) {
                loadDataset();
            }
        }

        async function loadAudits() {
            try {
                const res = await fetch('/api/audits');
                const data = await res.json();
                currentAudits = data.audits || [];
                renderAudits();
                renderComplaints();
            } catch (err) {
                console.error('Error loading audits:', err);
            }
        }

        function renderAudits() {
            const container = document.getElementById('audit-cards-container');
            if (currentAudits.length === 0) {
                container.innerHTML = '<div class="card-bg p-4 rounded-lg text-sm text-gray-400 col-span-2">No audits found.</div>';
                return;
            }

            container.innerHTML = currentAudits.map(audit => {
                const isSelected = audit.id === activeAuditId;
                const badgeClass = audit.verdict === 'Pass' ? 'badge-pass' : (audit.verdict === 'Flagged' ? 'badge-flagged' : 'badge-failed');
                return `
                    <div class="card-bg p-5 rounded-xl border ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[#21262d]'} cursor-pointer hover:border-gray-500 transition-all" onclick="selectAudit('${audit.id}')">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-bold text-white text-base">${audit.patientName || 'Patient Record'}</h4>
                                <p class="text-xs text-gray-400">${audit.doctorName || 'Dr. Elena Vance'} — ${audit.hospitalName || 'St. Jude General'}</p>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}">${audit.verdict || 'Flagged'} (${audit.complianceScore || 75}/100)</span>
                        </div>
                        <div class="text-xs text-gray-300 line-clamp-2 bg-[#0d1117] p-2.5 rounded border border-[#21262d] mb-3 font-mono">
                            ${(audit.reportMarkdown || '').slice(0, 180)}...
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-gray-500">ID: ${audit.id}</span>
                            <button onclick="event.stopPropagation(); triggerReaudit('${audit.id}')" class="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                                🔎 Recheck Details (Re-Audit File)
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            if (!activeAuditId && currentAudits.length > 0) {
                selectAudit(currentAudits[0].id);
            }
        }

        function selectAudit(id) {
            activeAuditId = id;
            renderAudits();
            const audit = currentAudits.find(a => a.id === id);
            const reportEl = document.getElementById('audit-report-body');
            if (audit) {
                reportEl.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between bg-[#0d1117] p-3 rounded-lg border border-[#21262d]">
                            <div>
                                <span class="text-xs text-gray-400">Compliance Rating:</span>
                                <span class="text-lg font-bold ml-2 ${audit.complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}">${audit.complianceScore}/100</span>
                            </div>
                            <div>
                                <span class="text-xs text-gray-400">Verdict:</span>
                                <span class="text-xs font-bold px-2 py-1 rounded ml-2 ${audit.verdict === 'Pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${audit.verdict}</span>
                            </div>
                        </div>
                        <pre class="whitespace-pre-wrap font-sans bg-[#0d1117] p-4 rounded-lg border border-[#21262d] text-xs leading-relaxed text-gray-200">${audit.reportMarkdown || 'No detailed report text available.'}</pre>
                    </div>
                `;
            }
        }

        async function triggerReaudit(auditId) {
            const targetId = auditId || activeAuditId || (currentAudits[0] && currentAudits[0].id);
            const btn = document.getElementById('reaudit-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Re-Auditing File...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/fastapi/re-audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audit_id: targetId })
                });
                const data = await res.json();
                if (data.success) {
                    await loadAudits();
                    if (data.audit) {
                        selectAudit(data.audit.id);
                    }
                    alert('✅ Re-audit complete via Python FastAPI engine! Verdict: ' + (data.audit ? data.audit.verdict : 'Verified'));
                }
            } catch (err) {
                alert('Re-audit error: ' + err.message);
            } finally {
                btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> 🔎 Re-Audit File (Multi-Agent Engine)';
                btn.disabled = false;
            }
        }

        async function loadDataset() {
            try {
                const res = await fetch('/api/training/samples');
                const data = await res.json();
                allDatasetSamples = data.samples || [];
                renderDatasetSamples(allDatasetSamples.slice(0, 25));
            } catch (err) {
                console.error('Error loading dataset:', err);
            }
        }

        function filterDataset() {
            const query = document.getElementById('dataset-search').value.toLowerCase();
            const topic = document.getElementById('dataset-topic').value;

            let filtered = allDatasetSamples;
            if (topic !== 'All Topics') {
                filtered = filtered.filter(s => s.topic === topic);
            }
            if (query) {
                filtered = filtered.filter(s => 
                    (s.title && s.title.toLowerCase().includes(query)) ||
                    (s.id && s.id.toLowerCase().includes(query)) ||
                    (s.cptBilled && s.cptBilled.toLowerCase().includes(query))
                );
            }
            renderDatasetSamples(filtered.slice(0, 25));
        }

        function renderDatasetSamples(samples) {
            const container = document.getElementById('dataset-list-container');
            if (samples.length === 0) {
                container.innerHTML = '<div class="card-bg p-4 rounded-lg text-sm text-gray-400">No matching training samples found.</div>';
                return;
            }

            container.innerHTML = samples.map(s => `
                <div class="card-bg p-4 rounded-lg border border-[#21262d] space-y-2">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">${s.id}</span>
                            <span class="text-xs text-purple-400 font-semibold">${s.topic}</span>
                            <span class="text-xs text-white font-bold">${s.title}</span>
                        </div>
                        <span class="text-xs font-bold ${s.verdict === 'Pass' ? 'text-emerald-400' : 'text-amber-400'}">${s.verdict} (${s.complianceScore}/100)</span>
                    </div>
                    <p class="text-xs text-gray-400 font-mono bg-[#0d1117] p-2 rounded">${(s.recordText || '').slice(0, 160)}...</p>
                </div>
            `).join('');
        }

        function renderComplaints() {
            const container = document.getElementById('complaint-queue-list');
            if (currentAudits.length === 0) {
                container.innerHTML = '<div class="card-bg p-4 rounded-lg text-sm text-gray-400">No active complaint queue items.</div>';
                return;
            }
            container.innerHTML = currentAudits.map(item => `
                <div class="card-bg p-5 rounded-xl border border-[#21262d] flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-white text-sm">${item.doctorName || 'Dr. Elena Vance'}</h4>
                        <p class="text-xs text-gray-400">${item.department || 'Emergency Medicine'} • ${item.hospitalName || 'St. Jude Hospital'}</p>
                        <p class="text-xs text-amber-300 mt-2 italic bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20 inline-block">
                            "Infraction Evidence: Clinical and financial records reveal compliance anomalies requiring forensic re-audit."
                        </p>
                    </div>
                    <button onclick="triggerReaudit('${item.id}')" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
                        🔎 Recheck Details (Re-Audit File)
                    </button>
                </div>
            `).join('');
        }

        async function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const msg = input.value.trim();
            if (!msg) return;

            const msgsContainer = document.getElementById('chat-messages');
            msgsContainer.innerHTML += `
                <div class="bg-gray-800 p-3 rounded-lg text-white ml-8">
                    👤 <strong>Investigator:</strong> ${msg}
                </div>
            `;
            input.value = '';
            msgsContainer.scrollTop = msgsContainer.scrollHeight;

            try {
                const res = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                });
                const data = await res.json();
                msgsContainer.innerHTML += `
                    <div class="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg text-blue-200 mr-8">
                        🤖 <strong>AI Forensic Copilot:</strong> ${data.reply || data.response || 'Evaluation complete.'}
                    </div>
                `;
                msgsContainer.scrollTop = msgsContainer.scrollHeight;
            } catch (err) {
                msgsContainer.innerHTML += `
                    <div class="bg-rose-900/30 border border-rose-500/30 p-3 rounded-lg text-rose-200 mr-8">
                        ⚠️ Error: ${err.message}
                    </div>
                `;
            }
        }

        // Initialize on load
        window.addEventListener('DOMContentLoaded', () => {
            loadAudits();
        });
    </script>
</body>
</html>
"""


# Check if fastapi / uvicorn are available, otherwise use Python's HTTP Server
try:
    from fastapi import FastAPI, HTTPException, Body
    from fastapi.responses import HTMLResponse
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn

    fastapi_app = FastAPI(
        title="Forensic Medical Compliance Multi-Agent API",
        description="FastAPI Backend for Multi-Agent Clinical & Financial Forensic Auditing Engine",
        version="2.1.0"
    )

    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @fastapi_app.get("/", response_class=HTMLResponse)
    async def get_index():
        return HTML_UI

    @fastapi_app.get("/health")
    @fastapi_app.get("/api/health")
    @fastapi_app.get("/api/fastapi/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "Forensic Medical Audit FastAPI Server",
            "version": "2.1.0",
            "agent_engine": "Multi-Agent Dual-Validation Pipeline",
            "training_samples_count": len(TrainingDataset.get_all_samples())
        }

    @fastapi_app.get("/api/audits")
    @fastapi_app.get("/api/fastapi/audits")
    async def get_audits():
        audits = ForensicDB.get_all_audits()
        return {
            "count": len(audits),
            "audits": audits
        }

    @fastapi_app.delete("/api/audits/{audit_id}")
    @fastapi_app.delete("/api/fastapi/audits/{audit_id}")
    async def delete_audit(audit_id: str):
        ForensicDB.purge_audit(audit_id)
        return {"success": True, "message": f"Audit {audit_id} deleted successfully", "id": audit_id}

    @fastapi_app.post("/api/fastapi/re-audit")
    @fastapi_app.post("/api/audits/{audit_id}/supervisor-recheck")
    async def reaudit_case(audit_id: str = None, payload: dict = Body(None)):
        payload = payload or {}
        a_id = audit_id or payload.get("audit_id") or payload.get("id")
        record_text = payload.get("record_text") or payload.get("recordText") or payload.get("reportMarkdown")
        patient_name = payload.get("patient_name") or payload.get("patientName") or "Patient Record"

        existing_audit = None
        if a_id:
            existing_audit = ForensicDB.get_audit_by_id(str(a_id))
            if existing_audit and not record_text:
                record_text = existing_audit.get("reportMarkdown") or existing_audit.get("rawRecordText") or ""
                patient_name = existing_audit.get("patientName") or patient_name

        if not record_text:
            record_text = f"Clinical case record for {patient_name}. Patient evaluated for emergency & CPT billing compliance."

        pipeline_res = await run_forensic_pipeline(record_text, patient_name=patient_name)

        audit_id_final = (existing_audit["id"] if existing_audit else None) or a_id or f"AUD-{int(asyncio.get_event_loop().time() * 1000)}"

        updated_audit = {
            "id": audit_id_final,
            "patientName": pipeline_res.get("patientName", patient_name),
            "doctorName": pipeline_res.get("doctorName", existing_audit.get("doctorName") if existing_audit else "Unknown / Not documented"),
            "hospitalName": pipeline_res.get("hospitalName", existing_audit.get("hospitalName") if existing_audit else "Unknown / Not documented"),
            "department": pipeline_res.get("department", existing_audit.get("department") if existing_audit else "Emergency Medicine"),
            "complianceScore": pipeline_res["complianceScore"],
            "primaryScore": pipeline_res["complianceScore"],
            "verdict": pipeline_res["verdict"],
            "riskClassification": pipeline_res["riskClassification"],
            "clinicalScore": pipeline_res["clinicalScore"],
            "billingScore": pipeline_res["billingScore"],
            "documentationScore": pipeline_res["documentationScore"],
            "timelineScore": pipeline_res["timelineScore"],
            "reportMarkdown": pipeline_res["reportMarkdown"],
            "findings": pipeline_res["findings"],
            "explainedTerms": pipeline_res["explainedTerms"],
            "reconstructed_timeline": pipeline_res.get("reconstructed_timeline", []),
            "supervisorRecheck": {
                "status": "RE_AUDITED",
                "timestamp": ForensicDB.get_all_audits()[0]["timestamp"] if ForensicDB.get_all_audits() else "",
                "verifiedBy": "Multi-Agent Forensic Pipeline (FastAPI Backend)",
                "evidenceCheckSummary": f"Re-audit completed. Calibrated compliance score: {pipeline_res['complianceScore']}/100."
            }
        }

        saved_audit = ForensicDB.save_audit(updated_audit)
        return {
            "success": True,
            "message": "Forensic multi-agent re-audit complete",
            "audit": saved_audit
        }

    @fastapi_app.get("/api/training/samples")
    @fastapi_app.get("/api/fastapi/training/samples")
    async def get_training_samples():
        return {
            "count": len(TrainingDataset.get_all_samples()),
            "samples": TrainingDataset.get_all_samples()
        }

    @fastapi_app.get("/api/rlhf/metrics")
    @fastapi_app.get("/api/fastapi/rlhf/metrics")
    async def get_rlhf_metrics():
        return RLHFRewardModelService.get_reward_model_metrics()

    @fastapi_app.get("/api/rag/regulatory-rules")
    @fastapi_app.get("/api/fastapi/rag/regulatory-rules")
    async def get_regulatory_rules():
        return {
            "rules": RLHFRewardModelService.get_reward_model_metrics()["active_regulatory_rules"],
            "version": "CMS-2026.4 / AMA-CPT-v24.1 (Dynamic Sync Active)"
        }

    @fastapi_app.post("/api/complaints/resolve")
    @fastapi_app.post("/api/rlhf/feedback")
    async def resolve_complaint_and_feed_rlhf(payload: dict = Body(...)):
        return RAG_CAG_IngestionEngine.register_human_feedback(
            case_id=payload.get("case_id", "CASE-OVERRIDE"),
            department=payload.get("department", "Emergency Medicine"),
            critique=payload.get("critique", "Initial finding"),
            auditor_override=payload.get("override_note", "Verified compliant"),
            adjustment=payload.get("score_adjustment", 15),
            rule=payload.get("rule", "Human override")
        )

    @fastapi_app.post("/api/chatbot")
    async def chatbot_endpoint(payload: dict = Body(...)):
        user_msg = payload.get("message") or payload.get("user_message") or ""
        reply = query_forensic_copilot(user_msg)
        return {"success": True, "reply": reply, "response": reply}

    HAS_FASTAPI = True

except ImportError:
    HAS_FASTAPI = False


class ForensicRESTHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ["/", "/index.html"]:
            self._set_headers(200, "text/html; charset=utf-8")
            self.wfile.write(HTML_UI.encode('utf-8'))

        elif path in ["/health", "/api/health", "/api/fastapi/health"]:
            self._set_headers(200)
            res = {
                "status": "healthy",
                "service": "Forensic Medical Audit FastAPI/REST Server",
                "version": "2.1.0",
                "agent_engine": "Multi-Agent Dual-Validation Pipeline",
                "training_samples_count": len(TrainingDataset.get_all_samples())
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path in ["/api/audits", "/api/fastapi/audits"]:
            self._set_headers(200)
            audits = ForensicDB.get_all_audits()
            res = {"count": len(audits), "audits": audits}
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path in ["/api/training/samples", "/api/fastapi/training/samples"]:
            self._set_headers(200)
            res = {
                "count": len(TrainingDataset.get_all_samples()),
                "samples": TrainingDataset.get_all_samples()
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path in ["/api/rlhf/metrics", "/api/fastapi/rlhf/metrics"]:
            self._set_headers(200)
            self.wfile.write(json.dumps(RLHFRewardModelService.get_reward_model_metrics()).encode('utf-8'))

        elif path in ["/api/rag/regulatory-rules", "/api/fastapi/rag/regulatory-rules"]:
            self._set_headers(200)
            rules_res = {
                "rules": RLHFRewardModelService.get_reward_model_metrics()["active_regulatory_rules"],
                "version": "CMS-2026.4 / AMA-CPT-v24.1 (Dynamic Sync Active)"
            }
            self.wfile.write(json.dumps(rules_res).encode('utf-8'))

        elif path in ["/api/complaints", "/api/fastapi/complaints"]:
            self._set_headers(200)
            res = {
                "count": 2,
                "complaints": [
                    {
                        "id": "CMP-801",
                        "patient": "De-identified Patient A",
                        "facility": "Facility A",
                        "category": "Surgical Negligence",
                        "status": "Under Multi-Agent Audit",
                        "submitted_at": "2026-08-01",
                        "description": "Post-operative complication anomaly following laparoscopic cholecystectomy without recorded physician signoff."
                    },
                    {
                        "id": "CMP-802",
                        "patient": "De-identified Patient B",
                        "facility": "Facility B",
                        "category": "CPT Upcoding & Billing Fraud",
                        "status": "Pending Review",
                        "submitted_at": "2026-08-02",
                        "description": "Billed high-complexity ER visit code CPT 99285 without documented level 5 medical decision making."
                    }
                ]
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path in ["/api/benchmark/metrics", "/api/fastapi/benchmark/metrics"]:
            self._set_headers(200)
            from evaluation.evaluator import BenchmarkEvaluator
            metrics = BenchmarkEvaluator.evaluate_all().to_dict()
            self.wfile.write(json.dumps(metrics).encode('utf-8'))

        elif path in ["/api/experiments/ablation", "/api/fastapi/experiments/ablation"]:
            self._set_headers(200)
            from evaluation.experiments import ExperimentBenchmarkRunner
            ablations = [r.to_dict() for r in ExperimentBenchmarkRunner.run_full_ablation_experiment()]
            self.wfile.write(json.dumps({"count": len(ablations), "results": ablations}).encode('utf-8'))

        elif path in ["/api/experiments/runs", "/api/fastapi/experiments/runs"]:
            self._set_headers(200)
            from core.experiment_tracker import ExperimentTracker
            ExperimentTracker.seed_initial_ablation_runs()
            runs = ExperimentTracker.get_all_runs()
            self.wfile.write(json.dumps({"count": len(runs), "runs": runs}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        if path in ["/api/reaudit", "/api/fastapi/re-audit", "/api/re-audit"] or "/supervisor-recheck" in path:
            audit_id = payload.get("case_id") or payload.get("audit_id") or payload.get("id")
            record_text = payload.get("record_text") or payload.get("recordText") or payload.get("reportMarkdown")
            patient_name = payload.get("patient_name") or payload.get("patientName") or "Patient Record"

            existing_audit = None
            if audit_id:
                existing_audit = ForensicDB.get_audit_by_id(str(audit_id))
                if existing_audit and not record_text:
                    record_text = existing_audit.get("reportMarkdown") or existing_audit.get("rawRecordText") or ""
                    patient_name = existing_audit.get("patientName") or patient_name

            if not record_text:
                record_text = f"Clinical case record for {patient_name}."

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            pipeline_res = loop.run_until_complete(run_forensic_pipeline(record_text, patient_name=patient_name))
            loop.close()

            audit_id_final = (existing_audit["id"] if existing_audit else None) or audit_id or f"AUD-{int(asyncio.get_event_loop().time() * 1000)}"

            updated_audit = {
                "id": audit_id_final,
                "case_id": audit_id_final,
                "patient_name": pipeline_res.get("patientName", patient_name),
                "doctor_name": pipeline_res.get("doctorName", existing_audit.get("doctorName") if existing_audit else "Unknown / Not documented"),
                "hospital": pipeline_res.get("hospitalName", existing_audit.get("hospitalName") if existing_audit else "Unknown / Not documented"),
                "compliance_rating": pipeline_res["complianceScore"],
                "verdict": pipeline_res["verdict"],
                "risk_classification": pipeline_res["riskClassification"],
                "findings": pipeline_res["findings"],
                "report_markdown": pipeline_res["reportMarkdown"]
            }

            saved_audit = ForensicDB.save_audit(updated_audit)
            self._set_headers(200)
            res = {
                "success": True,
                "message": "Forensic multi-agent re-audit complete",
                "audit": saved_audit
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path in ["/api/copilot", "/api/chatbot", "/api/fastapi/copilot"]:
            user_msg = payload.get("message") or payload.get("user_message") or ""
            reply = query_forensic_copilot(user_msg)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "reply": reply, "response": reply}).encode('utf-8'))

        elif path in ["/api/complaints/resolve", "/api/rlhf/feedback"]:
            fb_res = RAG_CAG_IngestionEngine.register_human_feedback(
                case_id=payload.get("case_id", "CASE-OVERRIDE"),
                department=payload.get("department", "Emergency Medicine"),
                critique=payload.get("critique", "Initial finding"),
                auditor_override=payload.get("override_note", "Verified compliant"),
                adjustment=payload.get("score_adjustment", 15),
                rule=payload.get("rule", "Human override")
            )
            self._set_headers(200)
            self.wfile.write(json.dumps(fb_res).encode('utf-8'))

        elif path in ["/api/complaints"]:
            self._set_headers(200)
            c_id = f"CMP-{int(asyncio.get_event_loop().time() * 1000) % 1000}"
            new_complaint = {
                "id": c_id,
                "patient": payload.get("patient", "Anonymous Patient"),
                "facility": payload.get("facility", "General Hospital"),
                "category": payload.get("category", "Medical Malpractice"),
                "status": "Under Multi-Agent Audit",
                "submitted_at": "2026-08-03",
                "description": payload.get("description", "Complaint submitted for forensic audit.")
            }
            self.wfile.write(json.dumps({"success": True, "complaint": new_complaint}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/audits/") or path.startswith("/api/fastapi/audits/"):
            audit_id = path.split("/")[-1]
            ForensicDB.purge_audit(audit_id)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": f"Audit {audit_id} deleted successfully", "id": audit_id}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))


def main():
    if HAS_FASTAPI:
        print(f"🚀 Launching Python FastAPI Server on port {PORT}...")
        uvicorn.run(fastapi_app, host="0.0.0.0", port=PORT)
    else:
        print(f"🚀 Launching Forensic Medical Auditor Python Backend on port {PORT}...")
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("0.0.0.0", PORT), ForensicRESTHandler) as httpd:
            httpd.serve_forever()


if __name__ == "__main__":
    main()
