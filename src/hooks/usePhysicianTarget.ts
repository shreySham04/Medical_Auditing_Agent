import { useState } from "react";

export type DepartmentType = "Cardiology" | "Orthopedics" | "Radiology" | "Emergency Medicine";

export const usePhysicianTarget = () => {
  const [doctorName, setDoctorName] = useState<string>("Dr. Sarah Jenkins");
  const [doctorSpecialization, setDoctorSpecialization] = useState<string>("Cardiologist");
  const [hospitalName, setHospitalName] = useState<string>("St. Jude General Hospital");
  const [department, setDepartment] = useState<DepartmentType>("Cardiology");

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
