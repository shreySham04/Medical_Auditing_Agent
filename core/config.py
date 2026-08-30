"""
Central configuration and calibration weights for Medical Auditor.
"""

# Multi-Agent Scoring Weights
WEIGHT_CLINICAL = 0.40
WEIGHT_BILLING = 0.30
WEIGHT_DOCUMENTATION = 0.15
WEIGHT_TIMELINE = 0.15

# Audit Recommendation Thresholds
PASS_THRESHOLD = 80
FLAGGED_THRESHOLD = 50

# Knowledge Base Version
REGULATORY_KB_VERSION = "CMS-2026.4 / AMA-CPT-v24.1 (Rule-Grounded Sync)"
PROJECT_FRAMEWORK_TIER = "Research Prototype (Google ADK & MCP Multi-Agent Platform)"
