"""EHR Agent: deterministic structured record assembly."""
from __future__ import annotations
from datetime import datetime, timezone

def build_ehr_record(patient: dict, transcript: str, soap: dict, compliance: dict, icd_codes: list[dict]) -> dict:
    return {
        "patient": {
            "patient_id": patient.get("patient_id",""),
            "patient_name": patient.get("patient_name",""),
            "age": patient.get("age",""),
            "gender": patient.get("gender",""),
        },
        "consultation": {
            "transcript": transcript or "",
            "subjective": soap.get("subjective","Not documented."),
            "objective": soap.get("objective","Not documented."),
            "assessment": soap.get("assessment","Not documented."),
            "plan": soap.get("plan","Not documented."),
        },
        "compliance": {"score": compliance.get("compliance_score",0), "status": compliance.get("status","Incomplete")},
        "icd_codes": [{"code":x.get("code",""),"description":x.get("description",""),"reason":x.get("reason","")} for x in icd_codes],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "AI-generated content is intended for documentation assistance only. It must be reviewed by a qualified healthcare professional before being used in a medical record or for clinical decision-making."
    }
