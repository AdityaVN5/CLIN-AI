# AI Clinical Documentation Assistant

A complete Streamlit MVP for clinical documentation assistance:

**Audio → Groq Whisper → Editable Transcript → SOAP → Compliance → ICD-10 Suggestions → Structured EHR → SQLite → PDF/DOCX/JSON**

## Important

This is a documentation-assistance prototype. It is not a diagnostic or treatment system. Use synthetic data for demonstrations. AI-generated content must be reviewed by a qualified healthcare professional before entering a medical record or making clinical decisions.

## Technology

- Python
- Streamlit
- Groq OpenAI-compatible API
- Whisper Large V3 Turbo
- GPT-OSS 120B + GPT-OSS 20B fallback
- SQLite
- ReportLab
- python-docx
- pytest

Current Groq model IDs are configurable in `.env`. The default IDs in this project are `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `whisper-large-v3-turbo`.

## Architecture

Streamlit UI
→ Voice Agent
→ SOAP Agent
→ Compliance Agent
→ ICD Agent
→ EHR Agent
→ SQLite / exports

## Features

1. Patient information entry.
2. Audio upload and Groq Whisper transcription.
3. Editable transcript.
4. SOAP generation with strict anti-fabrication instructions.
5. Documentation Completeness Score out of 100.
6. ICD-10 suggestions from a clearly labeled small demo dataset.
7. Structured EHR record.
8. SQLite history.
9. PDF, DOCX and JSON export.
10. Graceful API/model/JSON/audio/database failures.
11. Unit tests without a real API key.

## Compliance scoring

70 points are deterministic:
- Subjective 10
- Objective 10
- Assessment 10
- Plan 10
- Diagnosis/clinical impression 10
- Treatment/management plan 10
- Patient history/context 10

The LLM contributes up to 30:
- Completeness 0–20
- Clarity 0–10

Python calculates the final score. The LLM does not directly assign the final 100-point score.

Statuses:
- 85–100: Mostly Complete
- 60–84: Moderately Complete
- 0–59: Incomplete

This is a **Documentation Completeness Score**, not a medical safety or clinical accuracy score.

## Installation

### Windows PowerShell

```powershell
python -m venv venv
.env\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `.env` and set:

```text
GROQ_API_KEY=your_real_key
```

Do not commit `.env`.

### Run

```powershell
streamlit run app.py
```

## Testing

```powershell
pytest -q
```

Tests do not call Groq. They test deterministic application behavior.

## Demo

1. Start Streamlit.
2. Open **Consultation**.
3. Use the preloaded synthetic consultation transcript.
4. Confirm/edit patient ID and synthetic patient information.
5. Open **SOAP Note** and generate the SOAP note.
6. Review/edit the four SOAP sections.
7. Run **Compliance**.
8. Review the Documentation Completeness Score, missing information, warnings and recommendations.
9. Open **ICD Coding** and generate suggestions.
10. Open **EHR Document**.
11. Save the consultation.
12. Download JSON, PDF and DOCX.
13. Open **History** to retrieve the saved consultation.

## Audio

Groq Whisper accepts common formats including WAV, MP3, M4A, MPEG/MPGA, OGG, FLAC and WEBM. Groq currently documents a 100 MB maximum file size for Whisper Large V3 Turbo.

If transcription fails, use the editable manual transcript instead.

## Troubleshooting

### GROQ_API_KEY missing
Copy `.env.example` to `.env` and add your key. Restart Streamlit.

### Model unavailable
Check the configured model ID in `.env`. The application uses a primary/fallback reasoning model. Authentication failures are not endlessly retried.

### Rate limit
Wait and retry. The application does not perform unlimited retries.

### SOAP JSON failure
The application catches malformed model responses. Retry generation.

### ICD returns no suggestions
The included dataset is intentionally a small demo dataset. It is not the complete official ICD-10 database.

### Database error
Make sure the application has write permission to `database/`. Delete `database/app.db` for a clean local demo database.

### PDF/DOCX export error
Run:

```powershell
pip install -r requirements.txt
```

## Security and privacy

- API keys are environment variables.
- `.env` is ignored by Git.
- Application logs do not contain transcripts, names or API keys.
- The included database is local SQLite.
- Use synthetic/de-identified information for development and demos.
- A production deployment requires appropriate healthcare privacy/security controls, access control, encryption, retention policies, audit requirements and organizational review.

## Limitations

- The ICD dataset is a small demonstration dataset.
- Documentation checks are not clinical correctness checks.
- Keyword-based compliance rules are intentionally simple.
- AI output can be wrong and requires professional review.
- The MVP is English-first.
- No vision or TTS dependency is required for the core workflow.

## Future enhancements

- Full licensed ICD-10-CM dataset integration.
- FHIR export.
- Authentication and role-based access.
- Specialty-specific documentation rules.
- Enterprise audit and retention controls.
- Multilingual workflows.
- Optional TTS summary.
- Optional vision/document ingestion.

## License / demo notice

Use according to your organization's software, data, and healthcare compliance requirements.
