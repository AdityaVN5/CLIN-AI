"""Central application configuration for the Groq clinical documentation MVP."""
from __future__ import annotations
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    groq_api_key: str = os.getenv("GROQ_API_KEY", "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")
    reasoning_model: str = os.getenv("GROQ_REASONING_MODEL", "openai/gpt-oss-120b")
    fallback_model: str = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")
    stt_model: str = os.getenv("GROQ_STT_MODEL", "whisper-large-v3-turbo")
    vision_model: str = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
    tts_model: str = os.getenv("GROQ_TTS_MODEL", "canopylabs/orpheus-v1-english")
    safety_model: str = os.getenv("GROQ_SAFETY_MODEL", "openai/gpt-oss-safeguard-20b")
    db_path: str = os.getenv("DB_PATH", "database/app.db")
    groq_base_url: str = "https://api.groq.com/openai/v1"

settings = Settings()
