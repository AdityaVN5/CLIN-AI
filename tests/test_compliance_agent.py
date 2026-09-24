from agents.compliance_agent import validate_compliance, parse_soap_sections, check_required_sections

COMPLETE="""Subjective:
Patient complains of chest pain for 2 days. Prior history documented.

Objective:
BP 140/90 and pulse 95.

Assessment:
Possible angina.

Plan:
ECG ordered and follow-up in 3 days."""

def test_complete_note():
    r=validate_compliance(COMPLETE)
    assert all(r["required_sections"].values())
    assert r["compliance_score"]>=60

def test_missing_sections():
    r=validate_compliance("Objective:\nBP 120/80\n\nPlan:\nFollow-up tomorrow.")
    assert not r["required_sections"]["subjective"]
    assert not r["required_sections"]["assessment"]

def test_empty_input():
    r=validate_compliance("")
    assert r["compliance_score"]==0
    assert r["status"]=="Incomplete"

def test_parser():
    s=parse_soap_sections("Subjective:\nPatient has pain for two days.\n\nPlan:\nFollow-up tomorrow.")
    assert check_required_sections(s)["subjective"]
    assert not check_required_sections(s)["objective"]
