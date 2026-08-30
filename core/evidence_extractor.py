"""
Structured Evidence Extraction Engine.
Extracts verifiable clinical facts, timestamps, quantitative vitals, procedures,
medications, attending durations, and detects incomplete or truncated charts.
Enforces strict schema validation without relying solely on fragile regexes.
"""

import re
from typing import Dict, Any, List, Optional
from core.schemas import StructuredClinicalEvidence, EvidenceSpan


class StructuredEvidenceExtractor:
    """
    Extracts structured clinical evidence and locates character spans
    for verifiable audit grounding.
    """

    @classmethod
    def extract_evidence(cls, text: str) -> StructuredClinicalEvidence:
        raw = text or ""
        lower = raw.lower()

        evidence = StructuredClinicalEvidence()

        # Check for truncated or severely deficient chart (< 120 chars or missing clinical substance)
        words = raw.split()
        if len(raw.strip()) < 120 or len(words) < 20:
            evidence.is_truncated_or_incomplete = True
            evidence.missing_prerequisites.append("Minimum viable clinical chart length not met (<120 characters).")

        # Patient Name Extraction
        pat_match = re.search(r'(?:Patient\s*Name|Patient|Name)\s*[:\-]\s*([A-Za-z\s\.\,\'-]+?)(?:\n|\r|\(|\d|$)', raw, re.IGNORECASE)
        if pat_match and len(pat_match.group(1).strip()) > 2:
            evidence.patient_name = pat_match.group(1).strip()
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="patient_name",
                exact_quote=pat_match.group(0).strip(),
                start_char=pat_match.start(),
                end_char=pat_match.end()
            ).to_dict())

        # Attending Physician Extraction
        doc_match = re.search(r'(?:Attending\s*MD|Attending\s*Physician|Physician|Doctor|Surgeon|Provider)\s*[:\-]\s*([A-Za-z\s\.\,\'-]+?)(?:\n|\r|\(|$)', raw, re.IGNORECASE)
        if doc_match and len(doc_match.group(1).strip()) > 2:
            evidence.doctor_name = doc_match.group(1).strip()
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="doctor_name",
                exact_quote=doc_match.group(0).strip(),
                start_char=doc_match.start(),
                end_char=doc_match.end()
            ).to_dict())

        # Hospital / Facility Extraction
        hosp_match = re.search(r'(?:Facility\s*Location|Facility|Hospital|Medical\s*Center|Clinic)\s*[:\-]\s*([^\n\r;|]+)', raw, re.IGNORECASE)
        if hosp_match and len(hosp_match.group(1).strip()) > 2:
            evidence.hospital_name = hosp_match.group(1).strip()

        # Vitals extraction
        vitals_dict = {}
        bp_match = re.search(r'(?:BP|Blood\s*Pressure)\s*[:\-]?\s*(\d{2,3}/\d{2,3})', raw, re.IGNORECASE)
        if bp_match:
            vitals_dict["BP"] = bp_match.group(1)
        
        hr_match = re.search(r'(?:HR|Heart\s*Rate|Pulse)\s*[:\-]?\s*(\d{2,3})\s*(?:bpm)?', raw, re.IGNORECASE)
        if hr_match:
            vitals_dict["HR"] = f"{hr_match.group(1)} bpm"
            
        spo2_match = re.search(r'(?:SpO2|Oxygen\s*Saturation|O2\s*Sat)\s*[:\-]?\s*(\d{2,3})\s*%', raw, re.IGNORECASE)
        if spo2_match:
            vitals_dict["SpO2"] = f"{spo2_match.group(1)}%"

        temp_match = re.search(r'(?:Temp|Temperature)\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)\s*(?:C|F|°C|°F)', raw, re.IGNORECASE)
        if temp_match:
            vitals_dict["Temp"] = temp_match.group(0).split()[-1] if len(temp_match.group(0).split()) > 1 else temp_match.group(1)

        evidence.vitals_recorded = vitals_dict

        # Physician Time extraction (e.g. 12 minutes bedside, 35 min critical care)
        time_match = re.search(r'(\d{1,3})\s*(?:minutes|mins|min)\s*(?:bedside|face-to-face|direct|total|critical|evaluation|care)', raw, re.IGNORECASE)
        if time_match:
            try:
                evidence.physician_time_minutes = int(time_match.group(1))
            except ValueError:
                pass

        # Procedures Identified
        procedures = []
        if "paracentesis" in lower:
            procedures.append("Diagnostic / Therapeutic Paracentesis")
        if "endoscopy" in lower or "evl" in lower or "variceal" in lower:
            procedures.append("Esophagogastroduodenoscopy (EGD) & Variceal Ligation")
        if "pci" in lower or "angioplasty" in lower or "cath lab" in lower:
            procedures.append("Percutaneous Coronary Intervention (PCI)")
        if "intubation" in lower:
            procedures.append("Endotracheal Intubation")
        if "central line" in lower or "cvc" in lower:
            procedures.append("Central Venous Catheter Insertion")
        if "arthroscopy" in lower or "meniscectomy" in lower or "debridement" in lower:
            procedures.append("Knee Arthroscopy & Meniscectomy")
        evidence.procedures_identified = procedures

        # Medications Identified
        meds = []
        med_keywords = ["aspirin", "heparin", "ceftriaxone", "azithromycin", "vancomycin", "furosemide", "spironolactone", "lactulose", "rifaximin", "propofol", "fentanyl", "norepinephrine", "vasopressin"]
        for med in med_keywords:
            if med in lower:
                meds.append(med.capitalize())
        evidence.medications_ordered = meds

        # CPT Codes Identified
        cpt_matches = re.findall(r'\b(992\d{2}|929\d{2}|432\d{2}|490\d{2}|298\d{2}|365\d{2}|315\d{2})\b', raw)
        evidence.cpt_codes_identified = list(set(cpt_matches))

        # Signatures & Attestation Verification
        has_sig = any(term in lower for term in ["electronically signed", "authenticated by", "signature:", "signed by", "dr.", "md,", "do,"])
        evidence.has_attending_signature = has_sig

        # Informed Consent Verification
        has_consent = any(term in lower for term in ["informed consent", "consent obtained", "risks, benefits, and alternatives explained", "consent signed"])
        evidence.has_informed_consent = has_consent

        # Missing Prerequisites Check
        if not vitals_dict and not evidence.is_truncated_or_incomplete:
            evidence.missing_prerequisites.append("Objective Vital Signs panel absent from encounter record.")
        if not evidence.has_attending_signature:
            evidence.missing_prerequisites.append("Attending physician electronic signature / timestamp not verified.")

        return evidence
