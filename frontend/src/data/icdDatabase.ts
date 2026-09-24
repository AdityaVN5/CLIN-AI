import { ICDCode, Consultation } from '../types/clinical';

export const ICD10_DATASET: ICDCode[] = [
  // Cardiology
  {
    code: 'R07.9',
    description: 'Chest pain, unspecified',
    category: 'Symptoms involving the circulatory and respiratory systems',
    billable: true,
    confidence: 0.95,
    clinicalNotes: 'Use when etiology of chest discomfort has not been definitively differentiated.'
  },
  {
    code: 'I20.9',
    description: 'Angina pectoris, unspecified',
    category: 'Ischemic heart diseases',
    billable: true,
    confidence: 0.92,
    clinicalNotes: 'Characteristic substernal pressure precipitated by exertion and relieved by rest/NTG.'
  },
  {
    code: 'I25.10',
    description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
    category: 'Ischemic heart diseases',
    billable: true,
    confidence: 0.88,
    clinicalNotes: 'Chronic CAD history or established ischemic heart disease.'
  },
  {
    code: 'I10',
    description: 'Essential (primary) hypertension',
    category: 'Hypertensive diseases',
    billable: true,
    confidence: 0.98,
    clinicalNotes: 'Persistent systemic arterial pressure elevated above standard guidelines without secondary cause.'
  },
  {
    code: 'I50.9',
    description: 'Heart failure, unspecified',
    category: 'Heart failure',
    billable: true,
    confidence: 0.85,
    clinicalNotes: 'Signs of volume overload, dyspnea, orthopnea, or peripheral edema.'
  },

  // Endocrinology & Metabolic
  {
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    category: 'Diabetes mellitus',
    billable: true,
    confidence: 0.96,
    clinicalNotes: 'Adult-onset DM with standard glycemic control, no micro/macrovascular complications.'
  },
  {
    code: 'E11.40',
    description: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified',
    category: 'Diabetes mellitus',
    billable: true,
    confidence: 0.91,
    clinicalNotes: 'Presence of stocking-glove paresthesias, burning sensation in feet, or reduced monofilament exam.'
  },
  {
    code: 'E78.5',
    description: 'Hyperlipidemia, unspecified',
    category: 'Metabolic disorders',
    billable: true,
    confidence: 0.94,
    clinicalNotes: 'Elevated total cholesterol, LDL, or triglycerides on fasting lipid panel.'
  },
  {
    code: 'E03.9',
    description: 'Hypothyroidism, unspecified',
    category: 'Thyroid disorders',
    billable: true,
    confidence: 0.89,
    clinicalNotes: 'Elevated TSH with fatigue, weight gain, cold intolerance.'
  },

  // Pulmonology
  {
    code: 'J06.9',
    description: 'Acute upper respiratory infection, unspecified',
    category: 'Acute respiratory infections',
    billable: true,
    confidence: 0.94,
    clinicalNotes: 'Viral rhinosinusitis, rhinorrhea, nasal congestion, low-grade fever.'
  },
  {
    code: 'J20.9',
    description: 'Acute bronchitis, unspecified',
    category: 'Acute lower respiratory infections',
    billable: true,
    confidence: 0.90,
    clinicalNotes: 'Cough lasting >5 days with or without sputum, no evidence of consolidation.'
  },
  {
    code: 'J45.909',
    description: 'Unspecified asthma, uncomplicated',
    category: 'Chronic lower respiratory diseases',
    billable: true,
    confidence: 0.89,
    clinicalNotes: 'Episodic wheezing, dyspnea, responsive to bronchodilators.'
  },
  {
    code: 'J44.9',
    description: 'Chronic obstructive pulmonary disease, unspecified',
    category: 'Chronic lower respiratory diseases',
    billable: true,
    confidence: 0.87,
    clinicalNotes: 'Tobacco history with progressive exertional dyspnea and productive cough.'
  },

  // Musculoskeletal & Neurology
  {
    code: 'M54.5',
    description: 'Low back pain, unspecified',
    category: 'Dorsopathies',
    billable: true,
    confidence: 0.93,
    clinicalNotes: 'Lumbar or lumbosacral mechanical pain without acute radiculopathy.'
  },
  {
    code: 'G43.909',
    description: 'Migraine, unspecified, not intractable, without status migrainosus',
    category: 'Episodic and paroxysmal disorders',
    billable: true,
    confidence: 0.91,
    clinicalNotes: 'Unilateral, pulsating headache with photophobia/phonophobia or nausea.'
  },
  {
    code: 'G44.209',
    description: 'Tension-type headache, unspecified, not intractable',
    category: 'Headache syndromes',
    billable: true,
    confidence: 0.88,
    clinicalNotes: 'Bilateral band-like pressure, mild to moderate intensity.'
  },

  // Gastroenterology
  {
    code: 'K21.9',
    description: 'Gastro-esophageal reflux disease without esophagitis',
    category: 'Diseases of esophagus, stomach and duodenum',
    billable: true,
    confidence: 0.92,
    clinicalNotes: 'Pyrosis, retrosternal regurgitation exacerbated by recumbency or trigger foods.'
  },
  {
    code: 'K58.9',
    description: 'Irritable bowel syndrome without diarrhea',
    category: 'Noninfective enteritis and colitis',
    billable: true,
    confidence: 0.86,
    clinicalNotes: 'Abdominal cramping relieved by defecation, altered bowel frequency/form.'
  },

  // Mental Health
  {
    code: 'F41.1',
    description: 'Generalized anxiety disorder',
    category: 'Anxiety and neurotic disorders',
    billable: true,
    confidence: 0.89,
    clinicalNotes: 'Excessive worry across multiple domains for >6 months with somatic tension.'
  },
  {
    code: 'F32.9',
    description: 'Major depressive disorder, single episode, unspecified',
    category: 'Mood disorders',
    billable: true,
    confidence: 0.87,
    clinicalNotes: 'Depressed mood, anhedonia, sleep disturbances, fatigue.'
  }
];

export const SAMPLE_CONSULTATIONS: Consultation[] = [
  {
    id: 'consult-cardio-01',
    title: 'Cardiology: Acute Chest Pain & Exertional Angina',
    timestamp: 'Today at 08:45 AM',
    patient: {
      id: 'PT-10042',
      name: 'Robert Henderson',
      age: 54,
      gender: 'Male',
      dob: '1972-04-14',
      mrn: 'MRN-884021',
      encounterDate: '2026-09-24',
      provider: 'Dr. Aditya M., MD',
      specialty: 'Cardiovascular Medicine'
    },
    transcript: `Doctor: Good morning Robert. What brings you in today?
Patient: Morning doctor. For the past two days, I've had this tight squeezing sensation right in the center of my chest. It usually happens when I walk up the stairs at work.
Doctor: Does the pain radiate anywhere—to your jaw, neck, or down your left arm?
Patient: A bit into my left shoulder and arm, yes. It feels like a heavy weight pressing down.
Doctor: How long does an episode last, and does anything make it better?
Patient: When I stop walking and sit down, it goes away in about four or five minutes. No severe shortness of breath, but I did feel a little lightheaded yesterday afternoon.
Doctor: Have you had any nausea, diaphoresis—excessive sweating—or palpitations?
Patient: No sweating or vomiting, just the tightness.
Doctor: Let's check your vitals. Blood pressure is 144/92 mmHg, heart rate is 86 bpm regular, oxygen saturation 98% on room air, and temperature is 98.4 F.
Doctor: Heart sounds show S1 and S2 present, no murmurs, rubs, or gallops. Lungs are clear to auscultation bilaterally. Abdomen is soft, non-tender.
Doctor: Given your symptoms and risk profile, this is suspicious for exertional angina pectoris. We need to obtain an immediate 12-lead ECG and send a high-sensitivity cardiac troponin panel to rule out acute coronary syndrome.
Patient: Okay doctor. What about medication?
Doctor: I'm prescribing sublingual nitroglycerin 0.4 mg as needed for acute chest discomfort, and daily Aspirin 81 mg. We will arrange an urgent outpatient exercise stress echocardiogram within 72 hours. If you experience severe chest pain lasting more than 10 minutes, call 911 immediately.`,
    audioFileName: 'encounter_robert_henderson_0924.wav',
    audioDurationSeconds: 142,
    soap: {
      subjective: {
        chiefComplaint: 'Substernal chest tightness radiating to left shoulder on exertion for 2 days.',
        historyOfPresentIllness: '54-year-old male presents with acute exertional chest pressure of 2 days duration. Describes a tight, squeezing sensation retrosternally that radiates to the left shoulder and arm, provoked by climbing stairs. Episodes typically last 4-5 minutes and resolve with rest. Associated with mild lightheadedness. Denies diaphoresis, nausea, vomiting, or acute resting shortness of breath.',
        reviewOfSystems: [
          'Cardiovascular: Positive for exertional chest pressure and left arm radiation; negative for palpitations or syncope.',
          'Respiratory: Negative for orthopnea or paroxysmal nocturnal dyspnea.',
          'Gastrointestinal: Negative for reflux, pyrosis, or nausea.',
          'Constitutional: Negative for fever or unintentional weight changes.'
        ],
        pastMedicalHistory: [
          'Essential hypertension (diagnosed 2021)',
          'Hyperlipidemia'
        ],
        medications: [
          'Lisinopril 10 mg PO daily',
          'Atorvastatin 20 mg PO daily'
        ],
        allergies: [
          'NKDA (No Known Drug Allergies)'
        ]
      },
      objective: {
        vitals: {
          bloodPressure: '144/92 mmHg',
          heartRate: '86 bpm',
          respiratoryRate: '16 breaths/min',
          oxygenSaturation: '98% on RA',
          temperature: '98.4 °F (36.9 °C)',
          bmi: '27.4 kg/m²'
        },
        physicalExam: {
          general: 'Well-developed, alert and oriented x4, in no acute distress sitting comfortably.',
          cardiovascular: 'Regular rate and rhythm. S1 and S2 crisp. No audible murmurs, friction rubs, or S3/S4 gallops. Peripheral pulses 2+ symmetric. No lower extremity edema.',
          respiratory: 'Clear to auscultation bilaterally throughout lung fields. No wheezing, rales, or rhonchi. Symmetric chest excursion.',
          gastrointestinal: 'Abdomen soft, non-tender, non-distended. Normal active bowel sounds.',
          neurological: 'Grossly intact cranial nerves II-XII. No focal neurologic deficits.'
        },
        diagnosticTests: [
          'Immediate in-clinic 12-lead ECG: Normal sinus rhythm at 84 bpm, no acute ST-segment elevations or depressions, non-specific T-wave flattening in lead V5-V6.'
        ]
      },
      assessment: {
        primaryDiagnosis: 'Exertional angina pectoris (suspected coronary artery disease)',
        differentialDiagnoses: [
          'Acute Coronary Syndrome / Non-ST Elevation Myocardial Infarction',
          'Gastroesophageal Reflux Disease (GERD)',
          'Musculoskeletal costochondritis',
          'Thoracic aortic pathology'
        ],
        clinicalRationale: 'Classic presentation of exertional retrosternal squeezing chest discomfort with radiation to the left arm, lasting 4-5 minutes and relieved promptly by rest. Mildly elevated baseline blood pressure.',
        riskLevel: 'Moderate'
      },
      plan: {
        diagnosticsOrdered: [
          'Serum High-Sensitivity Cardiac Troponin T (0h, 3h series)',
          'Comprehensive Metabolic Panel (CMP) & Fasting Lipid Panel',
          'Outpatient Exercise Stress Echocardiogram scheduled within 72 hours'
        ],
        treatmentAndMedications: [
          'Aspirin 81 mg PO daily with food',
          'Sublingual Nitroglycerin 0.4 mg SL PRN chest discomfort (max 3 doses at 5-minute intervals)',
          'Continue Lisinopril 10 mg daily and Atorvastatin 20 mg daily'
        ],
        patientEducation: [
          'Instructed on appropriate sublingual nitroglycerin administration technique while seated.',
          'Advised to avoid strenuous physical exertion until stress test clearance.',
          'Dietary counseling on low-sodium, heart-healthy Mediterranean diet.'
        ],
        redFlagsAndPrecautions: [
          'STRICT RETURN PRECAUTIONS: Call 911 / report to nearest emergency department immediately for persistent chest discomfort lasting >10 minutes unrelieved by nitroglycerin, diaphoresis, syncope, or severe dyspnea.'
        ],
        followUp: 'Cardiology clinic follow-up in 1 week following stress echocardiography results.'
      }
    },
    compliance: {
      score: 98,
      rating: 'Exemplary',
      items: [
        {
          id: 'comp-1',
          category: 'core',
          label: 'Subjective Component',
          description: 'Chief complaint, detailed HPI with onset, timing, radiation, and pertinent negatives.',
          passed: true,
          weight: 25
        },
        {
          id: 'comp-2',
          category: 'core',
          label: 'Objective Examination & Vitals',
          description: 'Complete set of vital signs (BP, HR, RR, SpO2, Temp) and multisystem physical exam.',
          passed: true,
          weight: 25
        },
        {
          id: 'comp-3',
          category: 'core',
          label: 'Assessment & Differential Reasoning',
          description: 'Primary diagnosis clearly formulated with clinical differential and risk assessment.',
          passed: true,
          weight: 25
        },
        {
          id: 'comp-4',
          category: 'core',
          label: 'Structured Treatment Plan',
          description: 'Clear diagnostic orders, pharmacology with dosing, patient counseling, and explicit follow-up.',
          passed: true,
          weight: 25
        },
        {
          id: 'comp-5',
          category: 'safety',
          label: 'Red Flag Precautions & Emergency Threshold',
          description: 'Explicit emergency instructions documented for cardiac chest pain escalation.',
          passed: true,
          weight: 10
        },
        {
          id: 'comp-6',
          category: 'billing',
          label: 'Medical Decision Making (MDM) Complexity',
          description: 'High complexity MDM substantiated by multiple diagnostics and emergency medications.',
          passed: true,
          weight: 10
        }
      ],
      missingElements: [],
      recommendations: [
        'Ensure 3-hour post-encounter troponin result is indexed directly into the encounter log upon laboratory sign-out.'
      ],
      billingAuditRisk: 'Low'
    },
    icdCodes: [
      {
        code: 'I20.9',
        description: 'Angina pectoris, unspecified',
        category: 'Ischemic heart diseases',
        isPrimary: true,
        confidence: 0.96,
        billable: true,
        clinicalNotes: 'Primary indication matching classic exertional angina symptomatology.'
      },
      {
        code: 'R07.9',
        description: 'Chest pain, unspecified',
        category: 'Symptoms involving the circulatory and respiratory systems',
        isPrimary: false,
        confidence: 0.94,
        billable: true,
        clinicalNotes: 'Secondary symptom code documenting the chief complaint presentation.'
      },
      {
        code: 'I10',
        description: 'Essential (primary) hypertension',
        category: 'Hypertensive diseases',
        isPrimary: false,
        confidence: 0.90,
        billable: true,
        clinicalNotes: 'Documented comorbidity and contributing cardiac risk factor.'
      }
    ],
    ehrJson: '',
    messages: [],
    status: 'completed'
  },
  {
    id: 'consult-endocrine-02',
    title: 'Endocrinology: Type 2 Diabetes & Peripheral Neuropathy',
    timestamp: 'Yesterday at 02:15 PM',
    patient: {
      id: 'PT-10098',
      name: 'Elena Rostova',
      age: 62,
      gender: 'Female',
      dob: '1964-11-09',
      mrn: 'MRN-773190',
      encounterDate: '2026-09-23',
      provider: 'Dr. Aditya M., MD',
      specialty: 'Endocrinology & Metabolism'
    },
    transcript: `Doctor: Hello Elena. We are reviewing your recent labs and 3-month diabetes follow-up today.
Patient: Hi doctor. Yes, my home blood sugar readings have been in the 170 to 210 range in the mornings. Also, my toes have felt tingling and burning at night.
Doctor: Any open sores, numbness, or blisters on your feet?
Patient: No sores, but the tingling makes it hard to sleep sometimes.
Doctor: Looking at your laboratory results from Monday: your Hemoglobin A1c came back at 8.9%, up from 7.4% last visit. Microalbumin-to-creatinine ratio is slightly elevated at 45 mcg/mg.
Doctor: On physical exam, blood pressure is 132/84 mmHg, HR 74, SpO2 99%. Foot inspection shows intact skin without erythema or ulcers. Monofilament testing demonstrates reduced sensation over the 1st and 5th metatarsal heads bilaterally.
Doctor: Your type 2 diabetes is currently suboptimally controlled, and the foot exam is consistent with early diabetic peripheral neuropathy.
Doctor: We will optimize your therapy today. We will increase your Metformin to 1000 mg twice daily, and initiate Empagliflozin 10 mg once daily, which will also protect your renal and cardiovascular health. For the neuropathic pain, let's start Gabapentin 100 mg at bedtime.
Patient: That sounds good. Should I see a podiatrist?
Doctor: Yes, I am submitting a referral to Podiatry for diabetic foot care and footwear evaluation. Repeat A1c in 3 months.`,
    audioFileName: 'encounter_elena_rostova_0923.mp3',
    audioDurationSeconds: 168,
    soap: {
      subjective: {
        chiefComplaint: 'Elevated morning home blood sugars (170-210 mg/dL) and bilateral lower extremity tingling.',
        historyOfPresentIllness: '62-year-old female with long-standing Type 2 Diabetes presents for routine 3-month metabolic follow-up. Reports elevated fasting glucometer readings averaging 170-210 mg/dL. Complains of progressive nocturnal burning and paresthesias in bilateral toes for the past 6 weeks. Denies focal weakness, non-healing foot wounds, polydipsia, or visual changes.',
        reviewOfSystems: [
          'Endocrine: Positive for hyperglycemia; negative for polyuria or weight fluctuations.',
          'Neurologic: Positive for bilateral distal symmetrical paresthesias; negative for motor deficits or ataxia.',
          'Integumentary: Negative for ulcers, calluses, or rash on feet.'
        ],
        pastMedicalHistory: [
          'Type 2 Diabetes Mellitus (dx 2017)',
          'Hyperlipidemia'
        ],
        medications: [
          'Metformin 500 mg PO BID with meals',
          'Simvastatin 20 mg PO QHS'
        ],
        allergies: [
          'Penicillin (Hives)'
        ]
      },
      objective: {
        vitals: {
          bloodPressure: '132/84 mmHg',
          heartRate: '74 bpm',
          respiratoryRate: '14 breaths/min',
          oxygenSaturation: '99% on RA',
          temperature: '98.1 °F',
          bmi: '29.2 kg/m²'
        },
        physicalExam: {
          general: 'Comfortable, oriented x4, pleasant.',
          cardiovascular: 'S1, S2 regular. Dorsalis pedis and posterior tibial pulses 2+ bilaterally.',
          respiratory: 'Lungs clear to auscultation bilaterally.',
          neurological: 'Decreased light touch sensation using 10g Semmes-Weinstein monofilament at 1st and 5th plantar metatarsals bilaterally. Deep tendon reflexes 1+ patellar, absent ankle jerks bilaterally.',
          skin: 'Feet inspected: skin warm, dry, completely intact. No erythema, fissures, or ulcerations.'
        },
        diagnosticTests: [
          'HbA1c: 8.9% (prior 7.4%)',
          'Urinary Albumin/Creatinine: 45 mcg/mg (mildly elevated microalbuminuria)'
        ]
      },
      assessment: {
        primaryDiagnosis: 'Type 2 diabetes mellitus with diabetic polyneuropathy, uncontrolled',
        differentialDiagnoses: [
          'Nutritional / Vitamin B12 deficiency neuropathy',
          'Lumbar radiculopathy',
          'Metformin-associated neuropathy'
        ],
        clinicalRationale: 'Worsened glycemic control evidenced by HbA1c 8.9% accompanied by classic bilateral distal sensory neuropathy and early microalbuminuria.',
        riskLevel: 'Moderate'
      },
      plan: {
        diagnosticsOrdered: [
          'Serum Vitamin B12 and TSH level',
          'Repeat Hemoglobin A1c and renal function panel in 3 months'
        ],
        treatmentAndMedications: [
          'Increase Metformin to 1000 mg PO BID with meals',
          'Initiate Empagliflozin (Jardiance) 10 mg PO daily in the morning',
          'Initiate Gabapentin 100 mg PO QHS for neuropathic foot discomfort'
        ],
        patientEducation: [
          'Comprehensive diabetic foot care counseling: daily visual foot inspection with mirror, well-cushioned shoes, never walking barefoot.',
          'Instructed on SGLT-2 inhibitor hydration precautions and mycotic infection vigilance.'
        ],
        redFlagsAndPrecautions: [
          'Report immediately if any skin breakdown, redness, swelling, non-healing sores, or fever occurs.'
        ],
        followUp: 'Podiatry consultation placed. Follow-up in primary endocrine clinic in 12 weeks with repeat labs.'
      }
    },
    compliance: {
      score: 96,
      rating: 'Exemplary',
      items: [
        {
          id: 'c-1',
          category: 'core',
          label: 'Subjective Component',
          description: 'HPI, glycemic logs, and neuropathic symptoms well recorded.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-2',
          category: 'core',
          label: 'Objective Examination & Vitals',
          description: 'Documented 10g monofilament exam, peripheral pulses, and skin integrity.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-3',
          category: 'core',
          label: 'Assessment & Differential Reasoning',
          description: 'Specific diagnosis including complications clearly framed.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-4',
          category: 'core',
          label: 'Structured Treatment Plan',
          description: 'Dual anti-hyperglycemic titration and neuropathic management.',
          passed: true,
          weight: 25
        }
      ],
      missingElements: [],
      recommendations: [
        'Document annual dilated retinal examination date.'
      ],
      billingAuditRisk: 'Low'
    },
    icdCodes: [
      {
        code: 'E11.40',
        description: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified',
        category: 'Diabetes mellitus',
        isPrimary: true,
        confidence: 0.95,
        billable: true,
        clinicalNotes: 'Primary diagnosis capturing both DM and peripheral neuropathic presentation.'
      },
      {
        code: 'E11.69',
        description: 'Type 2 diabetes mellitus with other specified complication (Microalbuminuria)',
        category: 'Diabetes mellitus',
        isPrimary: false,
        confidence: 0.91,
        billable: true,
        clinicalNotes: 'Co-morbid microalbuminuria requiring nephroprotective SGLT2i.'
      }
    ],
    ehrJson: '',
    messages: [],
    status: 'completed'
  },
  {
    id: 'consult-primary-03',
    title: 'Urgent Care: Acute Bronchitis & Persistent Cough',
    timestamp: 'Sep 21, 2026',
    patient: {
      id: 'PT-10115',
      name: 'Marcus Vance',
      age: 38,
      gender: 'Male',
      dob: '1988-07-22',
      mrn: 'MRN-449102',
      encounterDate: '2026-09-21',
      provider: 'Dr. Aditya M., MD',
      specialty: 'Urgent Care & Family Medicine'
    },
    transcript: `Doctor: Hi Marcus, how can I help you today?
Patient: Doctor, I've had this deep, rattling cough for almost 9 days. It started with a sore throat and runny nose, but now I'm coughing up thick yellow mucus.
Doctor: Any high fevers, shaking chills, or sharp chest pain when breathing in?
Patient: Low-grade fever around 99.5 initially, but no chills. My chest feels sore from all the coughing, but no sharp stabbing pain.
Doctor: Any history of asthma or inhaler use?
Patient: No asthma, never smoked.
Doctor: On physical exam, temperature is 98.6 F, pulse 78, BP 120/78, SpO2 99% on ambient air.
Doctor: Oropharynx is mildly erythematous, no exudates. Chest auscultation reveals scattered coarse expiratory rhonchi that clear partially with coughing. No focal consolidation, egophony, or wheezes.
Doctor: This is classic acute viral bronchitis. Because this is viral, antibiotics like Amoxicillin or Azithromycin will not be beneficial and could cause side effects.
Doctor: We will prescribe Benzonatate pearls for cough suppression, advise Guaifenesin for mucus thinning, and honey with warm tea. If your fever spikes above 101 F or you develop shortness of breath, return immediately for a chest X-ray.`,
    audioFileName: 'encounter_marcus_vance_0921.wav',
    audioDurationSeconds: 115,
    soap: {
      subjective: {
        chiefComplaint: 'Productive cough with yellow sputum for 9 days following viral prodrome.',
        historyOfPresentIllness: '38-year-old non-smoker presents with a 9-day history of persistent productive cough with yellowish phlegm following upper respiratory viral prodrome. Reports chest wall soreness secondary to coughing paroxysms. Denies dyspnea at rest, hemoptysis, shaking chills, or pleuritic chest pain.',
        reviewOfSystems: [
          'Respiratory: Positive for productive cough; negative for wheezing or dyspnea.',
          'Constitutional: Negative for acute fever or night sweats.',
          'HEENT: Mild resolved rhinitis.'
        ],
        pastMedicalHistory: [
          'No chronic medical conditions'
        ],
        medications: [
          'None regularly'
        ],
        allergies: [
          'NKDA'
        ]
      },
      objective: {
        vitals: {
          bloodPressure: '120/78 mmHg',
          heartRate: '78 bpm',
          respiratoryRate: '15 breaths/min',
          oxygenSaturation: '99% on RA',
          temperature: '98.6 °F'
        },
        physicalExam: {
          general: 'Alert, well-appearing in no respiratory distress.',
          respiratory: 'Scattered bilateral coarse rhonchi clearing significantly after cough. No rales, dullness to percussion, or egophony.',
          cardiovascular: 'Regular rate and rhythm. No murmurs.',
          other: 'Pharynx mildly injected, tonsils 1+ without exudate.'
        }
      },
      assessment: {
        primaryDiagnosis: 'Acute bronchitis, unspecified',
        differentialDiagnoses: [
          'Community-Acquired Pneumonia',
          'Post-nasal drip syndrome (UACS)',
          'COVID-19 / Influenza infection'
        ],
        clinicalRationale: 'Productive cough >5 days duration without focal auscultatory consolidation, tachypnea, or tachycardia, typical of self-limited acute bronchitis.',
        riskLevel: 'Low'
      },
      plan: {
        diagnosticsOrdered: [
          'No routine chest radiograph indicated based on normal vital signs and absence of focal lung consolidation.'
        ],
        treatmentAndMedications: [
          'Benzonatate (Tessalon Perles) 100 mg PO TID PRN severe cough paroxysms',
          'Guaifenesin 400 mg PO Q4H PRN for mucus clearance',
          'Antimicrobial stewardship: Antibiotic therapy explicitly discussed and deferred due to viral etiology.'
        ],
        patientEducation: [
          'Cough expected to persist 1-3 weeks. Rest, oral hydration, warm steam inhalation.'
        ],
        redFlagsAndPrecautions: [
          'Return immediately if fever >101 °F develops, hemoptysis, or shortness of breath occurs.'
        ],
        followUp: 'PRN return in 7-10 days if symptoms worsen or fail to improve.'
      }
    },
    compliance: {
      score: 95,
      rating: 'Exemplary',
      items: [
        {
          id: 'c-1',
          category: 'core',
          label: 'Subjective Component',
          description: 'HPI cough duration and prodrome documented.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-2',
          category: 'core',
          label: 'Objective Examination & Vitals',
          description: 'Vitals and pulmonary examination fully captured.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-3',
          category: 'core',
          label: 'Assessment & Antimicrobial Stewardship',
          description: 'Evidence-based non-antibiotic approach clearly reasoned.',
          passed: true,
          weight: 25
        },
        {
          id: 'c-4',
          category: 'core',
          label: 'Plan & Red Flags',
          description: 'Symptomatic therapy and pneumonia red flags provided.',
          passed: true,
          weight: 25
        }
      ],
      missingElements: [],
      recommendations: [
        'Document rapid COVID-19 or flu test status if performed.'
      ],
      billingAuditRisk: 'Low'
    },
    icdCodes: [
      {
        code: 'J20.9',
        description: 'Acute bronchitis, unspecified',
        category: 'Acute lower respiratory infections',
        isPrimary: true,
        confidence: 0.96,
        billable: true,
        clinicalNotes: 'Primary diagnostic code supported by clinical presentation.'
      },
      {
        code: 'R05.9',
        description: 'Cough, unspecified',
        category: 'Symptoms involving the respiratory system',
        isPrimary: false,
        confidence: 0.90,
        billable: true,
        clinicalNotes: 'Symptom identifier.'
      }
    ],
    ehrJson: '',
    messages: [],
    status: 'completed'
  }
];

// Helper to initialize EHR JSON strings
SAMPLE_CONSULTATIONS.forEach(c => {
  c.ehrJson = JSON.stringify({
    resourceType: 'Encounter',
    id: c.id,
    status: 'completed',
    patient: {
      reference: `Patient/${c.patient.id}`,
      display: c.patient.name,
      gender: c.patient.gender.toLowerCase(),
      birthDate: c.patient.dob
    },
    period: {
      start: `${c.patient.encounterDate}T09:00:00Z`,
      end: `${c.patient.encounterDate}T09:30:00Z`
    },
    serviceProvider: {
      name: 'AetherHealth Clinical Network',
      specialty: c.patient.specialty
    },
    soapNote: c.soap,
    complianceScore: c.compliance.score,
    icdCodes: c.icdCodes,
    rawTranscript: c.transcript,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      auditTrail: 'AI Assisted Clinical Documentation Engine v2.5'
    }
  }, null, 2);

  c.messages = [
    {
      id: `msg-usr-${c.id}`,
      sender: 'user',
      timestamp: c.timestamp,
      text: c.transcript,
      audioAttachment: c.audioFileName ? {
        name: c.audioFileName,
        duration: `${Math.floor((c.audioDurationSeconds || 60) / 60)}:${((c.audioDurationSeconds || 60) % 60).toString().padStart(2, '0')}`
      } : undefined
    },
    {
      id: `msg-asst-${c.id}`,
      sender: 'assistant',
      timestamp: c.timestamp,
      text: `Clinical encounter successfully transcribed and analyzed. Generated structured SOAP note, verified documentation compliance (${c.compliance.score}%), and mapped ${c.icdCodes.length} ICD-10 diagnosis codes.`,
      consultationData: {
        soap: c.soap,
        compliance: c.compliance,
        icdCodes: c.icdCodes,
        ehrJson: c.ehrJson
      }
    }
  ];
});
