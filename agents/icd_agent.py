"""ICD-10 suggestion agent using a small transparent local demo dataset plus Groq."""
from __future__ import annotations
import csv, pathlib
from config import settings
from utils.groq_client import chat_json
from utils.validators import as_string_list
from utils.logging_config import log_event

DATA=pathlib.Path("data/icd10_dataset.csv")

def load_icd_dataset() -> list[dict[str,str]]:
    with DATA.open(encoding="utf-8",newline="") as f: return list(csv.DictReader(f))

def find_candidates(soap_text: str, limit: int=8) -> list[dict[str,str]]:
    text=(soap_text or "").lower()
    rows=load_icd_dataset()
    scored=[]
    for row in rows:
        hits=sum(1 for k in row["keywords"].split(";") if k.strip().lower() in text)
        if hits: scored.append((hits,row))
    scored.sort(key=lambda x:x[0],reverse=True)
    return [r for _,r in scored[:limit]]

def suggest_icd_codes(soap_text: str) -> list[dict[str,str]]:
    if not soap_text or not soap_text.strip(): return []
    candidates=find_candidates(soap_text)
    if not candidates: return []
    if not settings.groq_api_key:
        return [{"code":r["code"],"description":r["description"],"reason":"Keyword match to documented wording; clinician/coder verification required."} for r in candidates]
    candidate_text="\n".join(f'{r["code"]} | {r["description"]} | keywords={r["keywords"]}' for r in candidates)
    try:
        data,_=chat_json([
            {"role":"system","content":"Use only the supplied candidate ICD-10 dataset. Never fabricate codes. Return JSON with suggestions list; each item needs code, description, reason."},
            {"role":"user","content":f"SOAP:\n{soap_text}\n\nCANDIDATES:\n{candidate_text}"},
        ],primary=settings.reasoning_model,fallback=settings.fallback_model,max_tokens=1400)
        allowed={r["code"]:r for r in candidates}
        out=[]
        for item in data.get("suggestions",[]):
            if not isinstance(item,dict) or item.get("code") not in allowed: continue
            r=allowed[item["code"]]
            out.append({"code":r["code"],"description":r["description"],"reason":str(item.get("reason") or "Matches documented information.")})
        return out
    except Exception:
        return []
