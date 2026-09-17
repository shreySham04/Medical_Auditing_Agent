"""
Experiment Tracking & Provenance System.
Logs every experiment, evaluation run, and audit batch with full technical provenance:
- model_version
- prompt_version
- temperature / top-p
- input_token_count
- output_token_count
- latency_ms
- cost_estimate_usd
- evaluation_metrics (Precision, Recall, F1, FPR, MAE, ECE, Brier)
- output_artifact_uri
Stores structured metadata in JSON Lines format for reproducible ML/systems engineering.
"""

import json
import time
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict


EXPERIMENTS_DIR = Path("./experiments")
EXPERIMENTS_FILE = EXPERIMENTS_DIR / "runs.jsonl"


@dataclass
class ExperimentRunRecord:
    run_id: str
    timestamp: str
    architecture: str
    model_version: str
    prompt_version: str
    temperature: float
    top_p: float
    cases_evaluated: int
    input_tokens: int
    output_tokens: int
    latency_ms: float
    estimated_cost_usd: float
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float
    false_negative_rate: float
    accuracy: float
    score_mae: float
    expected_calibration_error: float
    brier_score: float
    abstention_rate: float
    adversarial_defense_rate: float
    citation_support_rate: float
    commit_or_version: str = "v2.1.0-unleaked"
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ExperimentTracker:
    """
    Manages experiment metadata persistence, tracking model iterations, and telemetry logs.
    """

    @classmethod
    def initialize(cls):
        EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)
        if not EXPERIMENTS_FILE.exists():
            EXPERIMENTS_FILE.touch()

    @classmethod
    def record_run(cls, record: ExperimentRunRecord) -> None:
        cls.initialize()
        with open(EXPERIMENTS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record.to_dict()) + "\n")

    @classmethod
    def get_all_runs(cls) -> List[Dict[str, Any]]:
        cls.initialize()
        runs: List[Dict[str, Any]] = []
        if not EXPERIMENTS_FILE.exists():
            return runs
        with open(EXPERIMENTS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        runs.append(json.loads(line.strip()))
                    except json.JSONDecodeError:
                        continue
        return runs

    @classmethod
    def seed_initial_ablation_runs(cls) -> None:
        """Seeds canonical tracked runs from the real benchmark ablation trials if empty."""
        runs = cls.get_all_runs()
        if len(runs) >= 5:
            return

        from evaluation.experiments import ExperimentBenchmarkRunner
        results = ExperimentBenchmarkRunner.run_full_ablation_experiment(require_api_key=True)

        prompt_vers = {
            "baseline_llm": "prompt-zero-shot-v1.0",
            "single_agent_rules": "prompt-single-rule-v2.0",
            "multi_agent_rules": "prompt-multi-agent-v2.3",
            "multi_agent_verifier": "prompt-multi-agent-verifier-v2.4",
            "full_pipeline": "prompt-full-pipeline-calibrated-v2.5"
        }

        models = {
            "baseline_llm": "gemini-2.5-flash-zero-shot",
            "single_agent_rules": "hybrid-deterministic-v2.0",
            "multi_agent_rules": "multi-agent-gemini-2.5-flash",
            "multi_agent_verifier": "mauditor-6agent-verifier",
            "full_pipeline": "mauditor-7agent-calibrated-ensemble"
        }

        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        for idx, r in enumerate(results):
            rec = ExperimentRunRecord(
                run_id=f"EXP-2026-ABLATION-{idx+1:02d}",
                timestamp=now_iso,
                architecture=r.architecture_name,
                model_version=models.get(r.architecture_key, "gemini-2.5-flash"),
                prompt_version=prompt_vers.get(r.architecture_key, "v2.5"),
                temperature=0.1,
                top_p=0.95,
                cases_evaluated=200,
                input_tokens=r.input_tokens_per_audit * 200,
                output_tokens=r.output_tokens_per_audit * 200,
                latency_ms=r.average_latency_ms,
                estimated_cost_usd=round((r.cost_per_100_audits_usd / 100.0) * 200, 4),
                precision=r.precision,
                recall=r.recall,
                f1_score=r.f1_score,
                false_positive_rate=r.false_positive_rate,
                false_negative_rate=r.false_negative_rate,
                accuracy=r.accuracy,
                score_mae=r.score_mae,
                expected_calibration_error=r.expected_calibration_error,
                brier_score=r.brier_score,
                abstention_rate=r.abstention_accuracy,
                adversarial_defense_rate=r.prompt_injection_defense_rate,
                citation_support_rate=r.verifiable_citation_rate,
                notes=f"Controlled ablation run on 200-case locked benchmark. {r.description}"
            )
            cls.record_run(rec)
