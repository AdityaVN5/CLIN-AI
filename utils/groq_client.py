"""Reusable Groq OpenAI-compatible client and safe model fallback helpers."""
from __future__ import annotations
import logging
from typing import Any, Callable
from openai import OpenAI
from config import settings

logger = logging.getLogger("clinical_app")

_client: OpenAI | None = None

def get_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured. Add it to .env.")
        _client = OpenAI(api_key=settings.groq_api_key, base_url=settings.groq_base_url, timeout=90.0)
    return _client

def chat_json(messages: list[dict[str, str]], *, primary: str | None = None,
              fallback: str | None = None, max_tokens: int = 2500) -> tuple[dict[str, Any], str]:
    """Call Groq with JSON mode, falling back once for non-auth/model errors."""
    import json
    client = get_client()
    models = [primary or settings.reasoning_model]
    if fallback and fallback not in models:
        models.append(fallback)
    last_exc: Exception | None = None
    for i, model in enumerate(models):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or "{}"
            try:
                return json.loads(raw), model
            except json.JSONDecodeError:
                start, end = raw.find("{"), raw.rfind("}")
                if start >= 0 and end > start:
                    return json.loads(raw[start:end+1]), model
                raise
        except Exception as exc:
            last_exc = exc
            logger.warning("Groq model call failed for configured model (attempt %d).", i + 1)
            # Do not retry authentication failures.
            msg = str(exc).lower()
            if any(x in msg for x in ("401", "invalid api key", "authentication")):
                break
    raise RuntimeError(f"Groq request failed: {type(last_exc).__name__ if last_exc else 'UnknownError'}") from last_exc
