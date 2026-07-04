import React, { useState, useRef } from "react";

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  data: string;
}

interface FileUploadOptions {
  setDoctorName: (name: string) => void;
  setDoctorSpecialization: (spec: string) => void;
  setHospitalName: (name: string) => void;
  setDepartment: (dept: "Cardiology" | "Orthopedics" | "Radiology" | "Emergency Medicine" | "") => void;
  setTargetScore: (score: number) => void;
  setVerdictText: (txt: string) => void;
  setVerdictState: (state: "none" | "Pass" | "Flagged" | "Failed") => void;
  setActiveAudit: (audit: any) => void;
  setSelectedAuditId: (id: string | null) => void;
  setSavedPathMsg: (msg: string) => void;
  setAppStatus: (status: string) => void;
}

export const useFileUpload = ({
  setDoctorName,
  setDoctorSpecialization,
  setHospitalName,
  setDepartment,
  setTargetScore,
  setVerdictText,
  setVerdictState,
  setActiveAudit,
  setSelectedAuditId,
  setSavedPathMsg,
  setAppStatus,
}: FileUploadOptions) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const digestFileRecord = (file: File) => {
    if (!file) return;

    const permitted = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!permitted.includes(file.type)) {
      setAppStatus(`❌ Warning: Unsupported files uploaded. PDFs and Images are required.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64Data = reader.result as string;
      const sizeTag =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      setSelectedFile({
        name: file.name,
        size: sizeTag,
        type: file.type,
        data: b64Data,
      });

      // Reset all physician target setting fields to empty on file change
      setDoctorName("");
      setDoctorSpecialization("");
      setHospitalName("");
      setDepartment("");

      // Quick dynamic updates based on file-name descriptors
      const lowerFile = file.name.toLowerCase();
      if (
        lowerFile.includes("allison") ||
        lowerFile.includes("osteo") ||
        lowerFile.includes("ortho") ||
        lowerFile.includes("bone")
      ) {
        setDoctorName("Dr. Allison Vance");
        setDoctorSpecialization("Orthopedic Surgeon");
        setDepartment("Orthopedics");
      } else if (
        lowerFile.includes("marcus") ||
        lowerFile.includes("radio") ||
        lowerFile.includes("scan") ||
        lowerFile.includes("xray") ||
        lowerFile.includes("mri")
      ) {
        setDoctorName("Dr. Marcus Brody");
        setDoctorSpecialization("Radiological Imaging Director");
        setDepartment("Radiology");
      } else if (
        lowerFile.includes("robert") ||
        lowerFile.includes("er") ||
        lowerFile.includes("emergency") ||
        lowerFile.includes("triage")
      ) {
        setDoctorName("Dr. Robert Chen");
        setDoctorSpecialization("Emergency Medicine Lead");
        setDepartment("Emergency Medicine");
      } else if (
        lowerFile.includes("cardio") ||
        lowerFile.includes("heart") ||
        lowerFile.includes("ekg") ||
        lowerFile.includes("ecg") ||
        lowerFile.includes("troponin")
      ) {
        setDoctorName("Dr. Sarah Jenkins");
        setDoctorSpecialization("Cardiology Specialist");
        setDepartment("Cardiology");
      }

      // Refresh displays
      setTargetScore(0);
      setVerdictText("Ready for execution");
      setVerdictState("none");
      setActiveAudit(null);
      setSelectedAuditId(null);
      setSavedPathMsg("");

      setAppStatus(`Ingested clinical artifact: ${file.name} - ready for audit.`);
    };

    reader.onerror = () => {
      setAppStatus(`❌ Error processing and uploading this file.`);
    };

    reader.readAsDataURL(file);
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  const handleInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      digestFileRecord(e.target.files[0]);
    }
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeaveHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      digestFileRecord(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return {
    selectedFile,
    setSelectedFile,
    isDragging,
    fileInputRef,
    triggerPicker,
    handleInputUpload,
    onDragOverHandler,
    onDragLeaveHandler,
    onDropHandler,
    clearSelectedFile,
    digestFileRecord,
  };
};
