"""Streamlit front end for the complete clinical documentation workflow."""
from __future__ import annotations
import json, time
import pandas as pd
import streamlit as st
from config import settings
import database.db, importlib
importlib.reload(database.db)
from database.db import init_db, save_patient, save_consultation, save_compliance_result, save_icd_codes, save_audit_log, get_consultations, get_consultation, get_compliance_result, get_icd_codes, get_next_patient_id, delete_consultation
from agents.voice_agent import transcribe_audio
from agents.soap_agent import generate_soap, soap_to_text
from agents.compliance_agent import validate_compliance
from agents.icd_agent import suggest_icd_codes
from agents.ehr_agent import build_ehr_record
from utils.export import export_json, export_pdf, export_docx
from utils.logging_config import configure_logging

configure_logging()
init_db()
DISCLAIMER="AI-generated content is intended for documentation assistance only. It must be reviewed by a qualified healthcare professional before being used in a medical record or for clinical decision-making."

st.set_page_config(page_title="AI Clinical Documentation Assistant",page_icon="🩺",layout="wide")
st.markdown("""<style>
.block-container{padding-top:1.5rem}.card{padding:1rem;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:1rem;background:#fff}
.small{color:#64748b;font-size:.9rem}
.pipeline-wrapper {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
    margin-bottom: 1rem;
    color: #f8fafc;
}
.pipeline-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    overflow-x: auto;
}
.flow-step-card {
    flex: 1;
    min-width: 110px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.75rem 0.5rem;
    text-align: center;
    transition: all 0.25s ease;
}
.flow-step-card:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(59, 130, 246, 0.5);
}
.step-num-badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #94a3b8;
}
.step-icon-lg {
    font-size: 1.6rem;
    margin: 0.2rem 0;
    line-height: 1;
}
.step-title-txt {
    font-size: 0.85rem;
    font-weight: 600;
    color: #f1f5f9;
    white-space: nowrap;
}
.step-sub-txt {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-bottom: 0.4rem;
    white-space: nowrap;
}
.status-pill {
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
}
.status-complete { border-color: rgba(16, 185, 129, 0.4); }
.status-complete .status-pill { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-active { border-color: rgba(59, 130, 246, 0.4); }
.status-active .status-pill { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.status-pending .status-pill { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
.flow-arrow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #38bdf8;
    font-size: 1.3rem;
    font-weight: bold;
    padding: 0 0.1rem;
}
</style>""",unsafe_allow_html=True)

DEFAULT_TRANSCRIPT="""Doctor: What brings you in today?
Patient: I've had chest discomfort for two days, especially when walking.
Doctor: Any previous heart problems?
Patient: No previous heart problems that I know of.
Doctor: We'll record your blood pressure and pulse.
Doctor: Blood pressure is 140/90 and pulse is 95.
Doctor: We'll arrange an ECG and blood tests."""

def init_state():
    defaults={"page":"🏠 Dashboard","patient_id":get_next_patient_id(),"patient_name":"","age":None,"gender":"Not specified","transcript":"","soap":None,"compliance":None,"icd":[],"ehr":None,"consultation_id":None,"saved":False}
    for k,v in defaults.items(): st.session_state.setdefault(k,v)
init_state()

def reset_workflow():
    for k in ("patient_name","age","transcript","soap","compliance","icd","ehr","consultation_id"): st.session_state[k] = "" if k in ("patient_name","transcript") else None
    st.session_state["patient_id"]=get_next_patient_id(); st.session_state["gender"]="Not specified"; st.session_state["icd"]=[]; st.session_state["saved"]=False

nav_items = [
    ("🏠 Dashboard", "Dashboard"),
    ("🎙 Consultation", "Consultation"),
    ("📝 SOAP Note", "SOAP Note"),
    ("✅ Compliance", "Compliance"),
    ("🏷 ICD Coding", "ICD Coding"),
    ("📋 EHR Document", "EHR Document"),
    ("🗄 History", "History"),
    ("⚙ Settings", "Settings")
]

with st.sidebar:
    st.title("🩺 Clinical AI")
    st.caption("Documentation assistant • Groq + SQLite")
    st.markdown("#### Navigation")
    
    current_page = st.session_state.get("page", "🏠 Dashboard")
    for label, name in nav_items:
        is_active = (current_page == label)
        if st.button(label, key=f"nav_btn_{name}", use_container_width=True, type="primary" if is_active else "secondary"):
            st.session_state["page"] = label
            st.rerun()

    st.divider()
    
    # Progress tracker badge
    completed_steps = sum([
        1 if st.session_state.transcript.strip() else 0,
        1 if st.session_state.soap else 0,
        1 if st.session_state.compliance else 0,
        1 if st.session_state.icd else 0,
        1 if st.session_state.saved else 0
    ])
    st.caption(f"Workflow Progress: **{completed_steps}/5** steps completed")
    st.progress(completed_steps / 5.0)
    
    st.caption("Synthetic/demo data recommended during development.")
    if st.button("Clear Current Workflow", use_container_width=True): reset_workflow(); st.session_state["page"]="🏠 Dashboard"; st.rerun()

def metric_dashboard():
    rows=get_consultations(500)
    total=len(rows); completed=sum(1 for r in rows if r["status"]!="Incomplete" and r["status"]!="Not processed")
    scores=[r["score"] for r in rows if r["score"] is not None]
    avg=round(sum(scores)/len(scores),1) if scores else 0
    incomplete=sum(1 for r in rows if r["score"]<60)
    a,b,c,d=st.columns(4); a.metric("Total consultations",total); b.metric("Average completeness",f"{avg}/100"); c.metric("Processed",completed); d.metric("Incomplete",incomplete)

def render_pipeline_flow():
    has_transcript = bool(st.session_state.get("transcript", "").strip())
    has_soap = bool(st.session_state.get("soap"))
    has_compliance = bool(st.session_state.get("compliance"))
    has_icd = bool(st.session_state.get("icd"))
    is_saved = bool(st.session_state.get("saved"))

    steps = [
        {"num": "01", "icon": "🎙️", "title": "Audio STT", "sub": "Voice Input", "class": "status-complete" if has_transcript else "status-active", "page": "🎙 Consultation"},
        {"num": "02", "icon": "📝", "title": "Transcript", "sub": "Text Review", "class": "status-complete" if has_transcript else "status-pending", "page": "🎙 Consultation"},
        {"num": "03", "icon": "📄", "title": "SOAP Note", "sub": "AI Structure", "class": "status-complete" if has_soap else ("status-active" if has_transcript else "status-pending"), "page": "📝 SOAP Note"},
        {"num": "04", "icon": "✅", "title": "Compliance", "sub": "Audit Check", "class": "status-complete" if has_compliance else ("status-active" if has_soap else "status-pending"), "page": "✅ Compliance"},
        {"num": "05", "icon": "🏷️", "title": "ICD-10", "sub": "Code Suggest", "class": "status-complete" if has_icd else ("status-active" if has_soap else "status-pending"), "page": "🏷 ICD Coding"},
        {"num": "06", "icon": "📋", "title": "EHR Record", "sub": "Export & DB", "class": "status-complete" if is_saved else ("status-active" if (has_soap and has_compliance) else "status-pending"), "page": "📋 EHR Document"}
    ]

    flow_html = '<div class="pipeline-wrapper"><div class="pipeline-flow">'
    for i, s in enumerate(steps):
        flow_html += f'<div class="flow-step-card {s["class"]}">'
        flow_html += f'<div class="step-num-badge">STEP {s["num"]}</div>'
        flow_html += f'<div class="step-icon-lg">{s["icon"]}</div>'
        flow_html += f'<div class="step-title-txt">{s["title"]}</div>'
        flow_html += f'<div class="step-sub-txt">{s["sub"]}</div></div>'
        if i < len(steps) - 1:
            flow_html += '<div class="flow-arrow-container">➔</div>'
    flow_html += '</div></div>'
    st.markdown(flow_html, unsafe_allow_html=True)

    # Interactive step buttons
    fcols = st.columns(6)
    for fc, step in zip(fcols, steps):
        if fc.button(f"{step['icon']} {step['title']}", key=f"flow_btn_{step['num']}", use_container_width=True):
            st.session_state["page"] = step["page"]
            st.rerun()

def show_dashboard():
    st.title("🏠 Dashboard"); st.caption("End-to-end clinical documentation workflow")
    metric_dashboard()
    st.subheader("⚡ Clinical Workflow Pipeline")
    render_pipeline_flow()
    st.subheader("Recent consultations")
    rows=get_consultations(10)
    if rows: st.dataframe(pd.DataFrame(rows)[["consultation_id","patient_id","created_date","score","status"]],use_container_width=True,hide_index=True)
    else: st.info("No consultations saved yet.")

def show_consultation():
    st.title("🎙 Consultation")
    a,b,c=st.columns(3)
    with a:
        if not st.session_state.patient_id:
            st.session_state.patient_id = get_next_patient_id()
        st.session_state.patient_id=st.text_input("Patient ID", st.session_state.patient_id)
    with b:
        st.session_state.patient_name=st.text_input("Patient name", st.session_state.patient_name or "", placeholder="Enter patient name")
    with c:
        val = int(st.session_state.age) if st.session_state.age is not None else None
        st.session_state.age=st.number_input("Age", min_value=0, max_value=120, value=val, placeholder="Enter patient age")
    
    current_gender = st.session_state.gender if st.session_state.gender in ["Not specified","Female","Male","Other"] else "Not specified"
    st.session_state.gender=st.selectbox("Gender", ["Not specified","Female","Male","Other"], index=["Not specified","Female","Male","Other"].index(current_gender))
    st.divider()
    audio=st.file_uploader("Upload consultation audio",type=["mp3","wav","m4a","mp4","mpeg","mpga","ogg","webm","flac"])
    if audio and st.button("🎙 Transcribe Audio",type="primary"):
        try:
            with st.spinner("Transcribing with Groq Whisper..."): st.session_state.transcript=transcribe_audio(audio,audio.name)
            st.success("Transcription completed.")
        except Exception as e: st.error(str(e))
    
    col_t1, col_t2 = st.columns([3, 1])
    with col_t1:
        st.markdown("**Editable Transcript**")
    with col_t2:
        if st.button("📋 Load Sample Transcript", use_container_width=True):
            st.session_state.patient_name = "Synthetic Patient"
            st.session_state.age = 45
            st.session_state.transcript = DEFAULT_TRANSCRIPT
            st.rerun()

    st.session_state.transcript=st.text_area("Transcript Text", st.session_state.transcript or "", height=280, placeholder="Upload an audio file above or paste/type the clinical consultation transcript here...", label_visibility="collapsed")
    st.divider()
    if st.button("Use Transcript & Continue to SOAP Note ➔",type="primary"):
        if not st.session_state.transcript.strip(): st.error("Transcript cannot be empty.")
        else:
            st.session_state["page"] = "📝 SOAP Note"
            st.rerun()

def show_soap():
    st.title("📝 SOAP Note")
    if not st.session_state.transcript.strip(): st.warning("Add a transcript on the Consultation page first."); return
    if st.button("Generate SOAP Note",type="primary"):
        try:
            with st.spinner("Generating SOAP note..."): st.session_state.soap=generate_soap(st.session_state.transcript)
            st.success("SOAP note generated. Review and edit before continuing.")
        except Exception as e: st.error(f"SOAP generation failed: {e}")
    if st.session_state.soap:
        for k in ("subjective","objective","assessment","plan"):
            st.session_state.soap[k]=st.text_area(k.title(),st.session_state.soap.get(k,""),height=120,key=f"soap_{k}")
        st.divider()
        if st.button("Validate & Continue to Compliance Check ➔",type="primary"):
            st.session_state.compliance=validate_compliance(soap_to_text(st.session_state.soap),st.session_state.transcript)
            st.session_state["page"] = "✅ Compliance"
            st.rerun()
    else: st.info("Click Generate SOAP Note.")

def show_compliance():
    st.title("✅ Compliance")

    # Run compliance validation
    if not st.session_state.compliance and st.session_state.soap:
        if st.button("Run Compliance Validation", type="primary"):
            st.session_state.compliance = validate_compliance(
                soap_to_text(st.session_state.soap),
                st.session_state.transcript
            )

    result = st.session_state.compliance

    if not result:
        st.info("Generate SOAP and run validation first.")
        return

    # ---------------------------------------------------------
    # Score
    # ---------------------------------------------------------
    score = result["compliance_score"]

    st.metric(
        "Documentation Completeness Score",
        f"{score}/100",
        result["status"]
    )

    st.progress(score / 100)

    st.caption(
        "This score evaluates documentation completeness and clarity. "
        "It does not assess clinical correctness and does not replace "
        "clinician review."
    )

    # Status
    if score >= 85:
        st.success(result["status"])
    elif score >= 60:
        st.warning(result["status"])
    else:
        st.error(result["status"])

    # ---------------------------------------------------------
    # Required SOAP Sections
    # ---------------------------------------------------------
    st.subheader("Required Sections")

    cs = st.columns(4)

    for c, k in zip(
        cs,
        ["subjective", "objective", "assessment", "plan"]
    ):
        if result["required_sections"].get(k):
            c.success(f"✓ {k.title()}")
        else:
            c.error(f"✗ {k.title()}")

    # ---------------------------------------------------------
    # Compliance Details
    # ---------------------------------------------------------
    sections = [
        ("Passed Checks", "passed_checks"),
        ("Missing Information", "missing_information"),
        ("Warnings", "warnings"),
        ("Recommendations", "recommendations"),
    ]

    for title, key in sections:

        with st.expander(
            title,
            expanded=(key != "passed_checks")
        ):

            vals = result.get(key, [])

            # Make sure the value is actually a list
            if not isinstance(vals, list):
                vals = [vals]

            # Remove None / NULL values
            vals = [
                str(item).strip()
                for item in vals
                if item is not None and str(item).strip()
            ]

            if vals:
                for item in vals:
                    st.markdown(f"- {item}")
            else:
                st.caption("None.")

    # ---------------------------------------------------------
    # LLM Status
    # ---------------------------------------------------------
    if result.get("llm_available", False):
        st.caption("LLM contextual review: available")
    else:
        st.caption(
            "LLM contextual review: unavailable; "
            "rule-based validation remains active."
        )
    st.divider()
    if st.button("Continue to ICD-10 Coding ➔", type="primary"):
        st.session_state["page"] = "🏷 ICD Coding"
        st.rerun()

def show_icd():
    st.title("🏷 ICD Coding")
    if not st.session_state.soap: st.warning("Generate SOAP first."); return
    if st.button("Generate ICD-10 Suggestions",type="primary"):
        with st.spinner("Searching demo ICD-10 dataset and reviewing candidates..."): st.session_state.icd=suggest_icd_codes(soap_to_text(st.session_state.soap))
    if st.session_state.icd:
        st.dataframe(pd.DataFrame(st.session_state.icd),use_container_width=True,hide_index=True)
    else: st.info("No reliable ICD-10 suggestion found from the demo dataset.")
    st.warning("ICD-10 suggestions require clinician/coder verification.")
    st.divider()
    if st.button("Continue to EHR Document ➔", type="primary"):
        st.session_state["page"] = "📋 EHR Document"
        st.rerun()

def build_current_ehr():
    if not st.session_state.soap or not st.session_state.compliance: return None
    patient={"patient_id":st.session_state.patient_id,"patient_name":st.session_state.patient_name,"age":st.session_state.age,"gender":st.session_state.gender}
    return build_ehr_record(patient,st.session_state.transcript,st.session_state.soap,st.session_state.compliance,st.session_state.icd)

def show_ehr():
    st.title("📋 EHR Document")
    record=build_current_ehr()
    if not record: st.info("Complete SOAP and Compliance first."); return
    st.session_state.ehr=record
    p=record["patient"]; st.subheader("Patient Information"); st.json(p)
    st.subheader("SOAP Note")
    for k in ("subjective","objective","assessment","plan"): st.markdown(f"**{k.title()}**\n\n{record['consultation'][k]}")
    st.subheader("Compliance"); st.metric("Score",f"{record['compliance']['score']}/100",record["compliance"]["status"])
    st.subheader("ICD-10"); st.dataframe(pd.DataFrame(record["icd_codes"]) if record["icd_codes"] else pd.DataFrame([{"code":"—","description":"No reliable suggestion","reason":"Verification required"}]),use_container_width=True,hide_index=True)
    if st.button("💾 Save Consultation",type="primary"):
        try:
            save_patient(p); cid=save_consultation(p["patient_id"],record["consultation"]["transcript"],soap_to_text(st.session_state.soap))
            save_compliance_result(cid,st.session_state.compliance); save_icd_codes(cid,st.session_state.icd)
            for agent in ["Voice Agent","SOAP Agent","Compliance Agent","ICD Agent","EHR Agent"]: save_audit_log(cid,agent,"completed","success")
            st.session_state.consultation_id=cid; st.session_state.saved=True; st.success(f"Saved consultation #{cid}.")
        except Exception as e: st.error(f"Database save failed: {type(e).__name__}")
    st.download_button("Download JSON",export_json(record),file_name="clinical_record.json",mime="application/json")
    st.download_button("Download PDF",export_pdf(record),file_name="clinical_record.pdf",mime="application/pdf")
    st.download_button("Download DOCX",export_docx(record),file_name="clinical_record.docx",mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    st.info(DISCLAIMER)

def show_history():
    st.title("🗄 History")
    st.caption("Browse, inspect, and manage saved clinical documentation records")
    rows=get_consultations(100)
    if not rows:
        st.info("No saved consultations found in database.")
        return
    df=pd.DataFrame(rows)
    st.dataframe(df[["consultation_id","patient_id","created_date","score","status"]],use_container_width=True,hide_index=True)
    
    st.divider()
    col_sel, col_del = st.columns([3, 1])
    with col_sel:
        cid = st.selectbox("Select Consultation Record", df["consultation_id"].tolist())
    with col_del:
        st.write("")
        st.write("")
        if st.button("🗑️ Delete Consultation", type="secondary", use_container_width=True):
            st.session_state[f"confirm_del_{cid}"] = True

    if cid and st.session_state.get(f"confirm_del_{cid}"):
        st.warning(f"⚠️ Are you sure you want to permanently delete Consultation #{cid}?")
        c_yes, c_no = st.columns(2)
        if c_yes.button("✅ Confirm Delete", type="primary", use_container_width=True):
            delete_consultation(int(cid))
            st.session_state.pop(f"confirm_del_{cid}", None)
            st.success(f"Consultation #{cid} deleted from database.")
            st.rerun()
        if c_no.button("❌ Cancel", use_container_width=True):
            st.session_state.pop(f"confirm_del_{cid}", None)
            st.rerun()

    if cid:
        c=get_consultation(int(cid)); comp=get_compliance_result(int(cid)); icd=get_icd_codes(int(cid))
        tab1, tab2, tab3, tab4 = st.tabs(["📝 Transcript", "📄 SOAP Note", "✅ Compliance Audit", "🏷️ ICD Codes"])
        with tab1:
            st.text_area("Original Transcript", c["transcript"] if c else "", height=200, disabled=True)
        with tab2:
            st.code(c["soap_note"] if c else "", language="markdown")
        with tab3:
            st.json(comp or {})
        with tab4:
            st.dataframe(pd.DataFrame(icd) if icd else pd.DataFrame([{"info": "No codes stored"}]), use_container_width=True, hide_index=True)

def show_settings():
    st.title("⚙ Settings & System Configuration")
    st.caption("Environment diagnostic dashboard, LLM provider configuration, database maintenance & agent capabilities")
    
    # Overview Metrics
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Provider API", "Groq AI", "Connected" if settings.groq_api_key else "Missing Key")
    m2.metric("Primary LLM", settings.reasoning_model.split("/")[-1])
    m3.metric("Speech Engine", settings.stt_model.split("/")[-1])
    m4.metric("Database Engine", "SQLite3", "Local File")

    st.divider()

    tab_models, tab_db, tab_agents, tab_sec = st.tabs([
        "🤖 AI Models & Provider", 
        "🗄️ Database & Storage", 
        "⚡ Agent Architecture", 
        "🔒 Compliance & Security"
    ])

    with tab_models:
        st.subheader("Groq Provider Configuration")
        if settings.groq_api_key:
            st.success("🟢 GROQ_API_KEY is configured and active.")
        else:
            st.error("🔴 GROQ_API_KEY is missing. Please set your key in the .env file.")

        st.markdown("#### Configured Model Endpoints")
        model_df = pd.DataFrame([
            {"Role": "Reasoning & SOAP Generation", "Model ID": settings.reasoning_model, "Status": "Primary Endpoint"},
            {"Role": "Fallback LLM", "Model ID": settings.fallback_model, "Status": "Active Backup"},
            {"Role": "Speech-to-Text (STT)", "Model ID": settings.stt_model, "Status": "Whisper Engine"}
        ])
        st.dataframe(model_df, use_container_width=True, hide_index=True)
        
        with st.expander("🔧 Advanced Model Parameters"):
            st.json({
                "provider": "Groq OpenAI-Compatible API",
                "temperature": 0.2,
                "max_tokens": 4096,
                "response_format": "JSON Object (Structured Output)"
            })

    with tab_db:
        st.subheader("Database Health & Storage")
        st.code(f"Database Storage Path: {settings.db_path}", language="text")
        
        rows = get_consultations(500)
        c_count = len(rows)
        
        db_col1, db_col2 = st.columns(2)
        db_col1.metric("Total Consultations Stored", c_count)
        db_col2.metric("SQLite File Status", "Healthy & Writable")

        st.markdown("#### Database Maintenance")
        if st.button("🧹 Clear Active Session Workflow", type="secondary"):
            reset_workflow()
            st.success("Session state cleared.")
            st.rerun()

    with tab_agents:
        st.subheader("Clinical AI Agent Capabilities")
        agent_data = pd.DataFrame([
            {"Agent": "🎙 Voice STT Agent", "Engine": "Whisper Large V3 Turbo", "Role": "Audio transcription into structured text"},
            {"Agent": "📄 SOAP Note Agent", "Engine": settings.reasoning_model, "Role": "Generates Subjective, Objective, Assessment & Plan"},
            {"Agent": "✅ Compliance Audit Agent", "Engine": "Deterministic + LLM", "Role": "70% Rule-based + 30% LLM completeness check"},
            {"Agent": "🏷 ICD-10 Agent", "Engine": "Demo Dataset Matcher", "Role": "Code candidates mapping with clinical rationale"},
            {"Agent": "📋 EHR Document Agent", "Engine": "EHR Builder", "Role": "JSON/PDF/DOCX clinical record exporter"}
        ])
        st.dataframe(agent_data, use_container_width=True, hide_index=True)

    with tab_sec:
        st.subheader("Security & Privacy Guidelines")
        st.info("🔒 **Data Privacy**: This prototype uses local SQLite storage (`database/app.db`) and Groq API endpoints. Do not input real Unencrypted Protected Health Information (PHI) in uncertified development environments.")
        st.warning("⚠️ " + DISCLAIMER)

pages={"🏠 Dashboard":show_dashboard,"🎙 Consultation":show_consultation,"📝 SOAP Note":show_soap,"✅ Compliance":show_compliance,"🏷 ICD Coding":show_icd,"📋 EHR Document":show_ehr,"🗄 History":show_history,"⚙ Settings":show_settings}
current_page = st.session_state.get("page", "🏠 Dashboard")
pages.get(current_page, show_dashboard)()
