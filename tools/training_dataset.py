import os
import json
import re
import random
from pathlib import Path

DATASET_FILE = Path(__file__).parent.parent / "data" / "training_samples.json"

def generate_10000_training_samples():
    """
    Generates 10,000 comprehensive, realistic forensic audit training reports
    across 25 medical specialties (400 samples per specialty).
    """
    specialties = [
        ("Cardiology", "CARD"),
        ("Orthopedics", "ORTHO"),
        ("Neurology", "NEURO"),
        ("Emergency Medicine", "EM"),
        ("Gastroenterology", "GI"),
        ("Pulmonology", "PULM"),
        ("Oncology", "ONC"),
        ("Pediatric Medicine", "PED"),
        ("Nephrology & Urology", "RENAL"),
        ("Endocrinology", "ENDO"),
        ("Dermatology", "DERM"),
        ("Obstetrics & Gynecology", "OBGYN"),
        ("Psychiatry & Behavioral Health", "PSYCH"),
        ("General & Vascular Surgery", "SURG"),
        ("Infectious Disease", "ID"),
        ("Rheumatology", "RHEUM"),
        ("Ophthalmology & ENT", "ENT"),
        ("Hematology & Radiology", "RAD"),
        ("ICU & Anesthesiology", "ICU"),
        ("Preventive & Occupational Health", "PREV"),
        ("Allergy & Immunology", "IMMUN"),
        ("Geriatric Medicine", "GERI"),
        ("Physical Medicine & Rehab", "REHAB"),
        ("Pathology & Genomic Medicine", "PATH"),
        ("Medical Toxicology", "TOX")
    ]

    doctor_pool = [
        "Dr. Angela Vance", "Dr. Tyler Chase", "Dr. Marcus Thorne", "Dr. Elena Rostova",
        "Dr. Julian Sterling", "Dr. Hannah Abbott", "Dr. Christopher Vance", "Dr. Maya Patel",
        "Dr. David Kim", "Dr. Sarah Jenkins", "Dr. Robert Chen", "Dr. Olivia Williams",
        "Dr. James Wilson", "Dr. Maria Garcia", "Dr. Alexander Wright", "Dr. Emily Zhang",
        "Dr. Michael Ross", "Dr. Samantha Reed", "Dr. Benjamin Carter", "Dr. Victoria Hughes",
        "Dr. Nathaniel Ford", "Dr. Sophia Martinez", "Dr. Jonathan Hayes", "Dr. Rachel Adams",
        "Dr. Gabriel Mendoza", "Dr. Charlotte Evans", "Dr. Daniel Brooks", "Dr. Isabella Scott"
    ]

    hospital_pool = [
        "Metro General Hospital", "County Heart & Surgical Institute", "St. Jude Medical Center",
        "Apex University Health System", "Valley Memorial Hospital", "Mercy General Medical Center",
        "Northwestern Memorial Clinic", "City Care Urgent Center", "Mount Sinai Specialty Hospital",
        "Johns Hopkins Regional Center", "Cedars-Sinai Medical Pavilion", "Mayo Clinic Regional Wing",
        "Cleveland Clinic Care Pavilion", "Providence Health Pavilion", "Bellevue Hospital Center"
    ]

    cpt_pairs = {
        "Cardiology": [("CPT 99291 (Critical Care 74m)", "CPT 99214"), ("CPT 93458 (Coronary Angio) + CPT 99205", "CPT 93458 + CPT 99203"), ("CPT 99205 (High MDM)", "CPT 99204")],
        "Orthopedics": [("CPT 27447 (Knee Arthroplasty) + Unbundled CPT 29881", "CPT 27447 Bundled"), ("CPT 99285 (High EM)", "CPT 99283"), ("CPT 20610 (Joint Inj) x4", "CPT 20610 x1")],
        "Emergency Medicine": [("CPT 99291 + CPT 99285 (Unbundled)", "CPT 99284"), ("CPT 99285 (Level 5 ER)", "CPT 99283"), ("CPT 99291 (30m documented vs 74m billed)", "CPT 99285")],
        "Neurology": [("CPT 95819 (EEG Monitoring) + CPT 99205", "CPT 95819 + CPT 99204"), ("CPT 99215 (High Complexity)", "CPT 99213")],
        "Gastroenterology": [("CPT 43239 (EGD Biopsy) + CPT 45378 (Colonoscopy) Unbundled", "CPT 43239 + CPT 45378 Bundled"), ("CPT 99205", "CPT 99204")],
        "Pulmonology": [("CPT 31622 (Bronchoscopy) + CPT 99291", "CPT 31622 + CPT 99214"), ("CPT 94010 (Spirometry) + Unbundled Evaluation", "CPT 94010")],
        "ICU & Anesthesiology": [("CPT 99291 (Critical Care) + CPT 99292 x3", "CPT 99291 x1"), ("CPT 00811 (Anesthesia EGD)", "CPT 00811 Standard")],
        "Oncology": [("CPT 96413 (Chemo Infusion 1hr) + CPT 99205", "CPT 96413 + CPT 99204"), ("CPT 99215 (Complex Oncology)", "CPT 99214")],
        "General & Vascular Surgery": [("CPT 33533 (CABG) + Unbundled Conduit Prep", "CPT 33533 Global"), ("CPT 49505 (Hernia Repair) + Unbundled Mesh Placement", "CPT 49505 Global")]
    }

    samples = []
    sample_counter = 1

    for spec_name, spec_code in specialties:
        # 400 samples per specialty = 10,000 total
        for idx in range(1, 401):
            sample_id = f"TS-{sample_counter:05d}"
            
            # Distribution: 40% Pass, 35% Flagged, 25% Failed
            mod = idx % 20
            if mod in [1, 4, 7, 9, 12, 15, 18]:
                verdict = "Flagged"
                score = 52 + (idx * 7) % 28  # 52-79
                risk = "Medium"
                upcoding = True
                dev = False
                violation_type = "Upcoding complexity & face-to-face duration overstatement"
            elif mod in [2, 5, 8, 11, 14]:
                verdict = "Failed"
                score = 18 + (idx * 5) % 32  # 18-49
                risk = "High" if score > 30 else "Critical"
                upcoding = True
                dev = True
                violation_type = "Severe upcoding, unbundling & clinical standard-of-care deviation"
            else:
                verdict = "Pass"
                score = 85 + (idx * 3) % 15  # 85-99
                risk = "Low"
                upcoding = False
                dev = False
                violation_type = "None. Verified compliant with clinical & financial guidelines."

            doc_name = doctor_pool[(sample_counter + idx) % len(doctor_pool)]
            hosp_name = hospital_pool[(sample_counter + idx) % len(hospital_pool)]
            patient_name = f"Patient_{spec_code}_{idx:04d}"

            # CPT selection
            cpt_list = cpt_pairs.get(spec_name, [("CPT 99205 (High MDM)", "CPT 99203"), ("CPT 99291 (Critical Care)", "CPT 99214"), ("CPT 99285 (Level 5 ER)", "CPT 99283")])
            pair = cpt_list[idx % len(cpt_list)]
            cpt_billed = pair[0] if upcoding else "Standard Compliant Modality CPT"
            cpt_recommended = pair[1] if upcoding else pair[0]

            billed_amount = 450 + (idx * 137) % 8500
            ancillary_amount = 150 + (idx * 43) % 1800

            clinical_narrative = (
                f"PATIENT CLINICAL RECORD & FORENSIC BILLING AUDIT [{sample_id}]\n"
                f"Facility: {hosp_name} | Specialty: {spec_name}\n"
                f"Attending Physician: {doc_name} | Patient: {patient_name}\n\n"
                f"CLINICAL PRESENTATION & EXAMINATION NOTES:\n"
                f"Patient presented to {hosp_name} with acute symptoms requiring {spec_name} evaluation (Case #{idx}).\n"
                f"Vitals on arrival: HR {65 + (idx*3)%60} bpm, BP {110 + (idx*7)%70}/{70 + (idx*4)%40} mmHg, SpO2 {91 + (idx%9)}%, Temp {98.2 + (idx%3)*0.4}°F.\n"
                f"Physician bedside time documented: {(12 if upcoding else 48)} minutes. Medical decision making complexity: {'High' if upcoding else 'Moderate'}.\n"
                f"Diagnostic studies & lab orders: Comprehensive Metabolic Panel, Specialty Biomarker Assay, Targeted Imaging Scan.\n\n"
                f"SUBMITTED FINANCIAL & CPT BILLING LEDGER:\n"
                f"- Primary Service: {cpt_billed} — Billed: ${billed_amount:.2f}\n"
                f"- Secondary Modality Fee: Ancillary Procedure Charge — Billed: ${ancillary_amount:.2f}\n"
                f"Status: Forensic Audit ground-truth certified under {spec_name} National Standards."
            )

            reasoning = (
                f"Ground-Truth Forensic Assessment for {sample_id} ({spec_name}):\n"
                f"1. Overall Compliance Rating: {score}/100 ({verdict}).\n"
                f"2. Audit Finding: {violation_type}.\n"
                f"3. Billed Code: {cpt_billed} vs Recommended Code: {cpt_recommended}.\n"
                f"4. Upcoding Flag: {upcoding} | Standard of Care Deviation: {dev}."
            )

            sample_obj = {
                "id": sample_id,
                "topic": spec_name,
                "topicCode": spec_code,
                "title": f"{spec_name} Forensic Audit #{idx}: {violation_type[:48]}",
                "patientName": patient_name,
                "doctorName": doc_name,
                "hospitalName": hosp_name,
                "recordText": clinical_narrative,
                "cptBilled": cpt_billed,
                "cptRecommended": cpt_recommended,
                "complianceScore": score,
                "verdict": verdict,
                "riskClassification": risk,
                "upcodingDetected": upcoding,
                "clinicalDeviation": dev,
                "primaryViolation": violation_type,
                "reasoning": reasoning,
                "keyFindings": [
                    {
                        "id": f"FND-01",
                        "type": "Billing Compliance",
                        "description": f"Billed {cpt_billed}" if upcoding else "CPT codes accurately reflect documented time & complexity",
                        "severity": "High" if upcoding else "Low"
                    },
                    {
                        "id": f"FND-02",
                        "type": "Clinical Care Audit",
                        "description": f"Standard of care evaluation for {spec_name}" if not dev else f"Clinical documentation gap / time overstatement in {spec_name}",
                        "severity": "Critical" if dev else "Low"
                    }
                ]
            }

            samples.append(sample_obj)
            sample_counter += 1

    return samples


def save_training_samples_to_disk(force_regenerate=False):
    """Saves the 10,000 samples to data/training_samples.json"""
    DATASET_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not force_regenerate and DATASET_FILE.exists():
        try:
            with open(DATASET_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
                if len(existing) >= 10000:
                    return existing
        except Exception:
            pass

    samples = generate_10000_training_samples()
    with open(DATASET_FILE, "w", encoding="utf-8") as f:
        json.dump(samples, f, ensure_ascii=False)
    print(f"Successfully generated and saved {len(samples)} training samples to {DATASET_FILE}")
    return samples


class TrainingDataset:
    _cached_samples = None
    _topic_index = {}
    _id_index = {}

    @classmethod
    def get_all_samples(cls):
        """Loads all 10,000 training samples from disk or generates them."""
        if cls._cached_samples is not None and len(cls._cached_samples) >= 10000:
            return cls._cached_samples

        cls._cached_samples = save_training_samples_to_disk()
        cls._build_indexes()
        return cls._cached_samples

    @classmethod
    def _build_indexes(cls):
        """Builds in-memory lookup indexes for ultra-fast querying."""
        cls._topic_index = {}
        cls._id_index = {}
        if not cls._cached_samples:
            return
        for s in cls._cached_samples:
            cls._id_index[s["id"].lower()] = s
            topic = s["topic"].lower()
            if topic not in cls._topic_index:
                cls._topic_index[topic] = []
            cls._topic_index[topic].append(s)

    @classmethod
    def get_topics(cls):
        """Returns list of unique specialty topics."""
        samples = cls.get_all_samples()
        topics = list(dict.fromkeys([s["topic"] for s in samples]))
        return sorted(topics)

    @classmethod
    def get_samples_by_topic(cls, topic_name):
        """Returns training samples for a specific specialty topic."""
        cls.get_all_samples()
        if not topic_name or topic_name == "All Topics":
            return cls._cached_samples
        return cls._topic_index.get(topic_name.lower(), [])

    @classmethod
    def get_sample_by_id(cls, sample_id):
        """Finds a single training sample by its ID in O(1) time."""
        cls.get_all_samples()
        return cls._id_index.get(str(sample_id).lower())

    @classmethod
    def get_samples_paginated(cls, page: int = 1, limit: int = 50, topic: str = None, verdict: str = None, search: str = None):
        """Paginated, filtered query engine for large 10,000 dataset views."""
        samples = cls.get_all_samples()
        
        filtered = samples
        if topic and topic != "All Topics":
            topic_lower = topic.lower()
            filtered = [s for s in filtered if s["topic"].lower() == topic_lower]

        if verdict and verdict != "All Verdicts":
            verdict_lower = verdict.lower()
            filtered = [s for s in filtered if s["verdict"].lower() == verdict_lower]

        if search and search.strip():
            query = search.strip().lower()
            filtered = [
                s for s in filtered
                if query in s["id"].lower()
                or query in s["title"].lower()
                or query in s["patientName"].lower()
                or query in s["doctorName"].lower()
                or query in s["cptBilled"].lower()
            ]

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_items = filtered[start_idx:end_idx]

        return {
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": max(1, (total_count + limit - 1) // limit),
            "samples": paginated_items
        }

    @classmethod
    def find_fewshot_exemplars(cls, record_text: str, limit: int = 3):
        """
        Finds the top matching training exemplars from 10,000 dataset for few-shot in-context learning.
        Uses fast indexed topic matching & CPT code scanning.
        """
        samples = cls.get_all_samples()
        text_lower = record_text.lower()

        # Quick pre-filter by topic matching
        matched_topic_samples = []
        for topic_key, topic_samples in cls._topic_index.items():
            if topic_key in text_lower:
                matched_topic_samples.extend(topic_samples[:100])

        candidates = matched_topic_samples if matched_topic_samples else samples[:500]

        scored = []
        for s in candidates:
            match_score = 0
            if s["topic"].lower() in text_lower:
                match_score += 15
            if s["topicCode"].lower() in text_lower:
                match_score += 10
            if "99291" in text_lower and "99291" in s["cptBilled"]:
                match_score += 8
            if "upcode" in text_lower and s["upcodingDetected"]:
                match_score += 5
            scored.append((match_score, s))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

# Ensure samples are created on module load
TrainingDataset.get_all_samples()
