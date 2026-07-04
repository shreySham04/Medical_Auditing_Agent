import { useState } from "react";

export type DepartmentType = "Cardiology" | "Orthopedics" | "Radiology" | "Emergency Medicine" | "";

export const usePhysicianTarget = () => {
  const [doctorName, setDoctorName] = useState<string>("");
  const [doctorSpecialization, setDoctorSpecialization] = useState<string>("");
  const [hospitalName, setHospitalName] = useState<string>("");
  const [department, setDepartment] = useState<DepartmentType>("");

  return {
    doctorName,
    setDoctorName,
    doctorSpecialization,
    setDoctorSpecialization,
    hospitalName,
    setHospitalName,
    department,
    setDepartment,
  };
};
