import React, { useState, useRef } from "react";
import { useApiStatus } from "./hooks/useApiStatus";
import { usePhysicianTarget } from "./hooks/usePhysicianTarget";
import { useLookups } from "./hooks/useLookups";
import { useGoogleReviewDraft } from "./hooks/useGoogleReviewDraft";
import { useFileUpload } from "./hooks/useFileUpload";
import { useCopilotChat } from "./hooks/useCopilotChat";
import { useAudit } from "./hooks/useAudit";

// Components
import { Header } from "./components/Header";
import { AuditSidebar } from "./components/AuditSidebar";
import { InvestigatorWorkspace } from "./components/InvestigatorWorkspace";
import { ComplaintQueueTab } from "./components/ComplaintQueueTab";
import { RegistryTab } from "./components/RegistryTab";
import { AboutTab } from "./components/AboutTab";
import { ComplaintDialog } from "./components/ComplaintDialog";
import { ChatCopilot } from "./components/ChatCopilot";

export default function App() {
  const [activeTab, setActiveTab] = useState<"investigator" | "complaints" | "registry" | "about">("investigator");
  const [investigatorSubView, setInvestigatorSubView] = useState<"report" | "patient" | "locker" | "ai">("report");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

  // Custom hook: Api readiness
  const { isApiReady, checkingApi } = useApiStatus();

  // Custom hook: Customizable doctor and hospital target fields
  const {
    doctorName,
    setDoctorName,
    doctorSpecialization,
    setDoctorSpecialization,
    hospitalName,
    setHospitalName,
    department,
    setDepartment,
  } = usePhysicianTarget();

  // Custom hook: Interactive lookups for physician credentials and hospital ratings
  const {
    doctorSearchText,
    setDoctorSearchText,
    doctorSearchResult,
    lookupError,
    hospitalSearchText,
    setHospitalSearchText,
    hospitalSearchResult,
    hospitalLookupError,
    isDoctorLoading: isLoadingDoctor,
    isHospitalLoading: isLoadingHospital,
    lookupDoctor: executeDoctorLookup,
    lookupHospital: executeHospitalLookup,
    clearDoctorSearch: clearDoctorLookup,
    clearHospitalSearch: clearHospitalLookup,
  } = useLookups();

  // Custom hook: Google reviews draft generation & simulation publish sandbox
  const {
    googleReviewDraft,
    isGeneratingGoogleReview,
    googleReviewError,
    googleReviewSource,
    showGoogleReviewPublishSandbox,
    generateDraft: generateReviewDraft,
    setShowGoogleReviewPublishSandbox,
    resetDraft: resetGoogleReviewDraft,
    setGoogleReviewDraft,
  } = useGoogleReviewDraft();

  // We need file upload hook to communicate with audit execution
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Custom hook: Global forensic audits engine state & actions
  const {
    audits,
    selectedAuditId,
    setSelectedAuditId,
    activeAudit,
    setActiveAudit,
    isLoading,
    auditStage,
    auditStageMessage,
    targetScore,
    setTargetScore,
    verdictText,
    setVerdictText,
    verdictState,
    setVerdictState,
    savedPathMsg,
    setSavedPathMsg,
    appStatus,
    setAppStatus,
    showComplianceConfirmation,
    setShowComplianceConfirmation,
    lastSelectedAuditToRegister,
    setLastSelectedAuditToRegister,
    isRecheckingAsSupervisor,
    supervisorError,
    isPublishingReview,
    loadHistoricalAudits,
    executeComplianceAudit,
    purgeAuditFile,
    syncActiveItem,
    clearWorkspace,
    triggerSupervisorRecheck,
    updateComplaintStatus,
    handleSimulatePublish,
  } = useAudit({
    doctorName,
    setDoctorName,
    doctorSpecialization,
    setDoctorSpecialization,
    hospitalName,
    setHospitalName,
    department,
    setDepartment,
    setSelectedFile: (file) => {
      if (!file) {
        fileUploadHook.clearSelectedFile();
      } else {
        fileUploadHook.setSelectedFile(file);
      }
    },
  });

  // Custom hook: Local and Drag-And-Drop file processing & parsing
  const fileUploadHook = useFileUpload({
    setDoctorName,
    setDoctorSpecialization,
    setDepartment,
    setTargetScore,
    setVerdictText,
    setVerdictState,
    setActiveAudit,
    setSelectedAuditId,
    setSavedPathMsg,
    setAppStatus,
  });

  // Custom hook: Conversational audit assistant & interactive image attachments
  const copilotChatHook = useCopilotChat(activeAudit);

  // Split historical lists for quick dashboard tabs rendering
  const pendingComplaints = audits.filter(
    (item) => item.complianceScore < 70 && item.complaint && item.complaint.status !== "REGISTERED" && item.complaint.status !== "DISMISSED"
  );
  const registeredComplaints = audits.filter(
    (item) => item.complaint && item.complaint.status === "REGISTERED"
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090D14] text-gray-100 overflow-hidden font-sans selection:bg-blue-600/30">
      {/* 1. Header Toolbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingComplaintsCount={pendingComplaints.length}
        checkingApi={checkingApi}
        isApiReady={isApiReady}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Interactive Left Side Panel Explorer */}
        <AuditSidebar
          audits={audits}
          selectedAuditId={selectedAuditId}
          syncActiveItem={syncActiveItem}
          purgeAuditFile={purgeAuditFile}
        />

        {/* 3. Central Working Dashboards */}
        {activeTab === "investigator" && (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Main forensic uploader view */}
            <InvestigatorWorkspace
              activeAudit={activeAudit}
              investigatorSubView={investigatorSubView}
              setInvestigatorSubView={setInvestigatorSubView}
              selectedFile={fileUploadHook.selectedFile}
              isLoading={isLoading}
              auditStage={auditStage}
              auditStageMessage={auditStageMessage}
              verdictText={verdictText}
              verdictState={verdictState}
              savedPathMsg={savedPathMsg}
              executeComplianceAudit={() => {
                if (fileUploadHook.selectedFile) {
                  executeComplianceAudit(fileUploadHook.selectedFile);
                }
              }}
              triggerPicker={fileUploadHook.triggerPicker}
              isRecheckingAsSupervisor={isRecheckingAsSupervisor}
              triggerSupervisorRecheck={triggerSupervisorRecheck}
              supervisorError={supervisorError}
              canvasRef={canvasRef}
              doctorName={doctorName}
              setDoctorName={setDoctorName}
              doctorSpecialization={doctorSpecialization}
              setDoctorSpecialization={setDoctorSpecialization}
              hospitalName={hospitalName}
              setHospitalName={setHospitalName}
              department={department}
              setDepartment={setDepartment}
              fileInputRef={fileUploadHook.fileInputRef}
              handleInputUpload={fileUploadHook.handleInputUpload}
              onDragOverHandler={fileUploadHook.onDragOverHandler}
              onDragLeaveHandler={fileUploadHook.onDragLeaveHandler}
              onDropHandler={fileUploadHook.onDropHandler}
              isDragging={fileUploadHook.isDragging}
              clearWorkspace={() => {
                clearWorkspace();
                fileUploadHook.clearSelectedFile();
              }}
              targetScore={targetScore}
            />

            {/* AI Auditor Chat Copilot Panel - Collapsible Sidebar */}
            {isChatOpen ? (
              <div className="w-[360px] md:w-[400px] h-full border-l border-[#21262D] bg-[#0D1117] flex flex-col shrink-0 z-20">
                <ChatCopilot
                  chatMessages={copilotChatHook.chatMessages}
                  chatInput={copilotChatHook.chatInput}
                  setChatInput={copilotChatHook.setChatInput}
                  chatLoading={copilotChatHook.chatLoading}
                  chatAttachedImage={copilotChatHook.chatAttachedImage}
                  onSendMessage={copilotChatHook.handleSendChatMessage}
                  onImageChange={copilotChatHook.handleChatImageChange}
                  onRemoveAttachedImage={copilotChatHook.removeAttachedImage}
                  imageInputRef={copilotChatHook.chatImageInputRef}
                  onClose={() => setIsChatOpen(false)}
                />
              </div>
            ) : (
              /* Floating Gemini Sparkle Toggle Button when closed */
              <button
                onClick={() => setIsChatOpen(true)}
                className="absolute bottom-6 right-6 bg-[#161B22]/95 hover:bg-[#21262D] border border-[#30363D] hover:border-pink-500/50 text-white rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2 text-xs font-semibold font-sans transition-all hover:scale-105 active:scale-95 z-30 cursor-pointer animate-fade-in"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="gemini-gradient-btn" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="30%" stopColor="#FFD93D" />
                      <stop offset="70%" stopColor="#4D96FF" />
                      <stop offset="100%" stopColor="#6BCB77" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
                    fill="url(#gemini-gradient-btn)"
                  />
                </svg>
                <span className="font-sans font-semibold tracking-wide text-white select-none">Mauditor</span>
              </button>
            )}
          </div>
        )}

        {activeTab === "complaints" && (
          <ComplaintQueueTab
            pendingComplaints={pendingComplaints}
            registeredComplaints={registeredComplaints}
            syncActiveItem={syncActiveItem}
            setActiveTab={setActiveTab}
            loadHistoricalAudits={loadHistoricalAudits}
            setAppStatus={setAppStatus}
            setInvestigatorSubView={setInvestigatorSubView}
          />
        )}

        {activeTab === "registry" && (
          <RegistryTab
            audits={audits}
            doctorSearchText={doctorSearchText}
            setDoctorSearchText={setDoctorSearchText}
            doctorSearchResult={doctorSearchResult}
            lookupError={lookupError}
            isDoctorLoading={isLoadingDoctor}
            searchDoctorLookup={() => executeDoctorLookup(department)}
            hospitalSearchText={hospitalSearchText}
            setHospitalSearchText={setHospitalSearchText}
            hospitalSearchResult={hospitalSearchResult}
            hospitalLookupError={hospitalLookupError}
            isHospitalLoading={isLoadingHospital}
            searchHospitalLookup={executeHospitalLookup}
          />
        )}

        {activeTab === "about" && <AboutTab />}
      </div>

      {/* 4. Action Alerts and Compliance Confirmation Overlay Modals */}
      <ComplaintDialog
        show={showComplianceConfirmation}
        onClose={() => setShowComplianceConfirmation(false)}
        audit={lastSelectedAuditToRegister}
        googleReviewDraft={googleReviewDraft}
        setGoogleReviewDraft={setGoogleReviewDraft}
        isGeneratingGoogleReview={isGeneratingGoogleReview}
        googleReviewError={googleReviewError}
        googleReviewSource={googleReviewSource}
        showGoogleReviewPublishSandbox={showGoogleReviewPublishSandbox}
        setShowGoogleReviewPublishSandbox={setShowGoogleReviewPublishSandbox}
        generateGoogleReviewDraft={(id) => generateReviewDraft(id, department)}
        onAction={(action) => {
          if (lastSelectedAuditToRegister) {
            updateComplaintStatus(action, lastSelectedAuditToRegister.id);
          } else {
            updateComplaintStatus(action);
          }
          setShowComplianceConfirmation(false);
        }}
        setAppStatus={setAppStatus}
      />

      {/* FOOTER BAR METRICS STATUS */}
      <footer className="h-9 px-6 bg-[#0D1117] border-t border-[#21262D] text-gray-500 text-[10px] font-mono flex items-center justify-between z-20 shrink-0">
        <span className="truncate max-w-[500px]" title={appStatus}>
          System Status: {appStatus}
        </span>
        <div className="flex gap-4 select-none">
          <span className="text-emerald-500 font-semibold">⚡ POSITIVE INTEGRATION READY</span>
          <span>© 2026 MedicalAuditor Forensics Hub</span>
        </div>
      </footer>
    </div>
  );
}
