"""SQLite persistence layer. SQL stays out of the Streamlit UI."""
from __future__ import annotations
import json, sqlite3
from contextlib import contextmanager
from pathlib import Path
from config import settings

def _ensure_parent():
    Path(settings.db_path).parent.mkdir(parents=True, exist_ok=True)

@contextmanager
def get_connection():
    _ensure_parent()
    conn=sqlite3.connect(settings.db_path)
    conn.row_factory=sqlite3.Row
    try: yield conn
    finally: conn.close()

def init_db():
    schema=Path("database/schema.sql").read_text(encoding="utf-8")
    with get_connection() as conn: conn.executescript(schema); conn.commit()

def save_patient(patient: dict):
    with get_connection() as c:
        c.execute("""INSERT INTO patients(patient_id,patient_name,gender,age) VALUES(?,?,?,?)
                     ON CONFLICT(patient_id) DO UPDATE SET patient_name=excluded.patient_name,gender=excluded.gender,age=excluded.age""",
                  (patient["patient_id"],patient.get("patient_name",""),patient.get("gender",""),patient.get("age") or None))
        c.commit()

def save_consultation(patient_id: str, transcript: str, soap_note: str) -> int:
    with get_connection() as c:
        cur=c.execute("INSERT INTO consultations(patient_id,transcript,soap_note) VALUES(?,?,?)",(patient_id,transcript,soap_note))
        c.commit(); return int(cur.lastrowid)

def save_compliance_result(consultation_id: int, result: dict) -> int:
    with get_connection() as c:
        cur=c.execute("""INSERT INTO compliance_results(consultation_id,compliance_score,status,required_sections,passed_checks,missing_information,warnings,recommendations,llm_available)
                         VALUES(?,?,?,?,?,?,?,?,?)""",(consultation_id,result["compliance_score"],result["status"],json.dumps(result["required_sections"]),json.dumps(result["passed_checks"]),json.dumps(result["missing_information"]),json.dumps(result["warnings"]),json.dumps(result["recommendations"]),int(result.get("llm_available",False))))
        c.commit(); return int(cur.lastrowid)

def save_icd_codes(consultation_id: int, codes: list[dict]):
    with get_connection() as c:
        for x in codes:
            c.execute("INSERT INTO icd_codes(consultation_id,icd_code,description,reason) VALUES(?,?,?,?)",(consultation_id,x.get("code",""),x.get("description",""),x.get("reason","")))
        c.commit()

def save_audit_log(consultation_id: int|None, agent_name: str, action: str, status: str):
    with get_connection() as c:
        c.execute("INSERT INTO audit_logs(consultation_id,agent_name,action,status) VALUES(?,?,?,?)",(consultation_id,agent_name,action,status)); c.commit()

def get_consultations(limit: int=100):
    with get_connection() as c:
        return [dict(r) for r in c.execute("""SELECT c.*, COALESCE(cr.compliance_score,0) score, COALESCE(cr.status,'Not processed') status
                                              FROM consultations c LEFT JOIN compliance_results cr ON cr.consultation_id=c.consultation_id
                                              WHERE cr.compliance_id IS NULL OR cr.compliance_id=(SELECT MAX(cr2.compliance_id) FROM compliance_results cr2 WHERE cr2.consultation_id=c.consultation_id)
                                              ORDER BY c.created_date DESC LIMIT ?""",(limit,)).fetchall()]

def get_consultation(consultation_id: int):
    with get_connection() as c:
        r=c.execute("""SELECT c.*,p.patient_name,p.age,p.gender FROM consultations c JOIN patients p ON p.patient_id=c.patient_id WHERE c.consultation_id=?""",(consultation_id,)).fetchone()
        return dict(r) if r else None

def get_compliance_result(consultation_id: int):
    with get_connection() as c:
        r=c.execute("SELECT * FROM compliance_results WHERE consultation_id=? ORDER BY compliance_id DESC LIMIT 1",(consultation_id,)).fetchone()
    if not r:return None
    d=dict(r)
    for k in ("required_sections","passed_checks","missing_information","warnings","recommendations"): d[k]=json.loads(d[k] or "null")
    return d

def get_icd_codes(consultation_id: int):
    with get_connection() as c:return [dict(r) for r in c.execute("SELECT * FROM icd_codes WHERE consultation_id=? ORDER BY code_id",(consultation_id,)).fetchall()]

def get_next_patient_id(prefix: str = "DEMO-") -> str:
    import re
    with get_connection() as c:
        rows = c.execute("SELECT patient_id FROM patients UNION SELECT patient_id FROM consultations").fetchall()
    
    max_num = 0
    pattern = re.compile(rf"{re.escape(prefix)}(\d+)", re.IGNORECASE)
    
    for r in rows:
        pid = r["patient_id"] or ""
        match = pattern.search(pid)
        if match:
            try:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
            except ValueError:
                pass

    if max_num == 0:
        fallback_pattern = re.compile(r"(\d+)")
        for r in rows:
            pid = r["patient_id"] or ""
            match = fallback_pattern.search(pid)
            if match:
                try:
                    num = int(match.group(1))
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass

    next_num = max_num + 1
    return f"{prefix}{next_num:03d}"

def delete_consultation(consultation_id: int):
    with get_connection() as c:
        c.execute("DELETE FROM compliance_results WHERE consultation_id=?", (consultation_id,))
        c.execute("DELETE FROM icd_codes WHERE consultation_id=?", (consultation_id,))
        c.execute("DELETE FROM audit_logs WHERE consultation_id=?", (consultation_id,))
        c.execute("DELETE FROM consultations WHERE consultation_id=?", (consultation_id,))
        c.commit()
