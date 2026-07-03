import { useState } from "react";
import { auditService } from "../services/auditService";

export const useLookups = () => {
  // Doctor Lookup State
  const [doctorSearchText, setDoctorSearchText] = useState<string>("");
  const [doctorSearchResult, setDoctorSearchResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string>("");
  const [isDoctorLoading, setIsDoctorLoading] = useState<boolean>(false);

  // Hospital Lookup State
  const [hospitalSearchText, setHospitalSearchText] = useState<string>("");
  const [hospitalSearchResult, setHospitalSearchResult] = useState<any | null>(null);
  const [hospitalLookupError, setHospitalLookupError] = useState<string>("");
  const [isHospitalLoading, setIsHospitalLoading] = useState<boolean>(false);

  const lookupDoctor = async (department: string) => {
    if (!doctorSearchText.trim()) return;
    try {
      setIsDoctorLoading(true);
      setLookupError("");
      const result = await auditService.lookupDoctor(doctorSearchText, department);
      setDoctorSearchResult(result);
    } catch (e: any) {
      setLookupError(e.message || "Failed to search credentials");
      setDoctorSearchResult(null);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const lookupHospital = async () => {
    if (!hospitalSearchText.trim()) return;
    try {
      setIsHospitalLoading(true);
      setHospitalLookupError("");
      const result = await auditService.lookupHospital(hospitalSearchText);
      setHospitalSearchResult(result);
    } catch (e: any) {
      setHospitalLookupError(e.message || "Failed to query hospital analytics");
      setHospitalSearchResult(null);
    } finally {
      setIsHospitalLoading(false);
    }
  };

  const clearDoctorSearch = () => {
    setDoctorSearchText("");
    setDoctorSearchResult(null);
    setLookupError("");
  };

  const clearHospitalSearch = () => {
    setHospitalSearchText("");
    setHospitalSearchResult(null);
    setHospitalLookupError("");
  };

  return {
    doctorSearchText,
    setDoctorSearchText,
    doctorSearchResult,
    lookupError,
    isDoctorLoading,
    lookupDoctor,
    clearDoctorSearch,

    hospitalSearchText,
    setHospitalSearchText,
    hospitalSearchResult,
    hospitalLookupError,
    isHospitalLoading,
    lookupHospital,
    clearHospitalSearch,
  };
};
