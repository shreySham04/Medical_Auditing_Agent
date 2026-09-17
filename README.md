# 🛡️ MedicalAuditor

## Evidence-Grounded Medical Coding & Clinical Compliance Audit Engine

> **Research & Clinical Audit Architecture v2.5**
> Evidence-grounded decision support for clinical compliance, medical coding, documentation integrity, and audit triage.

MedicalAuditor is a research-oriented medical auditing system that analyzes synthetic EHR narratives and billing claims for potential compliance violations, documentation deficiencies, coding inconsistencies, clinical exceptions, and insufficient evidence.

The system combines:

* Model-backed Gemini LLM auditing
* Deterministic statutory and coding rules
* Structured clinical evidence extraction
* Multi-agent domain decomposition
* Rule-aware adversarial verification
* Clinical exception detection
* Prompt-injection defense
* Insufficient-evidence abstention
* Source-grounded regulatory citations
* Score calibration and uncertainty metrics
* Reproducible LLM-response caching
* Leakage-controlled benchmark evaluation

> **Important:** MedicalAuditor is a research and software-validation prototype. Its benchmark is synthetic and does not establish clinical safety, regulatory approval, or real-world hospital performance.

---

# 📊 Current Evaluation

MedicalAuditor currently evaluates a locked **200-case synthetic benchmark**:

| Split            | Cases | Purpose                                                                                      |
| ---------------- | ----: | -------------------------------------------------------------------------------------------- |
| Regression Suite |   100 | Core known scenarios and software regression testing                                         |
| Blind Challenge  |   100 | Unseen synthetic phrasing, ambiguity, exceptions, adversarial inputs, and incomplete records |
| Total            |   200 | Controlled architecture evaluation                                                           |

The current full calibrated pipeline, **A4**, reports:

```text
Regression Suite:     100.0% F1
Blind Challenge:      100.0% F1
Aggregate Benchmark:  100.0% F1
Score MAE:              7.60
ECE:                    0.3246
Brier Score:            0.1810
```

These results should be interpreted strictly within the current synthetic benchmark environment. The benchmark is deliberately constructed around codified rules and controlled adversarial scenarios, so 100% benchmark F1 should **not** be interpreted as 100% clinical accuracy or evidence of real-world generalization.

---

# 🔬 Controlled 5-Stage Ablation Study

The central research component of MedicalAuditor is a controlled architectural ablation study.

Each architecture is evaluated on the same locked benchmark cases, while components are progressively introduced.

## Component Isolation Matrix

| Architecture                            | LLM | Rules | Multi-Agent | Verifier | Calibration |
| --------------------------------------- | :-: | :---: | :---------: | :------: | :---------: |
| **A0 — Baseline LLM**                   |  ✅  |   ❌   |      ❌      |     ❌    |      ❌      |
| **A1 — Single-Agent + Rules**           |  ✅  |   ✅   |      ❌      |     ❌    |      ❌      |
| **A2 — Multi-Agent + Rules**            |  ✅  |   ✅   |      ✅      |     ❌    |      ❌      |
| **A3 — Multi-Agent + Rules + Verifier** |  ✅  |   ✅   |      ✅      |     ✅    |      ❌      |
| **A4 — Full Calibrated System**         |  ✅  |   ✅   |      ✅      |     ✅    |      ✅      |

This structure allows the contribution of each architectural layer to be examined independently.

---

# 📈 Ablation Results

| Metric                   | A0: Baseline LLM | A1: LLM + Rules | A2: + Multi-Agent | A3: + Verifier | A4: + Calibration |
| ------------------------ | ---------------: | --------------: | ----------------: | -------------: | ----------------: |
| **Regression F1**        |           68.33% |          85.71% |            85.71% |     **100.0%** |        **100.0%** |
| **Blind F1**             |           66.66% |          76.34% |            76.34% |     **100.0%** |        **100.0%** |
| **Overall F1**           |           67.50% |          81.18% |            81.18% |     **100.0%** |        **100.0%** |
| **Overall Accuracy**     |           61.00% |          74.50% |            74.50% |     **100.0%** |        **100.0%** |
| **Precision**            |           62.31% |          68.32% |            68.32% |     **100.0%** |        **100.0%** |
| **Recall**               |           73.64% |          100.0% |            100.0% |     **100.0%** |        **100.0%** |
| **FPR**                  |           54.44% |          56.67% |            56.67% |      **0.00%** |         **0.00%** |
| **Unsupported Findings** |           28.50% |          11.50% |            13.50% |      **0.00%** |         **0.00%** |
| **Exception FPR**        |           45.00% |           0.00% |            18.20% |      **0.00%** |         **0.00%** |
| **Injection Defense**    |            0.00% |          100.0% |            100.0% |         100.0% |            100.0% |
| **Abstention Accuracy**  |            0.00% |          100.0% |            100.0% |         100.0% |            100.0% |
| **Citation Rate**        |           22.00% |          78.50% |            84.50% |         100.0% |            100.0% |
| **ECE**                  |           0.2375 |          0.1627 |            0.3397 |         0.3528 |        **0.3246** |
| **Score MAE**            |            16.96 |            9.77 |              8.39 |           8.51 |          **7.60** |
| **Brier Score**          |                — |               — |                 — |         0.2153 |        **0.1810** |

---

# 🧠 What the Ablation Shows

## A0 — Baseline LLM

A0 is a genuine zero-shot Gemini baseline.

It receives the raw clinical record and has:

* No deterministic rule engine
* No structured evidence extraction
* No multi-agent decomposition
* No verifier
* No calibration
* No retrieved synthetic few-shot exemplars

Its purpose is to establish the performance of a single model before architectural safeguards are added.

---

## A1 — LLM + Deterministic Rules

A1 adds structured extraction, prompt-injection defense, insufficient-evidence detection, and deterministic statutory rule validation.

The purpose is to measure whether hard constraints improve consistency over an unconstrained LLM.

---

## A2 — Multi-Agent + Rules

A2 adds domain decomposition across:

* Clinical
* Billing/Coding
* Documentation
* Timeline

The current benchmark shows that A2 does **not** improve binary classification over A1:

```text
A1 F1: 81.18%
A2 F1: 81.18%
```

This is an important result rather than a failure to hide. The benchmark suggests that simply adding specialized agents does not automatically reduce false positives.

---

## A3 — Multi-Agent + Rule-Aware Adversarial Verifier

A3 adds the second-stage verifier.

The verifier evaluates candidate findings against the original chart and checks:

1. Evidence grounding
2. Textual contradiction
3. Clinical exceptions
4. Regulatory authority support
5. Claim validity

Within the current synthetic benchmark:

```text
A2 FPR: 56.67%
A3 FPR: 0.00%

A2 Unsupported Findings: 13.50%
A3 Unsupported Findings: 0.00%

A2 F1: 81.18%
A3 F1: 100.0%
```

The current results therefore attribute the largest classification improvement to the verification layer rather than to multi-agent decomposition alone.

---

## A4 — Full Calibrated System

A4 adds the `ExpertRuleCalibrator` on top of A3.

Binary classification does not change:

```text
A3 F1 = 100.0%
A4 F1 = 100.0%
```

The measured contribution of calibration is instead reflected in continuous score reliability:

```text
Score MAE:
A3 = 8.51
A4 = 7.60

ECE:
A3 = 0.3528
A4 = 0.3246

Brier:
A3 = 0.2153
A4 = 0.1810
```

Therefore the appropriate interpretation is:

> **The verifier primarily improves classification and evidence integrity; calibration primarily improves score reliability.**

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │  Raw EHR / Claim Text │
                         └───────────┬───────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │ Prompt Injection Defense    │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Structured Evidence         │
                    │ Extraction                  │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Insufficient Evidence       │
                    │ Assessment                  │
                    └────────────┬───────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │                                │
                 ▼                                ▼
       ┌────────────────────┐          ┌────────────────────┐
       │ Deterministic      │          │ Gemini LLM         │
       │ Rule Engine        │          │ Auditor            │
       └─────────┬──────────┘          └─────────┬──────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Multi-Agent Committee       │
                    │                            │
                    │ Clinical                   │
                    │ Billing                    │
                    │ Documentation              │
                    │ Timeline                   │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Rule-Aware Adversarial      │
                    │ Evidence Verifier           │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Expert Rule Calibration     │
                    │ ECE / Brier / Score Model   │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ Final Audit Decision        │
                    │ Score / Verdict / Findings  │
                    └────────────────────────────┘
```

---

# 🔍 Evidence-Grounded Verification

The verifier is intentionally designed as a separate verification layer rather than simply trusting upstream model output.

## 1. Character-Level Evidence Grounding

Candidate findings are checked against the original clinical narrative.

The verifier attempts:

```text
Exact match
      ↓
Case-insensitive match
      ↓
Normalized/token grounding
      ↓
Concept grounding
```

Unsupported findings can be rejected rather than propagated into the final audit.

---

## 2. Contradiction Detection

The verifier checks whether the chart contradicts an upstream claim.

Examples include:

* Claimed critical-care duration vs documented bedside time
* Claimed missing cultures vs documented cultures
* Claimed missing signature vs authenticated documentation

---

## 3. Clinical Exception Detection

The verifier checks whether a potential violation has an explicitly documented mitigating circumstance.

Examples include:

* Difficult vascular access
* Severe clinical instability
* Patient refusal
* Severe coagulopathy
* Distinct anatomical sites
* Separate procedural fields

---

## 4. Regulatory Verification

Candidate findings can be associated with regulatory or clinical authority references through the repository's regulatory knowledge base and provenance layer.

---

# 🧪 Benchmark Design

The benchmark contains 200 synthetic cases.

## Regression Suite

The regression suite evaluates established scenarios such as:

* Critical-care billing thresholds
* Modifier-based unbundling
* Sepsis documentation
* Pneumonia workup
* Paracentesis
* STEMI workflows
* Documentation completeness
* Clinical exceptions

## Blind Challenge

The blind challenge introduces more difficult controlled cases involving:

* Alternative phrasing
* Negation
* Contradictory documentation
* Clinical shorthand
* Implicit temporal relationships
* Clinical exceptions
* Prompt injection
* Truncated records
* Ambiguous documentation

The blind split is still **synthetic and programmatically generated**. It should therefore be treated as a controlled challenge set rather than a substitute for an independently collected real-world dataset.

---

# 🔐 Leakage Controls

MedicalAuditor explicitly separates benchmark input from benchmark ground truth.

During inference, architectures receive the clinical input record and do not receive:

* Expected verdict
* Expected score
* Ground-truth violation label
* Ground-truth explanation
* Benchmark target category

Metrics are computed only after predictions are generated.

The repository also contains tests designed to verify that changing ground-truth score values does not directly change model predictions.

---

# 🔑 Mandatory Model-Backed Evaluation

Benchmark and ablation execution requires:

```text
GEMINI_API_KEY
```

The benchmark runner enforces:

```python
require_api_key=True
```

Missing credentials cause an immediate runtime failure.

There is no simulation result returned as a substitute for a model-backed benchmark run.

This separation is important because development/demo simulation and empirical model evaluation are different execution modes.

---

# ♻️ Reproducibility and LLM Caching

Model responses can be cached using cryptographic prompt hashes.

```text
Prompt
   ↓
Model + Prompt Hash
   ↓
SHA-256 Cache Key
   ↓
Cached Gemini Response
```

Cache location:

```text
evaluation/cache/llm_benchmark_cache.json
```

The cache is intended to make repeated benchmark runs reproducible with respect to previously obtained model responses.

A cached response should not be interpreted as measured network latency.

---

# ⏱️ Latency Measurement

The evaluation reports two different latency concepts.

### Local / Cache-Hit Latency

Measures:

* Local Python execution
* Evidence extraction
* Rule evaluation
* Verification
* Calibration
* Cached LLM lookup

Current reported values are approximately:

```text
A0  ~0.02 ms
A1  ~0.71 ms
A2  ~0.68 ms
A3  ~0.76 ms
A4  ~0.76 ms
```

These are **not Gemini network inference times**.

### Cold API Latency

The README also reports approximate end-to-end network latency estimates:

```text
A0 / A1  ≈ 850 ms
A2–A4    ≈ 1,700 ms
```

These values should be treated as configured/estimated operational figures rather than a controlled latency benchmark across a fixed network environment.

For rigorous latency research, run a dedicated uncached latency experiment with repeated measurements, confidence intervals, and a fixed model/API configuration.

---

# 💰 Cost Estimation

The benchmark runner uses configured token-cost assumptions:

```text
Input:  $0.15 / 1M tokens
Output: $0.60 / 1M tokens
```

Configured approximate token budgets:

| Architecture | Input Tokens | Output Tokens |
| ------------ | -----------: | ------------: |
| A0           |        1,200 |           350 |
| A1           |        2,400 |           750 |
| A2           |        4,800 |         1,500 |
| A3           |        4,800 |         1,500 |
| A4           |        6,000 |         1,900 |

Approximate configured cost per 100 audits:

| Architecture | Estimated Cost |
| ------------ | -------------: |
| A0           |         $0.039 |
| A1           |         $0.081 |
| A2           |         $0.162 |
| A3           |         $0.162 |
| A4           |         $0.204 |

These are **modeling assumptions**, not invoices or measured cloud expenditure.

Actual cost depends on the provider, model version, prompt size, output size, caching, and pricing at execution time.

---

# 🛡️ Security and Adversarial Robustness

The system includes controlled prompt-injection cases embedded within medical records.

Examples include attempts to introduce:

```text
SYSTEM OVERRIDE
DEVELOPER OVERRIDE
VERDICT = PASS
SCORE = 100
SUPPRESS ALL PENALTIES
```

A0 intentionally has no injection-defense layer.

Later architectures add the prompt-injection defense before downstream rule and agent processing.

The benchmark therefore evaluates the architectural contribution of input sanitization separately from ordinary classification.

---

# 📚 Regulatory and Clinical Knowledge

The repository separates:

### Statutory / Coding Rules

Examples:

* CMS NCCI
* CMS coding guidance
* AMA CPT-related thresholds
* Modifier logic

### Clinical Practice Guidance

Examples:

* Sepsis management
* Cardiology pathways
* Pulmonary/infectious disease scenarios
* Gastroenterology guidance
* Other specialty-specific standards

The project is intended to keep statutory coding constraints distinct from clinical practice recommendations rather than treating every rule as interchangeable.

---

# 📂 Repository Structure

```text
Medical_Auditing_Agent/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── services/
│   │   ├── audit_service.py
│   │   ├── benchmark_service.py
│   │   └── report_service.py
│   └── routes/
│       ├── audit.py
│       ├── benchmark.py
│       └── reports.py
│
├── agents/
│   ├── clinical_agent.py
│   ├── billing_agent.py
│   ├── documentation_agent.py
│   └── timeline_agent.py
│
├── core/
│   ├── adversarial.py
│   ├── calibration.py
│   ├── disagreement_detector.py
│   ├── deterministic_rules.py
│   ├── evidence_extractor.py
│   ├── experiment_tracker.py
│   ├── insufficient_evidence.py
│   ├── llm_client.py
│   ├── parser.py
│   ├── schemas.py
│   ├── trace.py
│   └── verifier.py
│
├── evaluation/
│   ├── benchmark.py
│   ├── evaluator.py
│   ├── experiments.py
│   └── cache/
│       └── llm_benchmark_cache.json
│
├── retrieval/
│   ├── guidelines_db.py
│   └── rule_grounding.py
│
├── tools/
│   ├── training_dataset.py
│   └── rag_cag_engine.py
│
├── orchestration/
│   └── pipeline.py
│
├── tests/
│
├── fastapi_app.py
├── server.js
├── requirements.txt
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/shreySham04/Medical_Auditing_Agent.git
cd Medical_Auditing_Agent
```

## 2. Create a Python environment

```bash
python3 -m venv .venv
```

### Linux / macOS

```bash
source .venv/bin/activate
```

### Windows

```powershell
.venv\Scripts\activate
```

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

The primary Python dependencies include:

* FastAPI
* Uvicorn
* Pydantic
* Streamlit
* Google GenAI
* Google ADK
* python-dotenv
* pypdf
* Pillow
* MCP
* pandas

---

# 🔐 Environment Configuration

Create a `.env` file:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

Do not commit real API keys to GitHub.

For benchmark and ablation experiments, the API key is mandatory.

---

# 🖥️ Run the Streamlit Application

```bash
streamlit run app/main.py
```

The application provides interfaces for:

```text
🔍 Clinical Investigator
📊 Benchmark & Ablations
📑 Audit Reports & History
```

---

# 🚀 Run the FastAPI Backend

```bash
uvicorn fastapi_app:app --host 0.0.0.0 --port 8088
```

The default application ports are:

```text
Streamlit: 8501
FastAPI:   8088
```

---

# 🧪 Run the Test Suite

```bash
python3 -m unittest discover tests
```

The tests cover areas such as:

* Audit services
* Evidence extraction
* Insufficient evidence handling
* Benchmark metrics
* Ablation execution
* Ground-truth leakage resistance
* Experiment tracking
* Report generation

---

# 📊 Run the Independent Benchmark

```bash
python3 -c "
from evaluation.evaluator import BenchmarkEvaluator

metrics = BenchmarkEvaluator.evaluate_all()

print('Precision:', f'{metrics.precision:.2f}%')
print('Recall:', f'{metrics.recall:.2f}%')
print('F1 Score:', f'{metrics.f1_score:.2f}%')
print('Score MAE:', f'{metrics.score_mae:.2f} pts')
"
```

---

# 🔬 Run the 5-Architecture Ablation

```bash
python3 -c "
from evaluation.experiments import ExperimentBenchmarkRunner

results = ExperimentBenchmarkRunner.run_full_ablation_experiment(
    require_api_key=True
)

for r in results:
    print(
        f'{r.architecture_name} -> '
        f'F1: {r.f1_score:.2f}%, '
        f'Precision: {r.precision:.2f}%, '
        f'Recall: {r.recall:.2f}%, '
        f'FPR: {r.false_positive_rate:.2f}%'
    )
"
```

The experiment runner evaluates:

```text
A0 → A1 → A2 → A3 → A4
```

on the same locked benchmark cases.

---

# 🧮 Evaluation Metrics

MedicalAuditor reports more than F1.

## Classification

* Precision
* Recall
* F1
* Accuracy
* False Positive Rate
* False Negative Rate

## Reliability

* Expected Calibration Error
* Brier Score
* Score MAE

## Evidence Quality

* Unsupported Findings Rate
* Verifiable Citation Rate
* Hallucination Suppression Rate

## Robustness

* Prompt Injection Defense
* Abstention Accuracy
* Clinical Exception False Positive Rate

## Operational

* Local execution latency
* Cache-hit latency
* Cold API latency estimate
* Estimated token usage
* Estimated cost

---

# 🧠 Research Questions

The current ablation is designed around four main questions:

### RQ1 — Rules

> Do deterministic statutory constraints improve audit consistency over a zero-shot LLM?

### RQ2 — Multi-Agent Decomposition

> Does separating clinical, billing, documentation, and timeline reasoning improve audit performance?

### RQ3 — Verification

> Does an independent rule-aware verification layer reduce unsupported findings and false positives?

### RQ4 — Calibration

> Can score calibration improve continuous risk-score reliability without changing binary classification?

The current benchmark results suggest:

```text
Rules       → substantial classification improvement
Multi-agent → no additional F1 improvement over A1
Verifier    → largest classification improvement
Calibration → score/reliability improvement
```

These conclusions apply only to the current synthetic benchmark.

---

# ⚠️ Threats to Validity

## 1. Synthetic Dataset

All benchmark cases are synthetic and contain no real patient records.

The results therefore do not establish performance on actual hospital EHR data.

## 2. Programmatic Ground Truth

The benchmark ground truth is established programmatically from the encoded clinical and coding rules.

It should not be described as a real-world human annotation study unless an independent annotation protocol and records are added.

## 3. Rule-Benchmark Alignment

The benchmark scenarios are constructed around the same classes of statutory and clinical rules implemented by the system.

This creates a legitimate risk of **closed-domain benchmark alignment**.

The current 100% A3/A4 result should therefore be interpreted as:

> Near-perfect performance within the controlled synthetic benchmark.

It should not be presented as evidence of equivalent real-world clinical performance.

## 4. Benchmark Size

A 200-case benchmark is useful for controlled software experiments but is too small to characterize broad clinical variability.

## 5. Model Variability

LLM outputs can change across:

* Model versions
* API configurations
* Prompt versions
* Generation settings
* Provider-side changes

Response caching improves reproducibility for previously evaluated prompts but does not eliminate model-version effects.

## 6. Latency

The reported local timings do not represent a hospital production deployment environment.

Network latency, concurrency, API rate limits, queueing, retries, model loading, and infrastructure overhead can materially change end-to-end response time.

---

# 🚫 What This Project Does Not Claim

MedicalAuditor does **not** currently claim:

* Clinical approval
* Regulatory approval
* Autonomous medical decision-making
* Replacement of physician auditors
* Real-world hospital-grade sensitivity or specificity
* Generalization to arbitrary EHR systems
* Safety on unseen real clinical populations
* Perfect real-world performance

The benchmark is intended for **architecture research, controlled evaluation, regression testing, and evidence-grounding experiments**.

---

# 🧭 Recommended Research Roadmap

The next major research step is not another increase in synthetic benchmark F1.

The higher-value extensions are:

### 1. Independent External Challenge Set

Create cases independently of the rule-engine implementation and hold them out completely from development.

### 2. Realistic Linguistic Variation

Introduce:

* Abbreviations
* Typos
* OCR noise
* Incomplete sentences
* Temporal ambiguity
* Negation
* Contradictory notes
* Local terminology

### 3. Independent Human Annotation

For a research publication, establish a formal annotation protocol with qualified reviewers, blinded labels, disagreement handling, and documented agreement statistics.

### 4. Multi-Institution Evaluation

Test on appropriately governed datasets from multiple institutions and specialties.

### 5. Confidence Calibration

Evaluate reliability using sufficiently large independent calibration and test sets rather than relying only on the existing synthetic benchmark.

---

# 📜 Research Positioning

A defensible description of the current system is:

> **MedicalAuditor is an evidence-grounded medical compliance auditing research prototype that investigates how deterministic statutory rules, multi-agent decomposition, adversarial evidence verification, and score calibration affect the reliability of LLM-assisted clinical and coding audit workflows.**

The strongest current research finding is not simply the final 100% benchmark score.

It is the **component-level ablation**:

```text
A0  → establish LLM baseline
A1  → measure rule contribution
A2  → test multi-agent contribution
A3  → test verifier contribution
A4  → test calibration contribution
```

That structure makes it possible to distinguish where performance improvements actually originate.

---

# 🧑‍💻 Project Status

**Version:** v2.5
**Benchmark:** 200 synthetic cases
**Ablations:** A0–A4
**Model-backed evaluation:** Required
**Simulation fallback during benchmark:** Disabled
**Prompt-response caching:** Enabled
**Ground-truth leakage controls:** Implemented
**Blind challenge split:** Implemented
**External real-world validation:** Not yet performed

---

# 📄 Disclaimer

MedicalAuditor is a research prototype intended for software engineering, machine-learning, and clinical-audit experimentation.

It is not a medical device, does not provide medical advice, and should not be used to make autonomous clinical, billing, reimbursement, or patient-care decisions.

All benchmark patients and clinical records are synthetic and de-identified.

Human clinical and coding professionals remain responsible for interpreting audit findings and making operational decisions.

---

# ⭐ Citation

If this repository is used in research or experimentation, cite the repository directly and identify the exact commit, model version, benchmark version, and prompt version used for the experiment.

For reproducibility, record:

```text
Repository commit
Model name/version
Prompt version
Benchmark version
Generation settings
Cache state
Evaluation date
```
