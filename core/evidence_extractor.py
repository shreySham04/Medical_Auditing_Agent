"""
Structured Evidence Extraction Engine.
Extracts verifiable clinical facts, timestamps, quantitative vitals, procedures,
medications, attending durations, assertion statuses (performed, omitted, contraindicated),
and detects incomplete, truncated, or contradictory charts.
Enforces strict schema validation with character-span provenance.
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from core.schemas import StructuredClinicalEvidence, EvidenceSpan, ClinicalAssertion, NormalizedClinicalEvent


class StructuredEvidenceExtractor:
    """
    Extracts structured clinical evidence and locates character spans
    for verifiable audit grounding, asserting status and clinical exceptions.
    """

    @classmethod
    def _find_span(cls, text: str, substring: str) -> Optional[EvidenceSpan]:
        """Helper to find exact character coordinates of a substring in text."""
        if not substring or not text:
            return None
        idx = text.lower().find(substring.lower())
        if idx != -1:
            end = idx + len(substring)
            return EvidenceSpan(
                source_field="clinical_record",
                exact_quote=text[idx:end],
                start_char=idx,
                end_char=end,
                confidence=1.0
            )
        return None

    @classmethod
    def extract_evidence(cls, text: str) -> StructuredClinicalEvidence:
        raw = text or ""
        lower = raw.lower()

        evidence = StructuredClinicalEvidence()

        # 1. Minimum Viable Chart Check
        words = raw.split()
        if len(raw.strip()) < 120 or len(words) < 20:
            evidence.is_truncated_or_incomplete = True
            evidence.missing_prerequisites.append(
                "Minimum viable clinical chart length not met (<120 characters / <20 tokens)."
            )

        # 2. Patient Demographics & Facility
        pat_match = re.search(
            r'(?:Patient\s*Name|Patient|Name)\s*[:\-]\s*([A-Za-z\s\.\,\'-]+?)(?:\n|\r|\(|\d|$)',
            raw, re.IGNORECASE
        )
        if pat_match and len(pat_match.group(1).strip()) > 2:
            evidence.patient_name = pat_match.group(1).strip()
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="patient_name",
                exact_quote=pat_match.group(0).strip(),
                start_char=pat_match.start(),
                end_char=pat_match.end()
            ).to_dict())

        doc_match = re.search(
            r'(?:Attending\s*MD|Attending\s*Physician|Physician|Doctor|Surgeon|Provider)\s*[:\-]\s*([A-Za-z\s\.\,\'-]+?)(?:\n|\r|\(|$)',
            raw, re.IGNORECASE
        )
        if doc_match and len(doc_match.group(1).strip()) > 2:
            evidence.doctor_name = doc_match.group(1).strip()
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="doctor_name",
                exact_quote=doc_match.group(0).strip(),
                start_char=doc_match.start(),
                end_char=doc_match.end()
            ).to_dict())

        hosp_match = re.search(
            r'(?:Facility\s*Location|Facility|Hospital|Medical\s*Center|Clinic)\s*[:\-]\s*([^\n\r;|]+)',
            raw, re.IGNORECASE
        )
        if hosp_match and len(hosp_match.group(1).strip()) > 2:
            evidence.hospital_name = hosp_match.group(1).strip()

        # 3. Objective Vitals Panel
        vitals_dict = {}
        bp_match = re.search(r'(?:BP|Blood\s*Pressure)\s*[:\-]?\s*(\d{2,3}/\d{2,3})', raw, re.IGNORECASE)
        if bp_match:
            vitals_dict["BP"] = bp_match.group(1)
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="vitals.BP", exact_quote=bp_match.group(0),
                start_char=bp_match.start(), end_char=bp_match.end()
            ).to_dict())

        hr_match = re.search(r'(?:HR|Heart\s*Rate|Pulse)\s*[:\-]?\s*(\d{2,3})\s*(?:bpm)?', raw, re.IGNORECASE)
        if hr_match:
            vitals_dict["HR"] = f"{hr_match.group(1)} bpm"
            evidence.extracted_spans.append(EvidenceSpan(
                source_field="vitals.HR", exact_quote=hr_match.group(0),
                start_char=hr_match.start(), end_char=hr_match.end()
            ).to_dict())

        spo2_match = re.search(r'(?:SpO2|Oxygen\s*Saturation|O2\s*Sat)\s*[:\-]?\s*(\d{2,3})\s*%', raw, re.IGNORECASE)
        if spo2_match:
            vitals_dict["SpO2"] = f"{spo2_match.group(1)}%"

        temp_match = re.search(r'(?:Temp|Temperature)\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)\s*(?:C|F|°C|°F)', raw, re.IGNORECASE)
        if temp_match:
            vitals_dict["Temp"] = temp_match.group(0).split()[-1] if len(temp_match.group(0).split()) > 1 else temp_match.group(1)

        evidence.vitals_recorded = vitals_dict

        # 4. Physician Bedside Duration
        time_match = re.search(
            r'(\d{1,3})\s*(?:minutes|mins|min)\s*(?:bedside|face-to-face|direct|total|critical|evaluation|care)',
            raw, re.IGNORECASE
        )
        if time_match:
            try:
                evidence.physician_time_minutes = int(time_match.group(1))
                evidence.extracted_spans.append(EvidenceSpan(
                    source_field="physician_time", exact_quote=time_match.group(0),
                    start_char=time_match.start(), end_char=time_match.end()
                ).to_dict())
            except ValueError:
                pass

        # 5. Concept Assertions with Status, Temporality, Normalized Events, and Exceptions
        assertions: List[ClinicalAssertion] = []
        normalized_events: List[NormalizedClinicalEvent] = []
        exceptions: List[str] = []

        # (a) Blood Cultures: Normalized Clinical Event & Assertion
        # Detect uncollected / pending orders (CRITICAL BUG FIX: "ordered but not yet collected" is NOT performed)
        bc_pending = any(p in lower for p in [
            "ordered but have not yet been collected", "ordered but not yet collected",
            "pending collection", "pending draw", "bcx ordered - draw pending",
            "cultures pending order not collected", "not yet drawn", "not yet collected",
            "not yet obtained", "awaiting collection", "order placed, phlebotomy pending",
            "bcx pnd order not cllctd", "awaiting blood draw", "pending blood cultures",
            "blood cultures pending", "order placed for bcx, pending"
        ])
        bc_negation = bc_pending or any(phrase in lower for phrase in [
            "cultures were not drawn", "without prior blood culture", "blood cultures omitted",
            "no blood culture", "no blood cultures", "omitted pre-antibiotic", "no bcx",
            "blood cultures not obtained", "cultures not sent", "abx given without cultures",
            "antibiotic without culture", "blood cultures were not obtained", "no blood culture drawn"
        ])
        bc_contraindicated = any(phrase in lower for phrase in [
            "difficult vascular access", "antibiotic delayed risk outweighed blood draw",
            "stat abx prioritized over line placement", "crash access difficulty",
            "line blown", "vascular access blown", "veins collapsed",
            "emergent risk prioritization", "unable to obtain peripheral access, empiric abx started",
            "stat antibiotics due to severe septic crash", "critical access failure"
        ])
        bc_performed = not bc_negation and not bc_pending and (
            any(p in lower for p in [
                "blood cultures drawn", "blood culture drawn", "cultures drawn",
                "blood cultures collected", "blood culture collected", "bcx obtained",
                "blood cultures obtained", "blood culture bottles drawn", "cultures sent to micro",
                "2 sets of blood cultures", "two sets of blood cultures", "blood cultures x2",
                "blood cultures were drawn", "peripheral blood cultures collected"
            ]) or (("blood culture" in lower or "bcx" in lower) and not bc_negation and not bc_contraindicated)
        )

        bc_span = None
        for cand in [
            "blood cultures were ordered but have not yet been collected",
            "cultures were not drawn", "without prior blood culture", "blood cultures drawn",
            "blood cultures collected", "blood culture", "bcx"
        ]:
            sp = cls._find_span(raw, cand)
            if sp:
                bc_span = sp
                break

        if bc_contraindicated:
            assertions.append(ClinicalAssertion(
                concept="blood_cultures",
                assertion_status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                evidence_span=bc_span,
                exception_notes="Clinician documented emergent risk prioritization or severe vascular access difficulty."
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="blood_cultures",
                status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                exception_detected=True,
                source_span=bc_span,
                clinical_note="Clinical exception: severe vascular access failure / emergent stabilization."
            ))
            exceptions.append("Emergency vascular access difficulty documented for blood culture omission.")
        elif bc_performed:
            assertions.append(ClinicalAssertion(
                concept="blood_cultures",
                assertion_status="PERFORMED",
                certainty="DOCUMENTED",
                evidence_span=bc_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="blood_cultures",
                status="PERFORMED",
                certainty="DOCUMENTED",
                source_span=bc_span,
                clinical_note="Blood cultures collected prior to antimicrobial therapy."
            ))
        elif bc_pending:
            assertions.append(ClinicalAssertion(
                concept="blood_cultures",
                assertion_status="ORDERED_PENDING",
                certainty="DOCUMENTED",
                evidence_span=bc_span,
                exception_notes="Blood cultures were ordered but uncollected prior to antibiotic initiation."
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="blood_cultures",
                status="ORDERED_PENDING",
                certainty="DOCUMENTED",
                pending_detected=True,
                source_span=bc_span,
                clinical_note="Order pending collection; specimens not drawn prior to antibiotic delivery."
            ))
        elif bc_negation:
            assertions.append(ClinicalAssertion(
                concept="blood_cultures",
                assertion_status="ORDERED_NOT_PERFORMED",
                certainty="NEGATED",
                evidence_span=bc_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="blood_cultures",
                status="NOT_PERFORMED",
                certainty="NEGATED",
                negation_detected=True,
                source_span=bc_span,
                clinical_note="Blood cultures documented as omitted / not drawn."
            ))
        else:
            assertions.append(ClinicalAssertion(
                concept="blood_cultures",
                assertion_status="NOT_DOCUMENTED",
                certainty="DOCUMENTED"
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="blood_cultures",
                status="NOT_DOCUMENTED",
                certainty="DOCUMENTED",
                clinical_note="No documentation of blood culture orders or collection in chart."
            ))

        # (b) Chest Radiograph & Lung Imaging: Normalized Event & Assertion
        cxr_negation = any(phrase in lower for phrase in [
            "no chest x-ray", "no imaging available", "no imaging in chart", "no imaging was performed",
            "omitted chest x-ray", "radiograph omitted", "cxr not done", "no radiographic documentation",
            "no chest radiograph", "imaging deferred", "without chest imaging"
        ])
        cxr_exception = any(phrase in lower for phrase in [
            "pregnancy - radiation shielding", "bedside ultrasound lung consolidation confirmed",
            "bedside us revealed", "lung ultrasound confirmed", "us lung consolidation",
            "emergent intubation prevented immediate x-ray", "radiation risk in pregnancy"
        ])
        cxr_performed = not cxr_negation and any(phrase in lower for phrase in [
            "chest x-ray", "cxr", "chest radiograph", "ct chest", "infiltrate confirmed",
            "consolidation on x-ray", "lobar infiltrate", "imaging confirmed infiltrate"
        ])

        cxr_span = None
        for cand in [
            "no imaging available in chart", "no chest x-ray", "no chest radiograph",
            "bedside ultrasound lung consolidation confirmed", "chest radiograph", "chest x-ray", "cxr"
        ]:
            sp = cls._find_span(raw, cand)
            if sp:
                cxr_span = sp
                break

        if cxr_exception:
            assertions.append(ClinicalAssertion(
                concept="chest_radiograph",
                assertion_status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                evidence_span=cxr_span,
                exception_notes="Valid clinical exception or diagnostic lung ultrasound modality documented."
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="chest_imaging",
                status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                exception_detected=True,
                source_span=cxr_span,
                clinical_note="Diagnostic lung ultrasound or pregnancy radiation exception documented."
            ))
            exceptions.append("Diagnostic imaging alternate / exception documented for respiratory presentation.")
        elif cxr_performed:
            assertions.append(ClinicalAssertion(
                concept="chest_radiograph",
                assertion_status="PERFORMED",
                certainty="DOCUMENTED",
                evidence_span=cxr_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="chest_imaging",
                status="PERFORMED",
                certainty="DOCUMENTED",
                source_span=cxr_span,
                clinical_note="Confirmatory parenchymal pulmonary imaging verified."
            ))
        elif cxr_negation:
            assertions.append(ClinicalAssertion(
                concept="chest_radiograph",
                assertion_status="ORDERED_NOT_PERFORMED",
                certainty="NEGATED",
                evidence_span=cxr_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="chest_imaging",
                status="NOT_PERFORMED",
                certainty="NEGATED",
                negation_detected=True,
                source_span=cxr_span,
                clinical_note="Parenchymal chest imaging documented as absent / omitted."
            ))
        else:
            assertions.append(ClinicalAssertion(
                concept="chest_radiograph",
                assertion_status="NOT_DOCUMENTED",
                certainty="DOCUMENTED"
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="chest_imaging",
                status="NOT_DOCUMENTED",
                certainty="DOCUMENTED",
                clinical_note="No thoracic diagnostic imaging documented."
            ))

        # (c) Diagnostic Paracentesis Assertion (Cirrhosis Protocol)
        para_performed = any(p in lower for p in ["paracentesis performed", "diagnostic paracentesis completed", "fluid sent for cell count", "tap obtained"])
        para_negation = any(p in lower for p in ["paracentesis omitted", "no paracentesis", "paracentesis not done", "ascitic tap not performed", "refused paracentesis"])
        para_exception = any(p in lower for p in ["severe dic", "active uncorrectable coagulopathy", "patient refused paracentesis", "refused tap"])

        para_span = None
        for cand in ["diagnostic paracentesis", "paracentesis performed", "no paracentesis", "patient refused paracentesis", "ascites"]:
            sp = cls._find_span(raw, cand)
            if sp:
                para_span = sp
                break

        if para_exception:
            assertions.append(ClinicalAssertion(
                concept="diagnostic_paracentesis",
                assertion_status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                evidence_span=para_span,
                exception_notes="Severe uncorrectable coagulopathy or documented informed patient refusal."
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="paracentesis",
                status="EXCEPTION_IDENTIFIED",
                certainty="DOCUMENTED",
                exception_detected=True,
                source_span=para_span,
                clinical_note="Documented clinical contraindication (DIC) or informed refusal."
            ))
            exceptions.append("Paracentesis contraindicated due to documented acute coagulopathy or refusal.")
        elif para_performed or ("paracentesis" in lower and not para_negation):
            assertions.append(ClinicalAssertion(
                concept="diagnostic_paracentesis",
                assertion_status="PERFORMED",
                certainty="DOCUMENTED",
                evidence_span=para_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="paracentesis",
                status="PERFORMED",
                certainty="DOCUMENTED",
                source_span=para_span,
                clinical_note="Diagnostic paracentesis executed and fluid analyzed."
            ))
        elif para_negation or ("ascites" in lower and "paracentesis" not in lower):
            assertions.append(ClinicalAssertion(
                concept="diagnostic_paracentesis",
                assertion_status="NOT_DOCUMENTED",
                certainty="DOCUMENTED",
                evidence_span=para_span
            ))
            normalized_events.append(NormalizedClinicalEvent(
                concept="paracentesis",
                status="NOT_PERFORMED",
                certainty="NEGATED",
                negation_detected=True,
                source_span=para_span,
                clinical_note="Ascitic tap omitted in new/worsening ascites."
            ))

        # (d) Physician Bedside Critical Care Time Assertion
        time_mins = evidence.physician_time_minutes
        time_span = None
        if time_match:
            time_span = EvidenceSpan(
                source_field="physician_time",
                exact_quote=time_match.group(0),
                start_char=time_match.start(),
                end_char=time_match.end()
            )

        if time_mins is not None:
            if time_mins >= 30:
                assertions.append(ClinicalAssertion(
                    concept="critical_care_time_threshold",
                    assertion_status="PERFORMED",
                    event_timestamp_min=time_mins,
                    certainty="DOCUMENTED",
                    evidence_span=time_span
                ))
                normalized_events.append(NormalizedClinicalEvent(
                    concept="critical_care_time",
                    status="PERFORMED",
                    certainty="DOCUMENTED",
                    event_time_minutes=time_mins,
                    source_span=time_span,
                    clinical_note=f"Documented bedside critical care time ({time_mins}m) satisfies initial CPT 99291 threshold."
                ))
            else:
                assertions.append(ClinicalAssertion(
                    concept="critical_care_time_threshold",
                    assertion_status="ORDERED_NOT_PERFORMED",
                    event_timestamp_min=time_mins,
                    certainty="DOCUMENTED",
                    evidence_span=time_span,
                    exception_notes=f"Documented direct time ({time_mins}m) is below the 30m threshold for CPT 99291."
                ))
                normalized_events.append(NormalizedClinicalEvent(
                    concept="critical_care_time",
                    status="NOT_PERFORMED",
                    certainty="DOCUMENTED",
                    event_time_minutes=time_mins,
                    source_span=time_span,
                    clinical_note=f"Documented direct time ({time_mins}m) below 30m minimum threshold."
                ))

        evidence.clinical_assertions = assertions
        evidence.normalized_events = normalized_events
        evidence.documented_exceptions = exceptions

        # 6. Procedural & Coding Predicates for Rule Engine
        procedural_pred = {
            "has_modifier_59": "-59" in raw or "modifier 59" in lower,
            "is_same_incision": any(t in lower for t in ["same incision", "same knee", "same compartment", "identical arthrotomy"]),
            "has_informed_consent": any(term in lower for term in ["informed consent", "consent obtained", "risks, benefits, and alternatives explained", "consent signed"]),
            "has_radiograph_confirmed": any(
                a.concept == "chest_radiograph" and a.assertion_status in ["PERFORMED", "EXCEPTION_IDENTIFIED"]
                for a in assertions
            ),
            "has_blood_cultures_drawn": any(
                a.concept == "blood_cultures" and a.assertion_status in ["PERFORMED", "EXCEPTION_IDENTIFIED"]
                for a in assertions
            ),
            "has_paracentesis_performed": any(
                a.concept == "diagnostic_paracentesis" and a.assertion_status in ["PERFORMED", "EXCEPTION_IDENTIFIED"]
                for a in assertions
            )
        }
        evidence.procedural_predicates = procedural_pred

        # 7. Procedures Identified
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

        # 7b. Medications Identified
        meds = []
        for med_name in ["Ceftriaxone", "Vancomycin", "Cefepime", "Zosyn", "Piperacillin", "Azithromycin", "Levofloxacin", "Meropenem", "Metronidazole"]:
            if med_name.lower() in lower:
                meds.append(med_name)
        evidence.medications_ordered = meds

        # 8. CPT Codes Identified
        cpt_matches = re.findall(r'\b(992\d{2}|929\d{2}|432\d{2}|490\d{2}|298\d{2}|365\d{2}|315\d{2})\b', raw)
        evidence.cpt_codes_identified = list(set(cpt_matches))
        evidence.coding_predicates = {
            "cpt_99291_critical_care": "99291" in cpt_matches or "99291" in raw,
            "cpt_27447_tka": "27447" in cpt_matches or "27447" in raw,
            "cpt_29881_meniscectomy": "29881" in cpt_matches or "29881" in raw,
            "cpt_92928_pci": "92928" in cpt_matches or "92928" in raw,
            "cpt_99285_ed_lvl5": "99285" in cpt_matches or "99285" in raw,
        }

        # 9. Signatures & Attestation Verification
        has_sig = any(term in lower for term in [
            "electronically signed", "authenticated by", "signature:", "signed by", "dr.", "md,", "do,"
        ])
        evidence.has_attending_signature = has_sig
        evidence.has_informed_consent = procedural_pred["has_informed_consent"]

        # 10. Missing Prerequisites Check
        if not vitals_dict and not evidence.is_truncated_or_incomplete:
            evidence.missing_prerequisites.append("Objective Vital Signs panel absent from encounter record.")
        if not evidence.has_attending_signature:
            evidence.missing_prerequisites.append("Attending physician electronic signature / timestamp not verified.")

        return evidence
