# Benchmark Methodology & Dataset Characterization

## 1. Executive Summary

This document outlines the design, split methodology, ground-truth generation, and experimental limitations of the **Medical Audit Benchmark Suite (200 Clinical Cases)**.

The benchmark is engineered specifically for **controlled algorithmic evaluation, stress-testing, and software regression validation** of automated medical record auditing systems.

> **Crucial Methodological Notice:**
> This dataset is **entirely synthetic and de-identified**. All patient names, provider identities, encounter dates, and clinical narratives are synthetically generated based on statutory clinical guidelines. It contains no Protected Health Information (PHI). This benchmark is intended for reproducible software benchmarking; **clinical deployment requires independent external validation on real-world, HIPAA-governed institutional electronic health records**.

---

## 2. Dataset Split Design

The benchmark consists of 200 distinct test cases partitioned into two 100-case suites:

### A. Software Regression Suite (Cases 1–100)
- **Objective:** Measure software stability, rule precision, and standard-of-care compliance verification against clear-cut statutory requirements.
- **Coverage:** 8 clinical specialties (Cardiology, Emergency Medicine, Pulmonology, Orthopedic Surgery, Gastroenterology, Critical Care, Neurology, Nephrology).
- **Core Scenarios:**
  1. *Compliant Encounters:* Fully documented history, physical, time attestation, informed consent, and authenticated signature.
  2. *Critical Care Duration Deficits:* CPT 99291 billed with documented bedside time under the statutory 30-minute threshold (CMS IOM Pub 100-04 Ch 12 §30.6.12).
  3. *Sepsis-3 Bundle Sequence Deviations:* Broad-spectrum antibiotic administration initiated without antecedent blood cultures (Surviving Sepsis Campaign 2026).
  4. *Incomplete Documentation / Missing Sign-Off:* Unsigned physician orders, missing procedure notes, or unauthenticated discharge summaries (CMS CoP 42 CFR §482.24).
  5. *Unbundled Surgical Billing:* Modifier -59 or -X{EPSU} billed without distinct anatomical site or separate incision documentation (CMS NCCI Policy Manual Ch 1 §E).

### B. Blind Generalization Challenge Set (Cases 101–200)
- **Objective:** Stress-test system resilience against linguistic ambiguity, non-standard phrasing, edge cases, and adversarial perturbations.
- **Sub-Categories (10 cases each):**
  1. *Linguistic Paraphrasing & Ambiguity:* Non-standard clinician narrative phrasing for clinical events.
  2. *Edge-Case Time Boundaries:* Critical care durations at borderline thresholds (e.g., exactly 29 minutes vs 30 minutes).
  3. *Negation & Assertions:* Past medical history vs acute presenting illness (e.g., "denies chest pain; history of sepsis in 2021").
  4. *Clinical Exceptions & Contraindications:* Valid medical justifications that supersede standard bundle sequences (e.g., difficult vascular access in acute shock, radiation shielding in pregnancy, DIC contraindicating paracentesis, contralateral limb for Modifier -59).
  5. *Adversarial Prompt Injections:* Direct attempts to subvert auditor instructions (e.g., developer debug overrides, role confusion, instruction splitting).
  6. *Truncated & Incomplete Records:* Prematurely terminated charts missing critical sections.
  7. *Multi-Specialty Complex Co-morbidities:* Concurrently active multi-organ conditions.
  8. *Pediatric & Geriatric Dosing Nuances:* Age-specific clinical protocols.
  9. *Conflicting Provider Notes:* Attending vs resident narrative discrepancies.
  10. *Delayed Telemetry / Laboratory Latency:* Asynchronous diagnostic reporting timelines.

---

## 3. Ground Truth Formulation

Ground-truth labels (Expected Score, Expected Verdict, Clinical Violation, Billing Violation, and Statutory Citation) are programmatically established using deterministic constraint mappings grounded directly in official regulatory documentation:
- **CMS IOM Pub 100-04 (Medicare Claims Processing Manual):** Governs time thresholds for evaluation and management services.
- **CMS NCCI Policy Manual (Chapter 1, Section E):** Governs surgical unbundling and modifier -59 / modifier -X{EPSU} justification.
- **Surviving Sepsis Campaign 2026 International Guidelines:** Defines the 1-hour resuscitation bundle sequence.
- **42 CFR §482.24 (Conditions of Participation):** Defines statutory physician signature and authentication mandates.

---

## 4. Evaluation Separation (Input vs Ground Truth)

To prevent data leakage during algorithmic evaluation:
- The auditing pipeline receives **only** `BenchmarkCaseInput` (`id`, `specialty`, `record_text`, `cpt_billed`, metadata).
- `BenchmarkCaseGroundTruth` (`expected_score`, `expected_verdict`, `clinical_violation`, `billing_violation`, `evidence_citation`) is completely isolated and accessed **only after predictions are finalized** for metric calculation.
- The pipeline never sees expected findings or target scores during execution.

---

## 5. Limitations & Future Work

1. **Synthetic Linguistic Variety:** While synthetic cases test rule boundaries systematically, real clinical records feature messy EHR artifacts, transcription typos, specialized departmental jargon, and idiosyncratic layout structures.
2. **Deterministic Rules vs Nuanced Medicine:** Medicine frequently presents gray areas where clinical judgment supersedes rigid heuristics. The 2nd-stage Adversarial Verifier addresses this by checking documented exceptions, but real-world deployment requires human physician oversight.
3. **Independent Clinical Validation:** Future work must include multi-site evaluation on real clinical EHR datasets under IRB oversight with blinded physician audits.
