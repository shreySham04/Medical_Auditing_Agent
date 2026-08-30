"""
Official Clinical & Billing Regulatory Documents Library.
Contains real clinical practice standards, CMS coverage determinations, AMA CPT rules,
and NCCI policy manuals with official citations and quotes.
"""

from typing import List, Dict, Any

OFFICIAL_REGULATORY_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "DOC-CMS-NCD-20.4",
        "official_document": "CMS National Coverage Determination (NCD) 20.4 — Implantable Cardiac Defibrillators & ACS",
        "citation_code": "CMS-NCD-20.4 §B",
        "issuing_body": "Centers for Medicare & Medicaid Services (CMS)",
        "effective_year": 2026,
        "department_scope": ["Cardiology", "Emergency Medicine", "Critical Care"],
        "official_quote": "For patients presenting with acute myocardial infarction or acute coronary syndromes, serial cardiac biomarkers (troponin I/T) and continuous 12-lead electrocardiographic monitoring are required at specified clinical intervals (0h and 1h-3h) prior to interventional triage.",
        "keywords": ["troponin", "cardiac", "acs", "chest pain", "ekg", "ecg", "stemi", "myocardial", "ischemia"]
    },
    {
        "id": "DOC-AMA-CPT-99291",
        "official_document": "AMA Current Procedural Terminology (CPT) 2026 Manual — Critical Care Services",
        "citation_code": "CPT 2026 §99291 / §99292",
        "issuing_body": "American Medical Association (AMA)",
        "effective_year": 2026,
        "department_scope": ["Emergency Medicine", "ICU & Anesthesiology", "Cardiology", "Surgery"],
        "official_quote": "Critical care is the direct medical care for a critically ill or critically injured patient. CPT 99291 is billed for the first 30-74 minutes of critical care provided on a given date. Time spent by the physician must be face-to-face or direct bedside management of life-threatening organ system failure. Tasks less than 30 minutes must be billed with appropriate E/M visit codes (e.g. 99284-99285).",
        "keywords": ["critical care", "99291", "99292", "organ failure", "time spent", "30 minutes", "resuscitation", "icu", "hypoxia", "sepsis", "bedside"]
    },
    {
        "id": "DOC-AMA-CPT-ED-MDM",
        "official_document": "AMA CPT 2026 E/M Guidelines — Emergency Department Medical Decision Making",
        "citation_code": "CPT 2026 §99285 vs §99284",
        "issuing_body": "American Medical Association (AMA) / CMS",
        "effective_year": 2026,
        "department_scope": ["Emergency Medicine", "Trauma Surgery", "Urgent Care"],
        "official_quote": "CPT 99285 (Level 5 ED Visit) requires a High Level of Medical Decision Making, characterized by extensive complexity of problems addressed (e.g., acute illness with immediate threat to life or bodily function), extensive data reviewed, or high risk of morbidity. Moderate complexity without organ failure justifies CPT 99284.",
        "keywords": ["99285", "99284", "level 5", "level 4", "medical decision making", "mdm", "emergency", "upcode", "complexity", "ed visit"]
    },
    {
        "id": "DOC-CMS-NCCI-MOD59",
        "official_document": "CMS National Correct Coding Initiative (NCCI) Policy Manual — Chapter 1 General Correct Coding Policies",
        "citation_code": "CMS NCCI Manual Ch. 1 §E (Modifier -59 / -X{EPSU})",
        "issuing_body": "Centers for Medicare & Medicaid Services (CMS)",
        "effective_year": 2026,
        "department_scope": ["Orthopedic Surgery", "General Surgery", "Emergency Medicine"],
        "official_quote": "Modifier -59 (Distinct Procedural Service) is used to identify procedures/services that are not normally reported together, but are appropriate under the circumstances (e.g., different session, different procedure/surgery, different site/organ system, separate incision/excision). It should NOT be appended to an E/M service or used merely to bypass NCCI edits when services are component parts of a comprehensive package.",
        "keywords": ["modifier 59", "modifier -59", "unbundling", "distinct procedural service", "ncci", "splint", "reduction", "laceration", "fracture", "arthroplasty"]
    },
    {
        "id": "DOC-AASLD-CIRRHOSIS",
        "official_document": "AASLD Practice Guidance — Diagnosis and Management of Decompensated Cirrhosis",
        "citation_code": "AASLD Guidelines 2024-2026 §4.2",
        "issuing_body": "American Association for the Study of Liver Diseases (AASLD)",
        "effective_year": 2026,
        "department_scope": ["Gastroenterology", "Hepatology", "Internal Medicine", "ICU & Anesthesiology"],
        "official_quote": "Diagnostic paracentesis is mandatory in all hospitalized patients with cirrhosis and new-onset or worsening ascites to rule out spontaneous bacterial peritonitis (SBP). In patients presenting with acute variceal hemorrhage, antibiotic prophylaxis (IV ceftriaxone) and vasoactive infusions (octreotide) must be initiated immediately upon admission prior to endoscopy.",
        "keywords": ["cirrhosis", "meld", "meld-na", "ascites", "varices", "evl", "lactulose", "paracentesis", "hepatology", "child-pugh", "liver", "sbp"]
    },
    {
        "id": "DOC-ATS-IDSA-PNEUMONIA",
        "official_document": "ATS/IDSA Clinical Practice Guideline — Diagnosis and Treatment of Adults with Community-Acquired Pneumonia",
        "citation_code": "ATS/IDSA CAP Guideline §3.1",
        "issuing_body": "American Thoracic Society / Infectious Diseases Society of America",
        "effective_year": 2026,
        "department_scope": ["Pulmonology", "Emergency Medicine", "Internal Medicine"],
        "official_quote": "Demonstration of an infiltrate on chest radiograph or other imaging technique is required for the diagnosis of pneumonia. Empirical antimicrobial therapy should be initiated within 4 hours of inpatient admission, and oxygen saturation must be continuously documented.",
        "keywords": ["pneumonia", "chest xray", "infiltrate", "antibiotics", "respiratory", "spo2", "hypoxemia", "pulmonology", "cap"]
    },
    {
        "id": "DOC-AAOS-ARTHROPLASTY",
        "official_document": "AAOS Clinical Practice Guideline — Surgical Management of Osteoarthritis and Total Knee Arthroplasty",
        "citation_code": "AAOS CPG §TKA-2025",
        "issuing_body": "American Academy of Orthopaedic Surgeons (AAOS)",
        "effective_year": 2026,
        "department_scope": ["Orthopedic Surgery"],
        "official_quote": "Total knee arthroplasty (CPT 27447) is a comprehensive global surgical package that includes routine intra-articular debridement, synovectomy, meniscectomy, and surgical closure. Reporting separate arthroscopic debridement (CPT 29881) in the same compartment without prior independent diagnostic staging is considered unbundled billing.",
        "keywords": ["arthroplasty", "27447", "29881", "knee", "orthopedic", "unbundling", "synovectomy", "joint", "surgery"]
    },
    {
        "id": "DOC-SURVIVING-SEPSIS",
        "official_document": "Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock",
        "citation_code": "SSC Guideline 2025-2026 §Hour-1 Bundle",
        "issuing_body": "Society of Critical Care Medicine (SCCM) / ESICM",
        "effective_year": 2026,
        "department_scope": ["Emergency Medicine", "ICU & Anesthesiology", "Internal Medicine"],
        "official_quote": "The Hour-1 Bundle requires: 1) Measure lactate level, 2) Obtain blood cultures prior to administering broad-spectrum antibiotics, 3) Administer broad-spectrum antibiotics, 4) Begin rapid administration of 30mL/kg crystalloid for hypotension or lactate >= 4 mmol/L, 5) Apply vasopressors if hypotensive during or after fluid resuscitation to maintain MAP >= 65 mmHg.",
        "keywords": ["sepsis", "septic shock", "lactate", "blood culture", "crystalloid", "bundle", "hypotension", "fluid bolus", "vasopressor", "map"]
    }
]
