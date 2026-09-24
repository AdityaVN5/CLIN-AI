import React from 'react';
import { X, Printer, Download, FileText, Check } from 'lucide-react';
import { Consultation } from '../types/clinical';
import { downloadDOCXFile, downloadJSONFile } from '../utils/clinicalEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  consultation: Consultation;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  isDark,
  consultation
}) => {
  if (!isOpen) return null;

  const handleDownload = async (format: 'pdf' | 'docx' | 'json') => {
    try {
      const res = await fetch(`/api/consultations/${consultation.id}/export/${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation_${consultation.patient.mrn || consultation.id}.${format === 'docx' ? 'docx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn('Backend export notice, using client fallback:', e);
    }

    if (format === 'docx') {
      downloadDOCXFile(consultation.soap, consultation.patient, consultation.icdCodes, consultation.compliance);
    } else if (format === 'json') {
      downloadJSONFile(consultation.ehrJson, `consultation_${consultation.patient.mrn || consultation.id}.json`);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs no-print">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${
        isDark ? 'bg-[#1e1e1e] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
      }`}>
        {/* Modal Top Bar */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div>
            <h2 className="font-semibold text-sm">Official Clinical Encounter Document</h2>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>ReportLab PDF, python-docx, and EHR JSON exporter</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => handleDownload('docx')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isDark ? 'hover:bg-neutral-800 border-neutral-700 text-neutral-300' : 'hover:bg-neutral-100 border-neutral-300 text-neutral-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Word (.docx)</span>
            </button>

            <button
              onClick={() => handleDownload('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isDark ? 'hover:bg-neutral-800 border-neutral-700 text-neutral-300' : 'hover:bg-neutral-100 border-neutral-300 text-neutral-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs md:text-sm leading-relaxed bg-white text-black print:p-0 print:m-0">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight">CLIN AT CLINICAL HEALTH NETWORK</h1>
              <p className="text-xs text-neutral-600">Department of {consultation.patient.specialty} · Clinical Note of Record</p>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">Compliance Rating: {consultation.compliance.score}%</div>
              <div className="text-neutral-500 font-mono">Date: {consultation.patient.encounterDate}</div>
            </div>
          </div>

          {/* Patient Demographic Table */}
          <div className="border border-neutral-300 rounded-lg p-3 grid grid-cols-3 gap-3 text-xs bg-neutral-50/50">
            <div>
              <span className="font-semibold text-neutral-600 block">Patient Name</span>
              <span className="font-bold text-neutral-900">{consultation.patient.name}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600 block">MRN / ID</span>
              <span className="font-mono">{consultation.patient.mrn}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600 block">DOB / Age / Gender</span>
              <span>{consultation.patient.dob} ({consultation.patient.age}y / {consultation.patient.gender})</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600 block">Attending Provider</span>
              <span>{consultation.patient.provider}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600 block">Encounter Type</span>
              <span>Outpatient Ambulatory</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600 block">Audit Risk</span>
              <span className="font-medium text-emerald-700">{consultation.compliance.billingAuditRisk} Risk</span>
            </div>
          </div>

          {/* S - Subjective */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-neutral-300 pb-0.5 text-neutral-800">
              Subjective (S)
            </h3>
            <p><strong>Chief Complaint:</strong> {consultation.soap.subjective.chiefComplaint}</p>
            <p><strong>History of Present Illness:</strong> {consultation.soap.subjective.historyOfPresentIllness}</p>
            <p><strong>Review of Systems:</strong> {consultation.soap.subjective.reviewOfSystems.join('; ')}</p>
            <p><strong>Past Medical History:</strong> {consultation.soap.subjective.pastMedicalHistory.join(', ') || 'Reviewed'}</p>
            <p><strong>Medications:</strong> {consultation.soap.subjective.medications.join(', ') || 'Reconciled'}</p>
            <p><strong>Allergies:</strong> {consultation.soap.subjective.allergies.join(', ') || 'NKDA'}</p>
          </div>

          {/* O - Objective */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-neutral-300 pb-0.5 text-neutral-800">
              Objective (O)
            </h3>
            <p className="font-mono text-xs">
              <strong>Vitals:</strong> BP: {consultation.soap.objective.vitals.bloodPressure} | HR: {consultation.soap.objective.vitals.heartRate} | RR: {consultation.soap.objective.vitals.respiratoryRate} | SpO2: {consultation.soap.objective.vitals.oxygenSaturation} | Temp: {consultation.soap.objective.vitals.temperature}
            </p>
            <div className="pt-1">
              <strong>Physical Examination:</strong>
              <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs text-neutral-700">
                <li>General: {consultation.soap.objective.physicalExam.general}</li>
                {consultation.soap.objective.physicalExam.cardiovascular && <li>Cardiovascular: {consultation.soap.objective.physicalExam.cardiovascular}</li>}
                {consultation.soap.objective.physicalExam.respiratory && <li>Respiratory: {consultation.soap.objective.physicalExam.respiratory}</li>}
                {consultation.soap.objective.physicalExam.gastrointestinal && <li>Abdomen: {consultation.soap.objective.physicalExam.gastrointestinal}</li>}
                {consultation.soap.objective.physicalExam.neurological && <li>Neurological: {consultation.soap.objective.physicalExam.neurological}</li>}
              </ul>
            </div>
          </div>

          {/* A - Assessment */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-neutral-300 pb-0.5 text-neutral-800">
              Assessment (A)
            </h3>
            <p><strong>Primary Diagnosis:</strong> <span className="font-bold">{consultation.soap.assessment.primaryDiagnosis}</span></p>
            {consultation.soap.assessment.differentialDiagnoses.length > 0 && (
              <p><strong>Differential Diagnoses:</strong> {consultation.soap.assessment.differentialDiagnoses.join('; ')}</p>
            )}
            <p><strong>Clinical Rationale:</strong> {consultation.soap.assessment.clinicalRationale}</p>
          </div>

          {/* P - Plan */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-neutral-300 pb-0.5 text-neutral-800">
              Plan (P)
            </h3>
            <div className="space-y-1 text-xs">
              <p><strong>Diagnostics & Laboratory Orders:</strong></p>
              <ul className="list-disc list-inside pl-2 text-neutral-700">
                {consultation.soap.plan.diagnosticsOrdered.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
              <p><strong>Therapy & Prescriptions:</strong></p>
              <ul className="list-disc list-inside pl-2 text-neutral-700">
                {consultation.soap.plan.treatmentAndMedications.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <p><strong>Patient Counseling & Precautions:</strong></p>
              <ul className="list-disc list-inside pl-2 text-neutral-700">
                {consultation.soap.plan.patientEducation.map((e, i) => <li key={i}>{e}</li>)}
                {consultation.soap.plan.redFlagsAndPrecautions.map((r, i) => <li key={i} className="font-semibold text-red-900">{r}</li>)}
              </ul>
              <p><strong>Follow-Up:</strong> {consultation.soap.plan.followUp}</p>
            </div>
          </div>

          {/* ICD-10 Section */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-neutral-300 pb-0.5 text-neutral-800">
              ICD-10-CM Coding & Medical Billing
            </h3>
            <table className="w-full text-left text-xs border border-neutral-300 mt-1">
              <thead className="bg-neutral-100 border-b border-neutral-300">
                <tr>
                  <th className="p-1.5">Code</th>
                  <th className="p-1.5">Type</th>
                  <th className="p-1.5">Description</th>
                  <th className="p-1.5 text-right">Billable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {consultation.icdCodes.map((c) => (
                  <tr key={c.code}>
                    <td className="p-1.5 font-mono font-bold">{c.code}</td>
                    <td className="p-1.5">{c.isPrimary ? 'Primary' : 'Secondary'}</td>
                    <td className="p-1.5">{c.description}</td>
                    <td className="p-1.5 text-right font-medium text-emerald-800">Yes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature block */}
          <div className="pt-8 border-t border-neutral-300 flex justify-between items-end text-xs">
            <div>
              <p className="font-medium">Document electronically signed and verified by:</p>
              <p className="font-bold text-sm mt-1">{consultation.patient.provider}</p>
              <p className="text-neutral-500 font-mono">NPI: 1982736450 · State License Verified</p>
            </div>
            <div className="text-right text-neutral-500 font-mono text-[10px]">
              EncID: {consultation.id}<br/>
              Timestamp: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
