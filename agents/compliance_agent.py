"""
Compliance Agent
=================
Agent 3 in the AI Clinical Documentation Assistant pipeline.

Checks a generated SOAP note for DOCUMENTATION COMPLETENESS AND
QUALITY (not medical/clinical correctness) before the note proceeds
to the ICD Coding Agent and EHR Agent.

Public entry point:

    from agents.compliance_agent import validate_compliance
    result = validate_compliance(soap_note, transcript=None)

`result` is a plain dict (JSON-serializable) — see build_result() for
the exact schema.

Design: two layers.
  Layer 1 — Rule-based checks (deterministic, no LLM call, always run)
  Layer 2 — Groq LLM review (contextual/judgment checks, via Groq's
            OpenAI-compatible API)

If Layer 2 fails for any reason (network, auth, bad JSON, etc.) the
agent falls back to a Layer-1-only result instead of crashing, so the
pipeline never breaks because of an LLM/API issue.

CONFIGURATION
--------------
This file reads its Groq credentials from environment variables —
it never hardcodes an API key. Put your key in a local .env file
(which is git-ignored) as:

    GROQ_API_KEY=your_key_here
    GROQ_MODEL=llama-3.3-70b-versatile

and it will be picked up automatically via python-dotenv.
"""

import os
import re
import json
import logging
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger("compliance_agent")
logger.setLevel(logging.INFO)


# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------

REQUIRED_SECTIONS = ["Subjective", "Objective", "Assessment", "Plan"]

MIN_SECTION_LENGTH = 10  # characters — below this, a section counts as "empty"

PLACEHOLDER_PATTERNS = [
    r"^n/?a$",
    r"^none$",
    r"^-+$",
    r"^\.+$",
    r"^tbd$",
    r"^pending$",
]

DIAGNOSIS_KEYWORDS = [
    "diagnosis", "impression", "likely", "possible", "suspected",
    "consistent with", "differential",
]

TREATMENT_KEYWORDS = [
    "prescribe", "prescribed", "order", "ordered", "follow-up",
    "follow up", "refer", "referral", "test", "medication", "start",
    "continue", "recommend",
]

HISTORY_KEYWORDS = [
    "history", "prior", "previous", "family history", "past medical",
    "pmh", "allerg",
]

# Points-based scoring (out of 100) — programmatic, not LLM-assigned
POINTS = {
    "subjective_present": 10,
    "objective_present": 10,
    "assessment_present": 10,
    "plan_present": 10,
    "diagnosis_present": 10,
    "treatment_present": 10,
    "history_present": 10,
    # remaining 30 points come from the LLM review:
    # completeness_score (0-20) + clarity_score (0-10)
}

STATUS_THRESHOLDS = [
    (85, "Mostly Complete"),
    (60, "Moderately Complete"),
    (0, "Incomplete"),
]

# --- Groq configuration (read from environment only) -----------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


SYSTEM_PROMPT = """You are a clinical documentation completeness reviewer.

Your job is to review a SOAP note for DOCUMENTATION COMPLETENESS and
QUALITY only.

You must strictly follow these rules:
1. Review the provided SOAP note only. Do not use outside medical
   knowledge to add facts that are not in the note or transcript.
2. Check documentation completeness - identify what is present and
   what is missing.
3. Identify unclear, vague, or incomplete statements.
4. NEVER invent patient information, symptoms, history, or findings
   that are not explicitly present in the note or transcript.
5. NEVER modify, reinterpret, or "correct" the original clinical
   information.
6. NEVER provide a new diagnosis or alter the existing diagnosis.
7. NEVER provide treatment advice or recommend a specific treatment.
8. NEVER state or imply that the patient has a specific disease.
9. Do NOT judge whether the doctor's diagnosis or treatment choice is
   medically correct. That is explicitly out of scope.
10. Focus only on documentation quality and completeness.
11. Return your review as a single valid JSON object, in exactly the
    schema given in the user prompt, with no text before or after it.
"""

USER_PROMPT_TEMPLATE = """Review the following SOAP note for documentation completeness.

SOAP NOTE:
\"\"\"
{soap_note}
\"\"\"

CONSULTATION TRANSCRIPT (optional, for cross-checking only):
\"\"\"
{transcript}
\"\"\"

Evaluate ONLY documentation completeness and clarity:

1. completeness_score (0-20): how complete the documentation is,
   given what a standard clinical note would be expected to contain.
2. clarity_score (0-10): how clear and unambiguous the wording is.
3. missing_information: specific items that appear to be missing
   from the documentation (only flag items you can reasonably infer
   are missing from the note/transcript - never invent new items).
4. warnings: vague, ambiguous, contradictory, or very short
   statements that reduce documentation quality.
5. recommendations: concrete, specific suggestions to improve the
   documentation (not treatment recommendations).

Return ONLY this JSON object, with no extra text, no markdown fences,
and nothing before or after it:
{{
  "completeness_score": <integer 0-20>,
  "clarity_score": <integer 0-10>,
  "missing_information": [<string>, ...],
  "warnings": [<string>, ...],
  "recommendations": [<string>, ...]
}}
"""


# ---------------------------------------------------------------------
# Groq client (lazy — only built when actually needed)
# ---------------------------------------------------------------------

def get_llm_client() -> Optional[OpenAI]:
    """
    Builds an OpenAI-compatible client pointed at Groq's API.
    Returns None (instead of raising) if GROQ_API_KEY is missing,
    so the caller can gracefully fall back to rule-based-only results.
    Never reads or logs the key itself — only whether it's set.
    """
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set; LLM review will be skipped.")
        return None

    try:
        return OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
    except Exception as exc:
        logger.error("Failed to create Groq client: %s", exc)
        return None


# ---------------------------------------------------------------------
# Section parsing
# ---------------------------------------------------------------------

def parse_soap_sections(soap_note: str) -> dict:
    """
    Splits raw SOAP note text into {section_name: content} using the
    standard SOAP headers. Missing sections simply won't appear in
    the returned dict.
    """
    if not soap_note or not soap_note.strip():
        return {}

    pattern = (
        r"(Subjective|Objective|Assessment|Plan)\s*:\s*"
        r"(.*?)(?=(?:Subjective|Objective|Assessment|Plan)\s*:|\Z)"
    )
    matches = re.findall(pattern, soap_note, re.IGNORECASE | re.DOTALL)

    sections = {}
    for name, content in matches:
        sections[name.capitalize()] = content.strip()
    return sections


def _is_placeholder(text: str) -> bool:
    normalized = text.strip().lower()
    return any(re.match(pat, normalized) for pat in PLACEHOLDER_PATTERNS)


def _is_meaningful(text: str) -> bool:
    """A section counts as meaningfully filled if it exists, is long
    enough, and isn't just placeholder text like 'N/A' or '---'."""
    if not text:
        return False
    text = text.strip()
    if len(text) < MIN_SECTION_LENGTH:
        return False
    if _is_placeholder(text):
        return False
    return True


# ---------------------------------------------------------------------
# Layer 1 — Rule-based checks
# ---------------------------------------------------------------------

def check_required_sections(sections: dict) -> dict:
    """Checks presence of the 4 mandatory SOAP sections."""
    result = {}
    for name in REQUIRED_SECTIONS:
        result[name.lower()] = _is_meaningful(sections.get(name, ""))
    return result


def check_empty_sections(sections: dict) -> list:
    """Returns a list of section names that exist as headers but are
    empty or placeholder-only (as opposed to fully missing)."""
    empty = []
    for name in REQUIRED_SECTIONS:
        raw = sections.get(name)
        if raw is not None and not _is_meaningful(raw):
            empty.append(name)
    return empty


def check_assessment(sections: dict) -> bool:
    """Checks whether the Assessment section contains a diagnosis or
    clinical-impression keyword."""
    text = sections.get("Assessment", "").lower()
    if not _is_meaningful(sections.get("Assessment", "")):
        return False
    return any(keyword in text for keyword in DIAGNOSIS_KEYWORDS)


def check_plan(sections: dict) -> bool:
    """Checks whether the Plan section contains a treatment/next-step
    keyword."""
    text = sections.get("Plan", "").lower()
    if not _is_meaningful(sections.get("Plan", "")):
        return False
    return any(keyword in text for keyword in TREATMENT_KEYWORDS)


def check_history(sections: dict) -> bool:
    """Checks whether patient history/context appears anywhere in the
    note (commonly documented in Subjective)."""
    combined = " ".join(sections.values()).lower()
    return any(keyword in combined for keyword in HISTORY_KEYWORDS)


def run_rule_based_checks(soap_note: str) -> dict:
    """
    Runs all Layer 1 checks and returns a structured summary:
      - sections: parsed section dict
      - required_sections: {subjective/objective/assessment/plan: bool}
      - empty_sections: list of section names that are empty/placeholder
      - diagnosis_present, treatment_present, history_present: bool
      - points: points earned out of the 70 rule-based points
      - passed_checks / missing_information: human-readable lists
    """
    sections = parse_soap_sections(soap_note)
    required = check_required_sections(sections)
    empty_sections = check_empty_sections(sections)
    diagnosis_present = check_assessment(sections)
    treatment_present = check_plan(sections)
    history_present = check_history(sections)

    passed_checks = []
    missing_information = []

    for name in REQUIRED_SECTIONS:
        if required[name.lower()]:
            passed_checks.append(f"{name} section present")
        else:
            missing_information.append(f"{name} section missing or empty")

    if diagnosis_present:
        passed_checks.append("Diagnosis/assessment information present")
    else:
        missing_information.append("Diagnosis or clinical impression not clearly documented")

    if treatment_present:
        passed_checks.append("Treatment/management plan present")
    else:
        missing_information.append("Treatment or management plan not clearly documented")

    if history_present:
        passed_checks.append("Patient history/context present")
    else:
        missing_information.append("Relevant patient history is not documented")

    points = (
        (POINTS["subjective_present"] if required["subjective"] else 0)
        + (POINTS["objective_present"] if required["objective"] else 0)
        + (POINTS["assessment_present"] if required["assessment"] else 0)
        + (POINTS["plan_present"] if required["plan"] else 0)
        + (POINTS["diagnosis_present"] if diagnosis_present else 0)
        + (POINTS["treatment_present"] if treatment_present else 0)
        + (POINTS["history_present"] if history_present else 0)
    )

    return {
        "sections": sections,
        "required_sections": required,
        "empty_sections": empty_sections,
        "diagnosis_present": diagnosis_present,
        "treatment_present": treatment_present,
        "history_present": history_present,
        "points": points,  # out of 70
        "passed_checks": passed_checks,
        "missing_information": missing_information,
    }


# ---------------------------------------------------------------------
# Layer 2 — Groq LLM review
# ---------------------------------------------------------------------

def _extract_json(raw_content: str) -> dict:
    """
    Groq models don't always honor response_format as strictly as
    Azure OpenAI does — this strips markdown code fences / stray text
    around the JSON object before parsing, so a slightly chatty
    response doesn't blow up json.loads().
    """
    text = raw_content.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).strip()
        text = re.sub(r"```$", "", text).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)


def run_llm_review(soap_note: str, transcript: Optional[str] = None) -> dict:
    """
    Calls Groq for the contextual completeness/clarity review.
    Always returns a dict with the expected keys, even on failure —
    callers never need to special-case an exception here.
    """
    fallback = {
        "completeness_score": 10,  # neutral mid-point out of 20
        "clarity_score": 5,        # neutral mid-point out of 10
        "missing_information": [],
        "warnings": [],
        "recommendations": [],
        "llm_available": False,
    }

    client = get_llm_client()
    if client is None:
        return fallback

    user_prompt = USER_PROMPT_TEMPLATE.format(
        soap_note=soap_note or "",
        transcript=transcript or "(no transcript provided)",
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw_content = response.choices[0].message.content
        parsed = _extract_json(raw_content)

        return {
            "completeness_score": int(parsed.get("completeness_score", 10)),
            "clarity_score": int(parsed.get("clarity_score", 5)),
            "missing_information": parsed.get("missing_information", []) or [],
            "warnings": parsed.get("warnings", []) or [],
            "recommendations": parsed.get("recommendations", []) or [],
            "llm_available": True,
        }

    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Groq returned unparseable JSON: %s", exc)
        fallback["warnings"] = ["LLM review returned an unparseable response; using rule-based result only."]
        return fallback

    except Exception as exc:
        logger.error("Groq call failed: %s", exc)
        fallback["warnings"] = [f"LLM review unavailable ({type(exc).__name__}); using rule-based result only."]
        return fallback


# ---------------------------------------------------------------------
# Scoring + result assembly
# ---------------------------------------------------------------------

def calculate_score(rule_result: dict, llm_result: dict) -> int:
    """
    Programmatic scoring out of 100:
      Subjective / Objective / Assessment / Plan  -> 10 pts each (40)
      Diagnosis present / Treatment present / History present -> 10 pts each (30)
      LLM completeness_score (0-20) + clarity_score (0-10)     -> (30)
    Total = 100. The score is NEVER assigned directly by the LLM —
    the LLM only contributes the completeness/clarity sub-scores,
    which are added programmatically here.
    """
    rule_points = rule_result["points"]  # out of 70
    llm_points = llm_result["completeness_score"] + llm_result["clarity_score"]  # out of 30
    total = rule_points + llm_points
    return max(0, min(100, round(total)))


def status_from_score(score: int) -> str:
    for threshold, label in STATUS_THRESHOLDS:
        if score >= threshold:
            return label
    return "Incomplete"


def build_result(rule_result: dict, llm_result: dict) -> dict:
    score = calculate_score(rule_result, llm_result)

    missing_information = list(rule_result["missing_information"])
    for item in llm_result.get("missing_information", []):
        if item not in missing_information:
            missing_information.append(item)

    warnings = list(llm_result.get("warnings", []))
    if rule_result["empty_sections"]:
        warnings.append(
            "Empty or placeholder-only section(s) detected: "
            + ", ".join(rule_result["empty_sections"])
        )

    recommendations = list(llm_result.get("recommendations", []))
    if not rule_result["history_present"] and "Add relevant patient history if available" not in recommendations:
        recommendations.append("Add relevant patient history if available")
    if not rule_result["diagnosis_present"] and "Document a clear diagnosis or clinical impression in the Assessment" not in recommendations:
        recommendations.append("Document a clear diagnosis or clinical impression in the Assessment")
    if not rule_result["treatment_present"] and "Document a clear treatment or follow-up plan" not in recommendations:
        recommendations.append("Document a clear treatment or follow-up plan")

    return {
        "compliance_score": score,
        "status": status_from_score(score),
        "required_sections": rule_result["required_sections"],
        "passed_checks": rule_result["passed_checks"],
        "missing_information": missing_information,
        "warnings": warnings,
        "recommendations": recommendations,
        "llm_available": llm_result.get("llm_available", False),
    }


def empty_input_result() -> dict:
    """Returned when the SOAP note is empty/whitespace-only — avoids
    running any checks against nothing."""
    return {
        "compliance_score": 0,
        "status": "Incomplete",
        "required_sections": {name.lower(): False for name in REQUIRED_SECTIONS},
        "passed_checks": [],
        "missing_information": [f"{name} section missing or empty" for name in REQUIRED_SECTIONS],
        "warnings": ["No SOAP note content was provided."],
        "recommendations": ["Generate or enter a SOAP note before running the compliance check."],
        "llm_available": False,
    }


# ---------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------

def validate_compliance(soap_note: str, transcript: Optional[str] = None) -> dict:
    """
    Main entry point for the Compliance Agent.

    Args:
        soap_note: the generated SOAP note text (required)
        transcript: optional raw consultation transcript, used only
                    by the LLM layer for cross-checking completeness

    Returns:
        A JSON-serializable dict:
        {
            "compliance_score": int (0-100),
            "status": str,
            "required_sections": {"subjective": bool, "objective": bool,
                                   "assessment": bool, "plan": bool},
            "passed_checks": [str, ...],
            "missing_information": [str, ...],
            "warnings": [str, ...],
            "recommendations": [str, ...],
            "llm_available": bool
        }
    """
    if not soap_note or not soap_note.strip():
        return empty_input_result()

    try:
        rule_result = run_rule_based_checks(soap_note)
    except Exception as exc:
        logger.error("Rule-based validation failed unexpectedly: %s", exc)
        result = empty_input_result()
        result["warnings"] = [f"Rule-based validation failed: {exc}"]
        return result

    llm_result = run_llm_review(soap_note, transcript)

    return build_result(rule_result, llm_result)


# ---------------------------------------------------------------------
# Manual/local test run: `python agents/compliance_agent.py`
# ---------------------------------------------------------------------

if __name__ == "__main__":
    sample_note = """
    Subjective:
    Patient complains of chest pain for 2 days.

    Objective:
    BP 140/90
    Pulse 95

    Assessment:
    Possible angina.

    Plan:
    ECG and blood tests.
    """
    print(json.dumps(validate_compliance(sample_note), indent=2))
