"""SOAP Note Agent: transcript to structured SOAP JSON."""
from __future__ import annotations
import json, pathlib
from utils.groq_client import chat_json
from utils.validators import as_string
from config import settings
from utils.logging_config import log_event

PROMPT = pathlib.Path("prompts/soap_prompt.txt").read_text(encoding="utf-8")

def generate_soap(transcript: str) -> dict[str, str]:
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty.")
    messages=[
        {"role":"system","content":PROMPT},
        {"role":"user","content":transcript.strip()},
    ]
    data, _ = chat_json(messages, primary=settings.reasoning_model, fallback=settings.fallback_model, max_tokens=2200)
    required=("subjective","objective","assessment","plan")
    result={k: as_string(data.get(k), "Not documented.") or "Not documented." for k in required}
    log_event("soap", "generation", "success")
    return result

def soap_to_text(soap: dict[str,str]) -> str:
    return "\n\n".join(f"{k.title()}:\n{soap.get(k,'Not documented.')}" for k in ("subjective","objective","assessment","plan"))
