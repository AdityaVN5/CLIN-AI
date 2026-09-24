"""Validation and normalization helpers for model-generated JSON."""
from __future__ import annotations
from typing import Any

def as_string(value: Any, default: str = "") -> str:
    return value.strip() if isinstance(value, str) else default

def as_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(x).strip() for x in value if str(x).strip()]

def clamp_int(value: Any, low: int, high: int, default: int) -> int:
    try:
        return max(low, min(high, int(value)))
    except (TypeError, ValueError):
        return default
