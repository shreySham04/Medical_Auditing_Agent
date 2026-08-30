"""
FastAPI application router for Medical Auditor.
Provides endpoints for record ingestion, multi-agent audits, benchmark evaluation, and guidelines lookup.
"""

import os
import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from typing import Dict, Any, List, Optional
from orchestration.pipeline import MedicalAuditOrchestrator
from retrieval.rule_grounding import RuleGroundingEngine
from evaluation.benchmark import ALL_BENCHMARK_CASES
from evaluation.evaluator import BenchmarkEvaluator
from core.calibration import HUMAN_FEEDBACK_EXEMPLARS


async def handle_audit_request(record_text: str, department: str = "") -> Dict[str, Any]:
    """Runs the full evidence-based multi-agent audit."""
    return await MedicalAuditOrchestrator.audit_patient_record(record_text, department)


def handle_get_benchmark_samples() -> List[Dict[str, Any]]:
    """Returns the curated synthetic benchmark dataset with expert labels."""
    return [c.to_dict() for c in ALL_BENCHMARK_CASES]


def handle_evaluate_benchmark() -> Dict[str, Any]:
    """Runs benchmark evaluation and returns Precision, Recall, F1, FPR, ECE, Brier metrics."""
    metrics = BenchmarkEvaluator.evaluate_benchmark()
    return metrics.to_dict()


def handle_get_guidelines(query: str = "", department: str = "") -> List[Dict[str, Any]]:
    """Retrieves grounded regulatory rules and official document citations."""
    return RuleGroundingEngine.retrieve_grounded_rules(query, department)


def handle_get_calibration_exemplars() -> List[Dict[str, Any]]:
    """Returns human-feedback calibration exemplars."""
    return HUMAN_FEEDBACK_EXEMPLARS
