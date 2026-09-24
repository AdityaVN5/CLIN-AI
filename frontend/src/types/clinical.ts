export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mrn: string;
  encounterDate: string;
  provider: string;
  specialty: string;
}

export interface SOAPNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    pastMedicalHistory: string[];
    medications: string[];
    allergies: string[];
  };
  objective: {
    vitals: {
      bloodPressure: string;
      heartRate: string;
      respiratoryRate: string;
      oxygenSaturation: string;
      temperature: string;
      bmi?: string;
    };
    physicalExam: {
      general: string;
      cardiovascular?: string;
      respiratory?: string;
      gastrointestinal?: string;
      neurological?: string;
      musculoskeletal?: string;
      skin?: string;
      other?: string;
    };
    diagnosticTests?: string[];
  };
  assessment: {
    primaryDiagnosis: string;
    differentialDiagnoses: string[];
    clinicalRationale: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
  };
  plan: {
    diagnosticsOrdered: string[];
    treatmentAndMedications: string[];
    patientEducation: string[];
    redFlagsAndPrecautions: string[];
    followUp: string;
  };
}

export interface ComplianceCheckItem {
  id: string;
  category: 'core' | 'quality' | 'billing' | 'safety';
  label: string;
  description: string;
  passed: boolean;
  weight: number;
  recommendation?: string;
}

export interface ComplianceAudit {
  score: number; // 0 - 100
  rating: 'Exemplary' | 'Compliant' | 'Sub-optimal' | 'Non-compliant';
  items: ComplianceCheckItem[];
  missingElements: string[];
  recommendations: string[];
  billingAuditRisk: 'Low' | 'Moderate' | 'High';
  status?: string;
  required_sections?: {
    subjective: boolean;
    objective: boolean;
    assessment: boolean;
    plan: boolean;
  };
  passed_checks?: string[];
  warnings?: string[];
  missing_information?: string[];
  llm_available?: boolean;
}

export interface ICDCode {
  code: string;
  description: string;
  category: string;
  isPrimary?: boolean;
  confidence: number;
  billable: boolean;
  clinicalNotes?: string;
}

export interface EHRDocument {
  resourceType: 'Encounter';
  id: string;
  status: 'completed' | 'in-progress';
  patient: {
    reference: string;
    display: string;
    gender: string;
    birthDate: string;
  };
  period: {
    start: string;
    end: string;
  };
  serviceProvider: {
    name: string;
    specialty: string;
  };
  soapNote: SOAPNote;
  complianceScore: number;
  icdCodes: ICDCode[];
  rawTranscript: string;
  metadata: {
    generatedAt: string;
    version: string;
    auditTrail: string;
  };
}

export interface Consultation {
  id: string;
  title: string;
  timestamp: string;
  patient: PatientInfo;
  transcript: string;
  audioFileName?: string;
  audioDurationSeconds?: number;
  soap: SOAPNote;
  compliance: ComplianceAudit;
  icdCodes: ICDCode[];
  ehrJson: string;
  messages: ChatMessage[];
  status: 'draft' | 'completed' | 'reviewed';
  isPinned?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  audioAttachment?: {
    name: string;
    duration: string;
  };
  consultationData?: {
    soap: SOAPNote;
    compliance: ComplianceAudit;
    icdCodes: ICDCode[];
    ehrJson: string;
  };
}
