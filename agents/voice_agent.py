"""Voice Agent: Groq Whisper transcription, independent of Streamlit."""
from __future__ import annotations
import os, tempfile
from typing import BinaryIO
from utils.groq_client import get_client
from config import settings
from utils.logging_config import log_event

SUPPORTED = {".mp3",".wav",".m4a",".mp4",".mpeg",".mpga",".ogg",".webm",".flac"}

def transcribe_audio(audio_file: BinaryIO, filename: str = "audio.wav") -> str:
    if audio_file is None:
        raise ValueError("No audio file was supplied.")
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in SUPPORTED:
        raise ValueError(f"Unsupported audio format: {ext or 'unknown'}. Supported: {', '.join(sorted(SUPPORTED))}")
    data = audio_file.read()
    if not data:
        raise ValueError("The uploaded audio file is empty.")
    if len(data) > 100 * 1024 * 1024:
        raise ValueError("Audio file exceeds Groq's 100 MB limit.")
    suffix = ext or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    path = tmp.name
    try:
        tmp.write(data); tmp.close()
        with open(path, "rb") as f:
            result = get_client().audio.transcriptions.create(
                model=settings.stt_model, file=f, response_format="text"
            )
        text = str(result).strip()
        if not text:
            raise RuntimeError("Whisper returned an empty transcript.")
        log_event("voice", "transcription", "success")
        return text
    except Exception as exc:
        log_event("voice", "transcription", "failure")
        raise RuntimeError(f"Audio transcription failed: {type(exc).__name__}. You can use a manual transcript instead.") from exc
    finally:
        try:
            os.remove(path)
        except OSError:
            _ = path
