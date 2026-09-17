"""
Unified LLM Client for Model-Backed Evaluation and Audit Pipelines.
Calls Gemini models via official API with strict API key enforcement,
prompt-hashed caching for benchmark reproducibility, and zero-shot clinical audit prompts.
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional
import urllib.request
import urllib.error

CACHE_DIR = Path(__file__).resolve().parent.parent / "evaluation" / "cache"
CACHE_FILE = CACHE_DIR / "llm_benchmark_cache.json"


class ModelBackedLLMClient:
    """
    Client for real Gemini LLM model calls during evaluation and ablation studies.
    Enforces that GEMINI_API_KEY must be present for model-backed execution.
    """

    MODEL_NAME = "gemini-2.5-flash"
    FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.0-flash"]
    DEFAULT_TIMEOUT_SEC = 25

    _cache: Optional[Dict[str, Any]] = None

    @classmethod
    def _get_api_key(cls, require_key: bool = True) -> str:
        key = os.getenv("GEMINI_API_KEY", "").strip()
        if require_key and (not key or key == "MY_GEMINI_API_KEY"):
            raise RuntimeError(
                "GEMINI_API_KEY is required for model-backed evaluation. "
                "Set GEMINI_API_KEY in your environment to execute real model-backed ablation."
            )
        return key

    @classmethod
    def _load_cache(cls) -> Dict[str, Any]:
        if cls._cache is not None:
            return cls._cache
        if CACHE_FILE.exists():
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cls._cache = json.load(f)
                    return cls._cache
            except Exception:
                cls._cache = {}
        else:
            cls._cache = {}
        return cls._cache

    @classmethod
    def _save_cache(cls) -> None:
        if cls._cache is None:
            return
        try:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._cache, f, indent=2)
        except Exception:
            pass

    @classmethod
    def _hash_prompt(cls, prompt: str, model: str) -> str:
        content = f"{model}:{prompt.strip()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @classmethod
    def generate_json(
        cls,
        prompt: str,
        system_instruction: str = "",
        model: Optional[str] = None,
        require_api_key: bool = True,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Executes a real LLM call against Gemini API requesting structured JSON output.
        Includes automatic retry with backoff and model fallback on transient 503/429 errors.
        """
        import time

        candidate_models = [model] if model else cls.FALLBACK_MODELS
        cache_key = cls._hash_prompt(f"{system_instruction}\n\n{prompt}", candidate_models[0])

        cache = cls._load_cache()
        if use_cache and cache_key in cache:
            return cache[cache_key]

        api_key = cls._get_api_key(require_key=require_api_key)
        if not api_key:
            return {
                "has_violation": False,
                "compliance_score": 85,
                "findings": [],
                "reasoning": "No API key provided."
            }

        last_err: Optional[Exception] = None
        for m_name in candidate_models:
            for attempt in range(3):
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{m_name}:generateContent?key={api_key}"
                payload: Dict[str, Any] = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.1
                    }
                }
                if system_instruction:
                    payload["systemInstruction"] = {
                        "parts": [{"text": system_instruction}]
                    }

                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )

                try:
                    with urllib.request.urlopen(req, timeout=cls.DEFAULT_TIMEOUT_SEC) as resp:
                        resp_data = json.loads(resp.read().decode("utf-8"))
                        candidates = resp_data.get("candidates", [])
                        if not candidates:
                            raise RuntimeError(f"Gemini API returned zero candidates for model {m_name}.")
                        
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if not parts:
                            raise RuntimeError(f"Gemini API candidate has no parts for model {m_name}.")
                        
                        raw_text = parts[0].get("text", "{}")
                        parsed = json.loads(raw_text)

                        if use_cache:
                            cache[cache_key] = parsed
                            cls._save_cache()

                        return parsed

                except urllib.error.HTTPError as e:
                    err_body = e.read().decode("utf-8", errors="replace")
                    last_err = RuntimeError(f"Gemini API HTTP {e.code} error on {m_name}: {err_body}")
                    if e.code in (429, 503):
                        time.sleep(1.0 * (attempt + 1))
                        continue
                    break
                except urllib.error.URLError as e:
                    last_err = RuntimeError(f"Gemini API connection error on {m_name}: {str(e)}")
                    time.sleep(1.0 * (attempt + 1))
                    continue
                except json.JSONDecodeError as e:
                    last_err = RuntimeError(f"Failed to parse JSON response from Gemini API: {str(e)}")
                    break

        if last_err:
            raise last_err
        raise RuntimeError("Gemini API call failed across all candidate models.")

    @classmethod
    def query_zero_shot_auditor(
        cls,
        record_text: str,
        require_api_key: bool = True,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Executes Architecture 0: Pure Zero-Shot LLM Medical Compliance Auditor.
        - NO deterministic rules.
        - NO structured evidence extraction.
        - NO multi-agent domain consensus.
        - NO 2nd-stage adversarial verifier.
        - NO expert rule calibration.
        - NO retrieved synthetic few-shot exemplars.
        """
        system_instruction = (
            "You are an expert medical compliance auditor evaluating an electronic health record. "
            "Your task is to inspect the raw clinical note for standard-of-care adherence, coding integrity, "
            "and documentation completeness. Identify any clinical deficiencies, billing/coding upcoding errors, "
            "or missing prerequisites."
        )

        user_prompt = (
            f"Clinical Record:\n\"\"\"\n{record_text}\n\"\"\"\n\n"
            "Evaluate whether this record has any compliance or standard-of-care violations.\n"
            "Return a strictly valid JSON object with the following schema:\n"
            "{\n"
            '  "has_violation": boolean (true if ANY clinical, billing, or documentation violation is present, else false),\n'
            '  "compliance_score": integer between 0 and 100 (where 100 is fully compliant, and <=70 denotes flagged violations),\n'
            '  "findings": list of strings detailing each violation or omission found,\n'
            '  "reasoning": string summarizing your clinical/billing audit judgment\n'
            "}"
        )

        return cls.generate_json(
            prompt=user_prompt,
            system_instruction=system_instruction,
            require_api_key=require_api_key,
            use_cache=use_cache
        )
