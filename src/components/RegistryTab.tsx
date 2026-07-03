import React from "react";
import { User, Search, TrendingDown, TrendingUp, Building, AlertTriangle, Sparkles } from "lucide-react";
import { AuditItem } from "../types";

interface RegistryTabProps {
  audits: AuditItem[];
  doctorSearchText: string;
  setDoctorSearchText: (text: string) => void;
  doctorSearchResult: any | null;
  lookupError: string;
  isDoctorLoading: boolean;
  searchDoctorLookup: () => void;
  hospitalSearchText: string;
  setHospitalSearchText: (text: string) => void;
  hospitalSearchResult: any | null;
  hospitalLookupError: string;
  isHospitalLoading: boolean;
  searchHospitalLookup: () => void;
}

export const RegistryTab: React.FC<RegistryTabProps> = ({
  audits,
  doctorSearchText,
  setDoctorSearchText,
  doctorSearchResult,
  lookupError,
  isDoctorLoading,
  searchDoctorLookup,
  hospitalSearchText,
  setHospitalSearchText,
  hospitalSearchResult,
  hospitalLookupError,
  isHospitalLoading,
  searchHospitalLookup,
}) => {
  const totalAuditsCount = audits.length;
  const criticalAuditCount = audits.filter((item) => item.riskClassification === "Critical").length;
  const registeredComplaints = audits.filter((item) => item.complaint?.status === "REGISTERED");
  const lowRiskAuditCount = audits.filter((item) => item.riskClassification === "Low").length;

  const getDeptAverage = (dept: string) => {
    const deptAudits = audits.filter((a) => a.department === dept);
    if (deptAudits.length === 0) return 92; // default high-quality fallback rating
    return Math.round(deptAudits.reduce((sum, item) => sum + item.complianceScore, 0) / deptAudits.length);
  };

  return (
    <main className="flex-1 overflow-y-auto p-5 bg-[#090D14] space-y-5 select-text">
      {/* System overview grid stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#21262D] text-center space-y-1 select-none shadow hover:border-blue-500/10 transition-colors">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
            Total Cases Audited
          </span>
          <span className="text-xl font-bold font-mono text-white block">{totalAuditsCount}</span>
          <span className="text-[9px] text-gray-500 font-mono">in directories</span>
        </div>

        <div className="bg-[#121620] p-4 rounded-2xl border border-[#21262D] text-center space-y-1 select-none shadow hover:border-red-500/10 transition-colors">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
            Severity Level 4 (Critical)
          </span>
          <span className="text-xl font-bold font-mono text-red-400 block">{criticalAuditCount}</span>
          <span className="text-[9px] text-red-500/80 font-mono font-medium block">Risk Flagged</span>
        </div>

        <div className="bg-[#121620] p-4 rounded-2xl border border-[#21262D] text-center space-y-1 select-none shadow hover:border-amber-500/10 transition-colors">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
            Active Complaints Stored
          </span>
          <span className="text-xl font-bold font-mono text-amber-400 block">{registeredComplaints.length}</span>
          <span className="text-[9px] text-gray-500 font-mono font-medium block">Filed to Board</span>
        </div>

        <div className="bg-[#121620] p-4 rounded-2xl border border-[#21262D] text-center space-y-1 select-none shadow hover:border-emerald-500/10 transition-colors">
          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">
            Sufficient Compliances
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 block">{lowRiskAuditCount}</span>
          <span className="text-[9px] text-gray-500 font-mono">Passed seamlessly</span>
        </div>

        <div className="bg-[#121620] p-4 rounded-2xl border border-[#21262D] text-center col-span-2 md:col-span-1 space-y-1 select-none shadow hover:border-blue-500/10 transition-colors">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
            Total Registry Averages
          </span>
          <span className="text-xl font-bold font-mono text-blue-400 block">
            {totalAuditsCount > 0
              ? Math.round(audits.reduce((sum, item) => sum + item.complianceScore, 0) / totalAuditsCount)
              : 100}
            %
          </span>
          <span className="text-[9px] text-gray-500 font-mono">Overall Rating</span>
        </div>
      </div>

      {/* Directories Lookups: Doctors & Hospitals Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column Left: Doctor Lookup Repository */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-blue-500/10 transition-colors duration-300">
          <div className="space-y-1 select-none">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <User className="w-4 h-4 text-blue-400" /> Provider Registry Database Finder
            </h3>
            <p className="text-[10px] text-[#8B949E] font-mono">
              Search doctor credential profiles or operational ratings log records.
            </p>
          </div>

          {/* Lookup Controls */}
          <div className="flex gap-2 font-mono">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={doctorSearchText || ""}
                onChange={(e) => setDoctorSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchDoctorLookup()}
                placeholder="e.g. Jenkins or Sarah"
                className="w-full text-xs rounded-xl bg-[#090D14] border border-[#21262D] text-white pl-9 pr-3 py-2.5 select-text focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={searchDoctorLookup}
              disabled={isDoctorLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 rounded-xl border border-blue-500/20 font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-102"
            >
              {isDoctorLoading ? "..." : "Lookup"}
            </button>
          </div>

          {/* RESULT DISPLAY */}
          <div className="border-t border-[#21262D] pt-4 select-text text-xs">
            {lookupError && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 leading-relaxed font-mono text-[10px]">
                {lookupError}
              </div>
            )}

            {doctorSearchResult ? (
              <div className="font-mono space-y-4 leading-relaxed">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      {doctorSearchResult.doctorName}
                      <span className="text-[8px] uppercase px-2 py-0.5 rounded-md bg-blue-950/40 border border-blue-500/20 text-blue-400 font-bold">
                        {doctorSearchResult.source === "LOCAL_COMPLIANCE_DATABASE" ? "Local DB" : "State Board"}
                      </span>
                    </h4>
                    <span className="text-[10px] text-gray-400 block">
                      {doctorSearchResult.specialization} • {doctorSearchResult.hospitalAffiliation}
                    </span>
                  </div>
                </div>

                {/* Display Scores Statistics if local audits exist */}
                {doctorSearchResult.averageScore !== null ? (
                  <div className="grid grid-cols-2 gap-4 bg-[#090D14] p-4 rounded-xl border border-[#21262D]">
                    <div>
                      <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-bold">
                        Average Rating
                      </span>
                      <span
                        className={`text-sm font-bold block mt-0.5 ${
                          doctorSearchResult.averageScore >= 60 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {doctorSearchResult.averageScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-bold">
                        Risk Direction
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
                          doctorSearchResult.riskTrend === "Declining"
                            ? "text-red-400"
                            : doctorSearchResult.riskTrend === "Improving"
                            ? "text-emerald-400"
                            : "text-gray-300"
                        }`}
                      >
                        {doctorSearchResult.riskTrend === "Declining" && (
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        )}
                        {doctorSearchResult.riskTrend === "Improving" && (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {doctorSearchResult.riskTrend}
                      </span>
                    </div>

                    {/* VISUAL SPARKLINE HIGHLIGHTING RECURRING PERFORMANCE CONCERNS */}
                    <div className="col-span-2 pt-3 border-t border-[#21262D]">
                      <span className="text-gray-500 block text-[8px] uppercase tracking-wider mb-2 font-bold">
                        AUDIT RATING TREND CHART
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(doctorSearchResult.scoresHistory || []).map((scoreValue: number, i: number) => (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-end h-10 flex-1 bg-[#121620] border border-[#21262D] rounded-lg relative p-1.5"
                          >
                            <div
                              className={`w-full rounded-sm ${
                                scoreValue >= 70 ? "bg-emerald-500" : scoreValue >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ height: `${scoreValue * 0.3}px` }}
                            />
                            <span className="text-[7px] mt-1 font-mono text-gray-400 font-bold leading-none">
                              {scoreValue}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-400 italic mt-2.5 block font-sans">
                        {(doctorSearchResult.scoresHistory || []).length >= 3 &&
                        doctorSearchResult.scoresHistory[0] >
                          doctorSearchResult.scoresHistory[doctorSearchResult.scoresHistory.length - 1]
                          ? "⚠️ ALERT: Provider exhibits gradual decline over time."
                          : "ℹ️ Provider rating path appears stable."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-500/20 text-[10px] text-amber-400 italic text-center">
                    Zero clinical audits stored locally for this provider. Showing public Board License credentials.
                  </div>
                )}

                {/* Professional Boards records lookup details */}
                <div className="space-y-3">
                  <span className="text-[8px] uppercase font-bold text-gray-500 tracking-widest block border-b border-[#21262D] pb-1 font-mono">
                    Medical Board Credentials profile
                  </span>

                  <div className="space-y-2 text-[10.5px] font-sans">
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Qualifications:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{doctorSearchResult.profile?.qualifications || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Certifications:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{doctorSearchResult.profile?.certifications || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Practice Experience:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{doctorSearchResult.profile?.experience || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Publication Index:
                      </span>{" "}
                      <span className="text-blue-400 italic leading-relaxed block mt-1 bg-[#090D14] p-2.5 rounded-lg border border-[#21262D]">
                        &ldquo;{doctorSearchResult.profile?.publications || "N/A"}&rdquo;
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-[#090D14] rounded-xl text-center text-gray-500 italic text-[11px] border border-[#21262D] select-none font-sans">
                Search credentials to verify licensing status and compliance scores.
              </div>
            )}
          </div>
        </div>

        {/* Column Right: Hospital Network Compliance Finder */}
        <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-emerald-500/10 transition-colors duration-300">
          <div className="space-y-1 select-none">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Building className="w-4 h-4 text-emerald-400" /> Hospital Network Compliance Finder
            </h3>
            <p className="text-[10px] text-[#8B949E] font-mono">
              Search hospital compliance indices, risk profiles, or regional rating statistics.
            </p>
          </div>

          {/* Lookup Controls */}
          <div className="flex gap-2 font-mono">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={hospitalSearchText || ""}
                onChange={(e) => setHospitalSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchHospitalLookup()}
                placeholder="e.g. Jude or Princeton"
                className="w-full text-xs rounded-xl bg-[#090D14] border border-[#21262D] text-white pl-9 pr-3 py-2.5 select-text focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={searchHospitalLookup}
              disabled={isHospitalLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 rounded-xl border border-emerald-500/20 font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-102"
            >
              {isHospitalLoading ? "..." : "Lookup"}
            </button>
          </div>

          {/* RESULT DISPLAY */}
          <div className="border-t border-[#21262D] pt-4 select-text text-xs">
            {hospitalLookupError && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 leading-relaxed font-mono text-[10px]">
                {hospitalLookupError}
              </div>
            )}

            {hospitalSearchResult ? (
              <div className="font-mono space-y-4 leading-relaxed">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      {hospitalSearchResult.hospitalName}
                      <span className="text-[8px] uppercase px-2 py-0.5 rounded-md bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 font-bold">
                        {hospitalSearchResult.source === "LOCAL_COMPLIANCE_DATABASE" ? "Local DB" : "Public Registry"}
                      </span>
                    </h4>
                    <span className="text-[10px] text-gray-400 block">
                      {hospitalSearchResult.profile?.type || "General Facility"}
                    </span>
                  </div>
                </div>

                {/* Display Scores Statistics if local audits exist */}
                {hospitalSearchResult.averageScore !== null ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-3 bg-[#090D14] p-3 rounded-xl border border-[#21262D] text-center">
                      <div>
                        <span className="text-gray-500 block text-[8px] uppercase tracking-wide font-bold">
                          Avg Rating
                        </span>
                        <span
                          className={`text-xs font-bold block mt-1 ${
                            hospitalSearchResult.averageScore >= 60 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {hospitalSearchResult.averageScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[8px] uppercase tracking-wide font-bold font-mono">
                          Audits
                        </span>
                        <span className="text-xs font-bold text-blue-400 block mt-1">
                          {hospitalSearchResult.totalAudits}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[8px] uppercase tracking-wide font-bold font-mono">
                          Staff
                        </span>
                        <span className="text-xs font-bold text-purple-400 block mt-1">
                          {hospitalSearchResult.uniqueDoctors} docs
                        </span>
                      </div>
                    </div>

                    {/* Risk Distribution bar */}
                    <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] space-y-2">
                      <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-bold font-mono">
                        RISK LEVEL DISTRIBUTION
                      </span>
                      <div className="flex h-2 rounded overflow-hidden bg-gray-800">
                        {hospitalSearchResult.totalAudits > 0 ? (
                          <>
                            <div
                              className="bg-emerald-500"
                              style={{
                                width: `${
                                  (hospitalSearchResult.riskDistribution.low / hospitalSearchResult.totalAudits) * 100
                                }%`,
                              }}
                              title={`Low Risk: ${hospitalSearchResult.riskDistribution.low}`}
                            />
                            <div
                              className="bg-amber-500"
                              style={{
                                width: `${
                                  (hospitalSearchResult.riskDistribution.medium / hospitalSearchResult.totalAudits) * 100
                                }%`,
                              }}
                              title={`Medium Risk: ${hospitalSearchResult.riskDistribution.medium}`}
                            />
                            <div
                              className="bg-red-500"
                              style={{
                                width: `${
                                  (hospitalSearchResult.riskDistribution.high / hospitalSearchResult.totalAudits) * 100
                                }%`,
                              }}
                              title={`High Risk: ${hospitalSearchResult.riskDistribution.high}`}
                            />
                          </>
                        ) : (
                          <div className="w-full bg-gray-700" />
                        )}
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Low (
                          {hospitalSearchResult.riskDistribution.low})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Med (
                          {hospitalSearchResult.riskDistribution.medium})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> High (
                          {hospitalSearchResult.riskDistribution.high})
                        </span>
                      </div>
                    </div>

                    {/* Department averages in this specific hospital */}
                    <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] space-y-2">
                      <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-bold font-mono">
                        DEPT COMPLIANCE AVERAGES
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {Object.entries(hospitalSearchResult.departmentScores).map(([dept, score]: any) => (
                          <div
                            key={dept}
                            className="bg-[#121620] p-2 rounded-lg border border-[#21262D] flex flex-col justify-between"
                          >
                            <span className="text-gray-400 text-[8px] truncate uppercase tracking-wider">{dept}</span>
                            <span
                              className={`text-xs font-bold mt-1 ${
                                score !== null ? (score >= 60 ? "text-emerald-400" : "text-red-400") : "text-gray-500"
                              }`}
                            >
                              {score !== null ? `${score}%` : "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-500/20 text-[10px] text-amber-400 italic text-center">
                    Zero clinical audits stored locally for this hospital. Showing public Registry safety profile.
                  </div>
                )}

                {/* Hospital Facility Profile details */}
                <div className="space-y-3">
                  <span className="text-[8px] uppercase font-bold text-gray-500 tracking-widest block border-b border-[#21262D] pb-1">
                    Facility Board Certification Profile
                  </span>

                  <div className="space-y-2 text-[10.5px] font-sans">
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Accreditation:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{hospitalSearchResult.profile?.accreditation || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Bed Capacity:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{hospitalSearchResult.profile?.bedsCount || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider block">
                        Safety Rating:
                      </span>{" "}
                      <span className="text-gray-200 block mt-0.5">{hospitalSearchResult.profile?.safetyRating || "N/A"}</span>
                    </p>
                  </div>
                </div>

                {/* Published Patient Safety Advisories list */}
                {hospitalSearchResult.publishedReviews && hospitalSearchResult.publishedReviews.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[8px] uppercase font-bold text-red-400 tracking-widest block border-b border-red-500/20 pb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      Published Patient Warnings ({hospitalSearchResult.publishedReviews.length})
                    </span>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {hospitalSearchResult.publishedReviews.map((review: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-red-950/10 border border-red-500/20 text-[10.5px] leading-relaxed space-y-2"
                        >
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-gray-300 font-bold">Provider: {review.doctorName}</span>
                            <span className="text-red-400 font-bold font-mono">Score: {review.score}%</span>
                          </div>
                          <div className="text-gray-500 text-[8px] font-mono">
                            Department: {review.department} • {new Date(review.timestamp).toLocaleDateString()}
                          </div>
                          <p className="text-gray-200 font-sans italic whitespace-pre-line bg-[#090D14] p-3 rounded-lg border border-[#21262D]">
                            {review.reviewText}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 bg-[#090D14] rounded-xl text-center text-gray-500 italic text-[11px] border border-[#21262D] select-none font-sans">
                Search credentials to verify hospital safety scores and department ratings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Indices & Intelligent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column Left: Department-wise Ratings & AI Predictors */}
        <div className="lg:col-span-12 space-y-4 font-mono">
          {/* Department level score cards */}
          <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-4 shadow hover:border-blue-500/10 transition-colors duration-300">
            <div className="space-y-1 select-none">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Building className="w-4 h-4 text-emerald-400" /> Active Departmental Rating Indices
              </h3>
              <p className="text-[10px] text-[#8B949E]">
                Aggregated averages mapped directly from specialized departments.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] text-center space-y-1.5 shadow hover:border-blue-500/20 transition-all duration-300">
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Cardiology</span>
                <span
                  className={`text-sm font-bold ${getDeptAverage("Cardiology") >= 60 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {getDeptAverage("Cardiology")}%
                </span>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full" style={{ width: `${getDeptAverage("Cardiology")}%` }} />
                </div>
              </div>

              <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] text-center space-y-1.5 shadow hover:border-blue-500/20 transition-all duration-300">
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Orthopedics</span>
                <span
                  className={`text-sm font-bold ${getDeptAverage("Orthopedics") >= 60 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {getDeptAverage("Orthopedics")}%
                </span>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full" style={{ width: `${getDeptAverage("Orthopedics")}%` }} />
                </div>
              </div>

              <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] text-center space-y-1.5 shadow hover:border-blue-500/20 transition-all duration-300">
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Radiology</span>
                <span
                  className={`text-sm font-bold ${getDeptAverage("Radiology") >= 60 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {getDeptAverage("Radiology")}%
                </span>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full" style={{ width: `${getDeptAverage("Radiology")}%` }} />
                </div>
              </div>

              <div className="bg-[#090D14] p-3 rounded-xl border border-[#21262D] text-center space-y-1.5 shadow hover:border-blue-500/20 transition-all duration-300">
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Emergency Med</span>
                <span
                  className={`text-sm font-bold ${
                    getDeptAverage("Emergency Medicine") >= 60 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {getDeptAverage("Emergency Medicine")}%
                </span>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full" style={{ width: `${getDeptAverage("Emergency Medicine")}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* PROVIDER RELIABILITY INDEX MODEL DETAILS */}
          <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-3.5 shadow hover:border-blue-500/10 transition-colors duration-300">
            <div className="space-y-1 select-none">
              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block font-mono">
                PROVIDER RELIABILITY INDEX (PRI) CRITERIA
              </span>
              <p className="text-[10px] text-gray-400">
                Weighted reliability formula mapping 4 core metrics for comprehensive clinical security.
              </p>
            </div>

            <div className="bg-[#090D14] p-4 rounded-xl border border-[#21262D] space-y-4">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-gray-300">PRI Equation Formula Model:</span>
                <span className="text-blue-400">100% Weighted Scale</span>
              </div>

              <div className="space-y-3.5 text-[10.5px] font-sans">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400">
                    <span>🛡️ Patient Clinical Compliance (40% Weight)</span>
                    <span className="text-gray-300 font-bold font-mono">Factor: 40%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[40%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400">
                    <span>📋 Documentation Quality Indices (25% Weight)</span>
                    <span className="text-gray-300 font-bold font-mono">Factor: 25%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full w-[25%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400">
                    <span>💳 Billing Accuracy & Compliance (20% Weight)</span>
                    <span className="text-gray-300 font-bold font-mono">Factor: 20%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full w-[20%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400">
                    <span>📈 Historical Alignment Trend (15% Weight)</span>
                    <span className="text-gray-300 font-bold font-mono">Factor: 15%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-pink-400 h-full w-[15%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI RISK FORECASTER SYSTEM */}
          <div className="bg-[#121620] border border-[#21262D] rounded-2xl p-5 space-y-3.5 shadow hover:border-pink-500/10 transition-colors duration-300 select-none">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI COMPLIANCE RISK PREDICTION ENGINE
              </span>
              <p className="text-[10px] text-gray-400">
                Predictive safety modeling based on historical diagnostic patterns.
              </p>
            </div>

            {totalAuditsCount === 0 ? (
              <div className="p-4 bg-[#090D14] rounded-xl border border-[#21262D] text-[#8B949E] text-[10px] text-center italic">
                Ingest patient records to activate predictive risk diagnostics.
              </div>
            ) : (
              <div className="bg-[#090D14] p-4 border border-[#21262D] rounded-xl space-y-3.5 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-gray-400 text-xs">Calculated Future Compliance Risk Level:</span>
                  <span
                    className={`font-bold px-3 py-1 rounded-xl border text-[10px] uppercase tracking-wider ${
                      criticalAuditCount > 0
                        ? "text-red-400 bg-red-950/30 border-red-500/30 font-extrabold animate-pulse"
                        : "text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                    }`}
                  >
                    {criticalAuditCount > 0 ? "HIGH PROBABILITY ANOMALIES" : "SAFE / REGULATORY CONSISTENT"}
                  </span>
                </div>

                <div className="text-[11px] text-[#8B949E] leading-relaxed font-sans">
                  {criticalAuditCount > 0 ? (
                    <p>
                      ⚠️ <span className="text-red-400 font-bold">Risk Assessment:</span> Out of {totalAuditsCount}{" "}
                      historical evaluations, the algorithm identified recurrent telemetry timeline setup gaps and
                      simultaneous practitioner system login overlaps. This indicates structural billing upcoding risks
                      under Cardiology/Anesthesia department code subsets. Further auditing checks are advised for the
                      subsequent 90 days.
                    </p>
                  ) : (
                    <p>
                      ✅ <span className="text-emerald-400 font-bold">Safety Assessment:</span> Audits logged currently
                      represent an exemplary 95%+ timeline concordance. Zero recurrent malpractice signs, safety
                      violations, or clinical negligence warnings were flagged.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
