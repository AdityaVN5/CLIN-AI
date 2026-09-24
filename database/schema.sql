CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS consultations (
    consultation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    transcript TEXT,
    soap_note TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
);
CREATE TABLE IF NOT EXISTS compliance_results (
    compliance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER NOT NULL,
    compliance_score INTEGER NOT NULL,
    status TEXT NOT NULL,
    required_sections TEXT,
    passed_checks TEXT,
    missing_information TEXT,
    warnings TEXT,
    recommendations TEXT,
    llm_available INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(consultation_id) REFERENCES consultations(consultation_id)
);
CREATE TABLE IF NOT EXISTS icd_codes (
    code_id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER NOT NULL,
    icd_code TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(consultation_id) REFERENCES consultations(consultation_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER,
    agent_name TEXT,
    action TEXT,
    status TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
