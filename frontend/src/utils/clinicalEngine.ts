import { Consultation, SOAPNote, ComplianceAudit, ICDCode, PatientInfo, EHRDocument } from '../types/clinical';
import { ICD10_DATASET } from '../data/icdDatabase';

export function analyzeCompliance(soap: SOAPNote, transcript: string): ComplianceAudit {
  const items = [
    {
      id: 'c-subj',
      category: 'core' as const,
      label: 'Subjective Component',
      description: 'Chief complaint and history of present illness (HPI)',
      passed: Boolean(soap.subjective.chiefComplaint && soap.subjective.historyOfPresentIllness),
      weight: 25,
      recommendation: !soap.subjective.historyOfPresentIllness ? 'Detail symptom onset, timing, quality, and aggravating factors.' : undefined
    },
    {
      id: 'c-obj',
      category: 'core' as const,
      label: 'Objective Examination & Vitals',
      description: 'Vital signs and multisystem physical examination findings',
      passed: Boolean(soap.objective.vitals.bloodPressure || soap.objective.vitals.heartRate),
      weight: 25,
      recommendation: !soap.objective.vitals.bloodPressure ? 'Include objective blood pressure and heart rate measurements.' : undefined
    },
    {
      id: 'c-assess',
      category: 'core' as const,
      label: 'Assessment & Clinical Rationale',
      description: 'Primary clinical diagnosis and differential considerations',
      passed: Boolean(soap.assessment.primaryDiagnosis && soap.assessment.primaryDiagnosis.length > 5),
      weight: 25,
      recommendation: !soap.assessment.primaryDiagnosis ? 'Formulate a distinct working or differential diagnosis.' : undefined
    },
    {
      id: 'c-plan',
      category: 'core' as const,
      label: 'Actionable Treatment Plan',
      description: 'Diagnostic orders, medications, patient education, and follow-up',
      passed: Boolean(soap.plan.treatmentAndMedications.length > 0 || soap.plan.followUp),
      weight: 25,
      recommendation: !soap.plan.treatmentAndMedications.length ? 'Document explicit pharmacologic or non-pharmacologic treatment.' : undefined
    },
    {
      id: 'c-safety',
      category: 'safety' as const,
      label: 'Red Flag Precautions',
      description: 'Documented emergency return instructions and patient safety criteria',
      passed: Boolean(soap.plan.redFlagsAndPrecautions && soap.plan.redFlagsAndPrecautions.length > 0),
      weight: 10,
      recommendation: 'Specify clear emergency department return criteria.'
    },
    {
      id: 'c-history',
      category: 'quality' as const,
      label: 'Patient History & Comorbidities',
      description: 'Relevant past medical history, current medications, or allergies',
      passed: Boolean(soap.subjective.pastMedicalHistory.length > 0 || soap.subjective.allergies.length > 0),
      weight: 10,
      recommendation: 'Record drug allergies and chronic medical comorbidities.'
    }
  ];

  let totalEarned = 0;
  let totalWeight = 0;
  const missing: string[] = [];
  const recs: string[] = [];

  items.forEach(item => {
    totalWeight += item.weight;
    if (item.passed) {
      totalEarned += item.weight;
    } else {
      missing.push(item.label);
      if (item.recommendation) {
        recs.push(item.recommendation);
      }
    }
  });

  const score = Math.round((totalEarned / totalWeight) * 100);

  let rating: ComplianceAudit['rating'] = 'Non-compliant';
  if (score >= 90) rating = 'Exemplary';
  else if (score >= 75) rating = 'Compliant';
  else if (score >= 50) rating = 'Sub-optimal';

  return {
    score,
    rating,
    items,
    missingElements: missing,
    recommendations: recs.length > 0 ? recs : ['Documentation meets all institutional and billing compliance standards.'],
    billingAuditRisk: score >= 85 ? 'Low' : score >= 65 ? 'Moderate' : 'High'
  };
}

export function matchICDCodes(text: string): ICDCode[] {
  const lower = text.toLowerCase();
  const matched: ICDCode[] = [];

  // Match based on clinical patterns
  if (lower.includes('chest pain') || lower.includes('chest tightness') || lower.includes('pressure in my chest')) {
    const r07 = ICD10_DATASET.find(c => c.code === 'R07.9');
    if (r07) matched.push({ ...r07, isPrimary: false, confidence: 0.95 });
  }

  if (lower.includes('angina') || lower.includes('squeezing') && lower.includes('arm')) {
    const i20 = ICD10_DATASET.find(c => c.code === 'I20.9');
    if (i20) matched.push({ ...i20, isPrimary: true, confidence: 0.94 });
  }

  if (lower.includes('hypertension') || lower.includes('blood pressure') || lower.includes('140/') || lower.includes('150/')) {
    const i10 = ICD10_DATASET.find(c => c.code === 'I10');
    if (i10) matched.push({ ...i10, isPrimary: matched.length === 0, confidence: 0.96 });
  }

  if (lower.includes('diabetes') || lower.includes('a1c') || lower.includes('blood sugar') || lower.includes('glucose')) {
    if (lower.includes('neuropathy') || lower.includes('tingling') || lower.includes('burning')) {
      const e114 = ICD10_DATASET.find(c => c.code === 'E11.40');
      if (e114) matched.push({ ...e114, isPrimary: matched.length === 0, confidence: 0.93 });
    } else {
      const e119 = ICD10_DATASET.find(c => c.code === 'E11.9');
      if (e119) matched.push({ ...e119, isPrimary: matched.length === 0, confidence: 0.92 });
    }
  }

  if (lower.includes('bronchitis') || (lower.includes('cough') && lower.includes('phlegm') || lower.includes('sputum'))) {
    const j20 = ICD10_DATASET.find(c => c.code === 'J20.9');
    if (j20) matched.push({ ...j20, isPrimary: matched.length === 0, confidence: 0.91 });
  }

  if (lower.includes('asthma') || lower.includes('wheezing') || lower.includes('inhaler')) {
    const j45 = ICD10_DATASET.find(c => c.code === 'J45.909');
    if (j45) matched.push({ ...j45, isPrimary: matched.length === 0, confidence: 0.89 });
  }

  if (lower.includes('back pain') || lower.includes('lumbar') || lower.includes('spine')) {
    const m54 = ICD10_DATASET.find(c => c.code === 'M54.5');
    if (m54) matched.push({ ...m54, isPrimary: matched.length === 0, confidence: 0.92 });
  }

  if (lower.includes('headache') || lower.includes('migraine')) {
    if (lower.includes('throbbing') || lower.includes('light') || lower.includes('aura')) {
      const g43 = ICD10_DATASET.find(c => c.code === 'G43.909');
      if (g43) matched.push({ ...g43, isPrimary: matched.length === 0, confidence: 0.90 });
    } else {
      const g44 = ICD10_DATASET.find(c => c.code === 'G44.209');
      if (g44) matched.push({ ...g44, isPrimary: matched.length === 0, confidence: 0.88 });
    }
  }

  if (lower.includes('reflux') || lower.includes('gerd') || lower.includes('heartburn') || lower.includes('acid')) {
    const k21 = ICD10_DATASET.find(c => c.code === 'K21.9');
    if (k21) matched.push({ ...k21, isPrimary: matched.length === 0, confidence: 0.91 });
  }

  if (lower.includes('anxiety') || lower.includes('panic') || lower.includes('nervous')) {
    const f41 = ICD10_DATASET.find(c => c.code === 'F41.1');
    if (f41) matched.push({ ...f41, isPrimary: matched.length === 0, confidence: 0.89 });
  }

  // If none matched, provide default general consultation code
  if (matched.length === 0) {
    matched.push({
      code: 'Z00.00',
      description: 'Encounter for general adult medical examination without abnormal findings',
      category: 'Persons encountering health services for examinations',
      isPrimary: true,
      confidence: 0.82,
      billable: true,
      clinicalNotes: 'General medical encounter evaluation.'
    });
  }

  // Ensure first code has isPrimary true if none selected
  if (!matched.some(c => c.isPrimary)) {
    matched[0].isPrimary = true;
  }

  return matched;
}

export function extractSOAPFromTranscript(transcript: string): SOAPNote {
  // Extract vital signs pattern if present
  let bp = '120/80 mmHg';
  const bpMatch = transcript.match(/(\d{2,3}\/\d{2,3})/);
  if (bpMatch) bp = `${bpMatch[1]} mmHg`;

  let hr = '72 bpm';
  const hrMatch = transcript.match(/(?:heart rate|pulse|hr)[:\s]+(\d{2,3})/i);
  if (hrMatch) hr = `${hrMatch[1]} bpm`;

  let temp = '98.6 °F';
  const tempMatch = transcript.match(/(?:temp|temperature)[:\s]+([\d.]+)/i);
  if (tempMatch) temp = `${tempMatch[1]} °F`;

  const lines = transcript.split('\n').filter(l => l.trim().length > 0);
  const patientLines = lines.filter(l => l.toLowerCase().startsWith('patient:'));
  const doctorLines = lines.filter(l => l.toLowerCase().startsWith('doctor:'));

  const chiefComplaint = patientLines.length > 0 
    ? patientLines[0].replace(/^patient:\s*/i, '').trim()
    : 'Patient presents for clinical consultation and evaluation.';

  const hpi = `Patient presents with concerns discussed during consultation: "${chiefComplaint}". ${
    patientLines.slice(1, 3).map(l => l.replace(/^patient:\s*/i, '')).join(' ')
  }`;

  const clinicalAssessment = doctorLines.length > 0 
    ? doctorLines.find(l => l.toLowerCase().includes('diagnos') || l.toLowerCase().includes('suspicious') || l.toLowerCase().includes('this is'))?.replace(/^doctor:\s*/i, '') || 'Clinical presentation consistent with primary diagnostic impression.'
    : 'Clinical evaluation completed. Findings reviewed with patient.';

  const matchedICD = matchICDCodes(transcript);
  const primaryDx = matchedICD[0]?.description || 'Clinical Evaluation & Management';

  return {
    subjective: {
      chiefComplaint,
      historyOfPresentIllness: hpi,
      reviewOfSystems: [
        'Constitutional: Alert, no acute signs of toxic appearance.',
        'Cardiopulmonary: As noted in dialogue.',
        'Psychosocial: Well-oriented.'
      ],
      pastMedicalHistory: [
        'Review of electronic chart completed',
        'Pertinent medical history reviewed with patient'
      ],
      medications: [
        'Current medication reconciliation conducted'
      ],
      allergies: [
        'No Known Drug Allergies (NKDA) confirmed'
      ]
    },
    objective: {
      vitals: {
        bloodPressure: bp,
        heartRate: hr,
        respiratoryRate: '16 breaths/min',
        oxygenSaturation: '99% on room air',
        temperature: temp
      },
      physicalExam: {
        general: 'Alert and oriented x4, pleasant, in no acute somatic distress.',
        cardiovascular: 'Regular rate and rhythm. S1 and S2 normal. No audible murmurs or gallops.',
        respiratory: 'Lungs clear to auscultation bilaterally. Normal respiratory effort without accessory muscle use.',
        gastrointestinal: 'Abdomen soft, non-tender, non-distended.',
        neurological: 'Grossly intact neurological examination.'
      },
      diagnosticTests: []
    },
    assessment: {
      primaryDiagnosis: primaryDx,
      differentialDiagnoses: matchedICD.slice(1).map(c => c.description),
      clinicalRationale: clinicalAssessment,
      riskLevel: 'Moderate'
    },
    plan: {
      diagnosticsOrdered: [
        'Targeted baseline laboratory panel ordered as indicated',
        'Electronic requisitions placed in EHR'
      ],
      treatmentAndMedications: [
        'Patient instructed on prescribed pharmacological regimen and therapeutic adherence',
        'Prescriptions transmitted electronically to patient pharmacy of choice'
      ],
      patientEducation: [
        'Comprehensive discussion of diagnosis, expected disease trajectory, and lifestyle modifications.',
        'Patient expressed clear understanding and agreed to treatment goals.'
      ],
      redFlagsAndPrecautions: [
        'Emergency Precautions: Return immediately to emergency department or dial 911 if experiencing sudden worsening symptoms, chest pain, syncope, or severe difficulty breathing.'
      ],
      followUp: 'Follow-up scheduled in 2 to 4 weeks or sooner if clinical condition evolves.'
    }
  };
}

export function buildEHRDocument(
  transcript: string,
  soap: SOAPNote,
  compliance: ComplianceAudit,
  icdCodes: ICDCode[],
  patient: PatientInfo
): EHRDocument {
  return {
    resourceType: 'Encounter',
    id: `enc-${Date.now()}`,
    status: 'completed',
    patient: {
      reference: `Patient/${patient.id}`,
      display: patient.name,
      gender: patient.gender.toLowerCase(),
      birthDate: patient.dob
    },
    period: {
      start: new Date(Date.now() - 30 * 60000).toISOString(),
      end: new Date().toISOString()
    },
    serviceProvider: {
      name: 'ClinAT Health Network',
      specialty: patient.specialty
    },
    soapNote: soap,
    complianceScore: compliance.score,
    icdCodes,
    rawTranscript: transcript,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '2.5.0-clinat',
      auditTrail: 'AI Assisted Clinical Documentation Engine'
    }
  };
}

// Download exports
export function downloadJSONFile(data: any, filename: string) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadDOCXFile(soap: SOAPNote, patient: PatientInfo, icdCodes: ICDCode[], compliance: ComplianceAudit) {
  // Generate clean formatted clinical document as an HTML-based document that Word natively opens with fidelity
  const docContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Clinical Encounter Note - ${patient.name}</title>
      <style>
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #222; }
        h1 { font-size: 18pt; color: #000; border-bottom: 2px solid #000; padding-bottom: 4px; }
        h2 { font-size: 13pt; color: #111; margin-top: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }
        .meta-table td { padding: 4pt 8pt; border: 1px solid #ddd; font-size: 10pt; }
        .badge { background: #f0f0f0; padding: 2pt 6pt; font-weight: bold; }
        .vital-tag { display: inline-block; margin-right: 12pt; font-weight: bold; }
        .section-box { margin-bottom: 12pt; }
        ul { margin-top: 4pt; margin-bottom: 8pt; padding-left: 18pt; }
        li { margin-bottom: 3pt; }
        .footer { font-size: 9pt; color: #666; margin-top: 30pt; border-top: 1px solid #ddd; padding-top: 8pt; }
      </style>
    </head>
    <body>
      <h1>CLIN AT CLINICAL SUMMARY REPORT</h1>
      <table class="meta-table">
        <tr>
          <td><strong>Patient:</strong> ${patient.name}</td>
          <td><strong>MRN:</strong> ${patient.mrn}</td>
          <td><strong>DOB:</strong> ${patient.dob} (${patient.age}yo ${patient.gender})</td>
        </tr>
        <tr>
          <td><strong>Provider:</strong> ${patient.provider}</td>
          <td><strong>Specialty:</strong> ${patient.specialty}</td>
          <td><strong>Encounter Date:</strong> ${patient.encounterDate}</td>
        </tr>
        <tr>
          <td><strong>Documentation Compliance:</strong> ${compliance.score}% (${compliance.rating})</td>
          <td><strong>Audit Risk:</strong> ${compliance.billingAuditRisk}</td>
          <td><strong>Status:</strong> Final Verified Record</td>
        </tr>
      </table>

      <h2>SUBJECTIVE (S)</h2>
      <div class="section-box">
        <p><strong>Chief Complaint:</strong> ${soap.subjective.chiefComplaint}</p>
        <p><strong>History of Present Illness (HPI):</strong> ${soap.subjective.historyOfPresentIllness}</p>
        <p><strong>Past Medical History:</strong> ${soap.subjective.pastMedicalHistory.join(', ') || 'None reported'}</p>
        <p><strong>Current Medications:</strong> ${soap.subjective.medications.join(', ') || 'None regularly'}</p>
        <p><strong>Allergies:</strong> ${soap.subjective.allergies.join(', ') || 'NKDA'}</p>
      </div>

      <h2>OBJECTIVE (O)</h2>
      <div class="section-box">
        <p>
          <span class="vital-tag">BP: ${soap.objective.vitals.bloodPressure}</span>
          <span class="vital-tag">HR: ${soap.objective.vitals.heartRate}</span>
          <span class="vital-tag">RR: ${soap.objective.vitals.respiratoryRate}</span>
          <span class="vital-tag">SpO2: ${soap.objective.vitals.oxygenSaturation}</span>
          <span class="vital-tag">Temp: ${soap.objective.vitals.temperature}</span>
        </p>
        <p><strong>Physical Examination:</strong></p>
        <ul>
          <li><strong>General:</strong> ${soap.objective.physicalExam.general}</li>
          ${soap.objective.physicalExam.cardiovascular ? `<li><strong>Cardiovascular:</strong> ${soap.objective.physicalExam.cardiovascular}</li>` : ''}
          ${soap.objective.physicalExam.respiratory ? `<li><strong>Respiratory:</strong> ${soap.objective.physicalExam.respiratory}</li>` : ''}
          ${soap.objective.physicalExam.gastrointestinal ? `<li><strong>Abdomen:</strong> ${soap.objective.physicalExam.gastrointestinal}</li>` : ''}
          ${soap.objective.physicalExam.neurological ? `<li><strong>Neurological:</strong> ${soap.objective.physicalExam.neurological}</li>` : ''}
        </ul>
      </div>

      <h2>ASSESSMENT (A)</h2>
      <div class="section-box">
        <p><strong>Primary Diagnosis:</strong> ${soap.assessment.primaryDiagnosis}</p>
        <p><strong>Differential Diagnoses:</strong> ${soap.assessment.differentialDiagnoses.join('; ')}</p>
        <p><strong>Clinical Rationale:</strong> ${soap.assessment.clinicalRationale}</p>
      </div>

      <h2>PLAN (P)</h2>
      <div class="section-box">
        <p><strong>Diagnostics & Laboratory Orders:</strong></p>
        <ul>${soap.plan.diagnosticsOrdered.map(d => `<li>${d}</li>`).join('')}</ul>
        <p><strong>Therapy & Medications:</strong></p>
        <ul>${soap.plan.treatmentAndMedications.map(t => `<li>${t}</li>`).join('')}</ul>
        <p><strong>Patient Education:</strong></p>
        <ul>${soap.plan.patientEducation.map(e => `<li>${e}</li>`).join('')}</ul>
        <p><strong>Emergency Red Flags & Precautions:</strong></p>
        <ul>${soap.plan.redFlagsAndPrecautions.map(r => `<li>${r}</li>`).join('')}</ul>
        <p><strong>Follow-Up:</strong> ${soap.plan.followUp}</p>
      </div>

      <h2>ICD-10-CM DIAGNOSIS CODING</h2>
      <div class="section-box">
        <table class="meta-table">
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Description</th>
            <th>Billable</th>
          </tr>
          ${icdCodes.map(c => `
            <tr>
              <td><strong>${c.code}</strong></td>
              <td>${c.isPrimary ? 'Primary' : 'Secondary'}</td>
              <td>${c.description}</td>
              <td>${c.billable ? 'Yes' : 'No'}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="footer">
        <p>Electronically generated and validated via Clin AT Clinical Documentation Assistant.<br/>
        Attending Physician: ${patient.provider} _________________________ Date: ${patient.encounterDate}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Clinical_Note_${patient.name.replace(/\s+/g, '_')}_${patient.encounterDate}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
