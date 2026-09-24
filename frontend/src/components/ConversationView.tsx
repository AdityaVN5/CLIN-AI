import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  FileCode, 
  ShieldCheck, 
  Activity, 
  Hash, 
  Stethoscope,
  Volume2,
  Play,
  Pause,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Info,
  Plus
} from 'lucide-react';
import { Consultation, SOAPNote, ICDCode, ComplianceAudit, ChatMessage } from '../types/clinical';
import { ICD10_DATASET } from '../data/icdDatabase';

interface ConversationViewProps {
  consultation: Consultation;
  messages: ChatMessage[];
  isDark: boolean;
  onUpdateSoap: (updatedSoap: SOAPNote) => void;
  onAddICDCode: (code: ICDCode) => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onExportJSON: () => void;
  onRegenerate: () => void;
  doctorName: string;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  consultation,
  messages,
  isDark,
  onUpdateSoap,
  onAddICDCode,
  onExportPDF,
  onExportDOCX,
  onExportJSON,
  onRegenerate,
  doctorName
}) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'compliance' | 'icd' | 'ehr' | 'transcript'>('soap');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSoap, setEditedSoap] = useState<SOAPNote>(consultation.soap);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchICDQuery, setSearchICDQuery] = useState('');
  const [showICDSuggestions, setShowICDSuggestions] = useState(false);
  const [expandedPassedChecks, setExpandedPassedChecks] = useState(false);
  const [expandedMissingInfo, setExpandedMissingInfo] = useState(true);
  const [expandedWarnings, setExpandedWarnings] = useState(true);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateSoap(editedSoap);
    setIsEditing(false);
  };

  const filteredAvailableICD = ICD10_DATASET.filter(c => 
    !consultation.icdCodes.some(existing => existing.code === c.code) &&
    (c.code.toLowerCase().includes(searchICDQuery.toLowerCase()) ||
     c.description.toLowerCase().includes(searchICDQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Render Conversation Messages */}
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';

        if (isUser) {
          return (
            <div key={msg.id} className="flex gap-3 justify-end items-start group">
              <div className="max-w-2xl space-y-2">
                {/* Audio attachment if present */}
                {msg.audioAttachment && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
                    isDark ? 'bg-neutral-800/80 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm truncate max-w-[200px]">{msg.audioAttachment.name}</div>
                        <div className="text-[11px] text-neutral-400">Audio Recording · {msg.audioAttachment.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 h-4">
                      {[30, 70, 45, 90, 60, 80, 40, 100, 65, 85].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${isPlayingAudio ? (h % 100) : 30}%` }}
                          className={`w-1 rounded-full transition-all duration-150 ${isDark ? 'bg-neutral-400' : 'bg-neutral-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Bubble */}
                <div className={`p-4 rounded-2xl text-[15px] md:text-base whitespace-pre-wrap leading-relaxed ${
                  isDark 
                    ? 'bg-neutral-800 text-[#ececec] border border-neutral-700/60' 
                    : 'bg-neutral-100 text-[#171717] border border-neutral-200'
                }`}>
                  {msg.text}
                </div>
              </div>

              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                isDark ? 'bg-neutral-700 text-white' : 'bg-neutral-300 text-black'
              }`}>
                AM
              </div>
            </div>
          );
        }

        // Assistant Message with Modular Tabs
        return (
          <div key={msg.id} className="flex gap-3.5 items-start">
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-1 ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <Stethoscope className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div className="flex-1 space-y-4 min-w-0">
              {/* Introduction summary */}
              <div className={`text-[15px] md:text-base leading-relaxed ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                {msg.text}
              </div>

              {/* Distinct High-Hierarchy Segmented Navigation Tabs */}
              <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
                isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-neutral-100 border-neutral-200/90 shadow-2xs'
              }`}>
                <button
                  onClick={() => setActiveTab('soap')}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeTab === 'soap'
                      ? isDark 
                        ? 'bg-white text-black shadow-md ring-1 ring-white/20' 
                        : 'bg-black text-white shadow-md ring-1 ring-black/10'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70 font-medium'
                  }`}
                >
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                  <span>SOAP Note</span>
                </button>

                <button
                  onClick={() => setActiveTab('compliance')}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeTab === 'compliance'
                      ? isDark 
                        ? 'bg-white text-black shadow-md ring-1 ring-white/20' 
                        : 'bg-black text-white shadow-md ring-1 ring-black/10'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70 font-medium'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  <span>Compliance ({consultation.compliance.score}%)</span>
                </button>

                <button
                  onClick={() => setActiveTab('icd')}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeTab === 'icd'
                      ? isDark 
                        ? 'bg-white text-black shadow-md ring-1 ring-white/20' 
                        : 'bg-black text-white shadow-md ring-1 ring-black/10'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70 font-medium'
                  }`}
                >
                  <Hash className="w-4 h-4 stroke-[2.2]" />
                  <span>ICD-10 ({consultation.icdCodes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ehr')}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeTab === 'ehr'
                      ? isDark 
                        ? 'bg-white text-black shadow-md ring-1 ring-white/20' 
                        : 'bg-black text-white shadow-md ring-1 ring-black/10'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70 font-medium'
                  }`}
                >
                  <FileCode className="w-4 h-4 stroke-[2.2]" />
                  <span>EHR JSON</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeTab === 'transcript'
                      ? isDark 
                        ? 'bg-white text-black shadow-md ring-1 ring-white/20' 
                        : 'bg-black text-white shadow-md ring-1 ring-black/10'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70 font-medium'
                  }`}
                >
                  <Volume2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Consultation Dialogue</span>
                </button>
              </div>

              {/* Tab 1: SOAP Note */}
              {activeTab === 'soap' && (
                <div className={`p-5 md:p-6 rounded-2xl border space-y-6 text-sm md:text-base ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base md:text-lg">Clinical Documentation (SOAP)</span>
                      <span className="text-xs text-neutral-400 font-mono">CMS 1997 / 2021 MDM Guidelines</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={handleSaveEdit}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                            isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                          }`}
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(JSON.stringify(consultation.soap, null, 2), 'soap-all')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                          isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {copiedKey === 'soap-all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedKey === 'soap-all' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* S - Subjective */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                      <span>Subjective (S)</span>
                      <button
                        onClick={() => handleCopy(`Chief Complaint: ${consultation.soap.subjective.chiefComplaint}\nHPI: ${consultation.soap.subjective.historyOfPresentIllness}`, 's')}
                        className={`text-xs normal-case ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                      >
                        {copiedKey === 's' ? 'Copied' : 'Copy S'}
                      </button>
                    </div>

                    <div className={`space-y-2 pl-3 border-l-2 text-sm md:text-base ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Chief Complaint: </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedSoap.subjective.chiefComplaint}
                            onChange={(e) => setEditedSoap({
                              ...editedSoap,
                              subjective: { ...editedSoap.subjective, chiefComplaint: e.target.value }
                            })}
                            className={`w-full p-2 rounded-lg mt-1 text-sm md:text-base border ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'}`}
                          />
                        ) : (
                          <span className={isDark ? 'text-neutral-300' : 'text-neutral-800'}>{consultation.soap.subjective.chiefComplaint}</span>
                        )}
                      </div>

                      <div>
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>History of Present Illness (HPI): </span>
                        {isEditing ? (
                          <textarea
                            value={editedSoap.subjective.historyOfPresentIllness}
                            onChange={(e) => setEditedSoap({
                              ...editedSoap,
                              subjective: { ...editedSoap.subjective, historyOfPresentIllness: e.target.value }
                            })}
                            rows={3}
                            className={`w-full p-2 rounded-lg mt-1 text-sm md:text-base border ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'}`}
                          />
                        ) : (
                          <p className={`mt-1 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.subjective.historyOfPresentIllness}
                          </p>
                        )}
                      </div>

                      {consultation.soap.subjective.reviewOfSystems?.length > 0 && (
                        <div className="pt-1">
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Review of Systems: </span>
                          <ul className={`list-disc list-inside mt-1 space-y-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.subjective.reviewOfSystems.map((ros, idx) => (
                              <li key={idx}>{ros}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className={`pt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Medications: </span>
                          <span>{consultation.soap.subjective.medications.join(', ') || 'Reconciled'}</span>
                        </div>
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Allergies: </span>
                          <span>{consultation.soap.subjective.allergies.join(', ') || 'NKDA'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* O - Objective */}
                  <div className={`space-y-2.5 pt-4 border-t ${isDark ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                      <span>Objective (O)</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(consultation.soap.objective, null, 2), 'o')}
                        className={`text-xs normal-case ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                      >
                        {copiedKey === 'o' ? 'Copied' : 'Copy O'}
                      </button>
                    </div>

                    <div className={`space-y-3 pl-3 border-l-2 text-sm md:text-base ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
                      {/* Vitals Ribbon */}
                      <div className={`p-3 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-center border ${
                        isDark ? 'bg-neutral-800/60 border-neutral-700/60 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                      }`}>
                        <div>
                          <div className="text-xs text-neutral-500 font-sans font-medium">BP</div>
                          <div className="font-bold text-sm sm:text-base font-mono">{consultation.soap.objective.vitals.bloodPressure}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-sans font-medium">HR</div>
                          <div className="font-bold text-sm sm:text-base font-mono">{consultation.soap.objective.vitals.heartRate}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-sans font-medium">RR</div>
                          <div className="font-bold text-sm sm:text-base font-mono">{consultation.soap.objective.vitals.respiratoryRate}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-sans font-medium">SpO2</div>
                          <div className="font-bold text-sm sm:text-base font-mono">{consultation.soap.objective.vitals.oxygenSaturation}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-sans font-medium">Temp</div>
                          <div className="font-bold text-sm sm:text-base font-mono">{consultation.soap.objective.vitals.temperature}</div>
                        </div>
                      </div>

                      {/* Physical Exam */}
                      <div className="space-y-1.5 text-sm md:text-base">
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Physical Examination:</span>
                        <ul className={`space-y-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          <li><strong className={isDark ? 'text-neutral-200' : 'text-neutral-900'}>General:</strong> {consultation.soap.objective.physicalExam.general}</li>
                          {consultation.soap.objective.physicalExam.cardiovascular && (
                            <li><strong className={isDark ? 'text-neutral-200' : 'text-neutral-900'}>Cardiovascular:</strong> {consultation.soap.objective.physicalExam.cardiovascular}</li>
                          )}
                          {consultation.soap.objective.physicalExam.respiratory && (
                            <li><strong className={isDark ? 'text-neutral-200' : 'text-neutral-900'}>Respiratory:</strong> {consultation.soap.objective.physicalExam.respiratory}</li>
                          )}
                          {consultation.soap.objective.physicalExam.gastrointestinal && (
                            <li><strong className={isDark ? 'text-neutral-200' : 'text-neutral-900'}>Abdomen:</strong> {consultation.soap.objective.physicalExam.gastrointestinal}</li>
                          )}
                          {consultation.soap.objective.physicalExam.neurological && (
                            <li><strong className={isDark ? 'text-neutral-200' : 'text-neutral-900'}>Neurological:</strong> {consultation.soap.objective.physicalExam.neurological}</li>
                          )}
                        </ul>
                      </div>

                      {consultation.soap.objective.diagnosticTests && consultation.soap.objective.diagnosticTests.length > 0 && (
                        <div className="pt-1">
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>In-Clinic Diagnostics / Labs:</span>
                          <ul className={`list-disc list-inside mt-1 space-y-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.objective.diagnosticTests.map((test, idx) => (
                              <li key={idx}>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* A - Assessment */}
                  <div className={`space-y-2.5 pt-4 border-t ${isDark ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                      <span>Assessment (A)</span>
                      <button
                        onClick={() => handleCopy(`Primary Diagnosis: ${consultation.soap.assessment.primaryDiagnosis}\nRationale: ${consultation.soap.assessment.clinicalRationale}`, 'a')}
                        className={`text-xs normal-case ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                      >
                        {copiedKey === 'a' ? 'Copied' : 'Copy A'}
                      </button>
                    </div>

                    <div className={`space-y-2 pl-3 border-l-2 text-sm md:text-base ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Primary Clinical Impression: </span>
                        <span className={`font-bold text-base md:text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                          {consultation.soap.assessment.primaryDiagnosis}
                        </span>
                      </div>

                      {consultation.soap.assessment.differentialDiagnoses.length > 0 && (
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Differential Diagnoses: </span>
                          <span className={isDark ? 'text-neutral-300' : 'text-neutral-700'}>{consultation.soap.assessment.differentialDiagnoses.join('; ')}</span>
                        </div>
                      )}

                      <div>
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Clinical Rationale: </span>
                        <p className={`mt-1 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {consultation.soap.assessment.clinicalRationale}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* P - Plan */}
                  <div className={`space-y-2.5 pt-4 border-t ${isDark ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                      <span>Plan (P)</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(consultation.soap.plan, null, 2), 'p')}
                        className={`text-xs normal-case ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                      >
                        {copiedKey === 'p' ? 'Copied' : 'Copy P'}
                      </button>
                    </div>

                    <div className={`space-y-3 pl-3 border-l-2 text-sm md:text-base ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
                      {consultation.soap.plan.diagnosticsOrdered.length > 0 && (
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Diagnostic Orders & Labs:</span>
                          <ul className={`list-disc list-inside mt-1 space-y-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.plan.diagnosticsOrdered.map((diag, idx) => (
                              <li key={idx}>{diag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {consultation.soap.plan.treatmentAndMedications.length > 0 && (
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Therapy & Prescriptions:</span>
                          <ul className={`list-disc list-inside mt-1 space-y-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.plan.treatmentAndMedications.map((tx, idx) => (
                              <li key={idx}>{tx}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {consultation.soap.plan.patientEducation.length > 0 && (
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Patient Education & Counseling:</span>
                          <ul className={`list-disc list-inside mt-1 space-y-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {consultation.soap.plan.patientEducation.map((ed, idx) => (
                              <li key={idx}>{ed}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {consultation.soap.plan.redFlagsAndPrecautions.length > 0 && (
                        <div className={`p-3 rounded-xl text-sm border ${
                          isDark ? 'bg-red-950/30 border-red-900/50 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <span className="font-bold block mb-1">Emergency Precautions:</span>
                          {consultation.soap.plan.redFlagsAndPrecautions.join(' ')}
                        </div>
                      )}

                      <div className="pt-1">
                        <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Follow-up: </span>
                        <span className={isDark ? 'text-neutral-300' : 'text-neutral-800'}>{consultation.soap.plan.followUp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Compliance Agent Audit */}
              {activeTab === 'compliance' && (
                <div className={`p-5 md:p-6 rounded-2xl border space-y-6 text-sm md:text-base ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
                }`}>
                  <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
                        <h3 className="font-bold text-base md:text-lg">Documentation Completeness & Quality Audit</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                        Evaluating completeness against CMS Evaluation & Management (E/M) and institutional guidelines.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-3xl font-bold font-mono tracking-tight">
                          {consultation.compliance.score}%
                        </div>
                        <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                          {consultation.compliance.status || consultation.compliance.rating}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${
                        consultation.compliance.billingAuditRisk === 'Low'
                          ? isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDark ? 'bg-amber-950/80 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {consultation.compliance.billingAuditRisk} Audit Risk
                      </div>
                    </div>
                  </div>

                  {/* Required SOAP Sections (Streamlit Parity) */}
                  <div className="space-y-2">
                    <span className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider">
                      Required SOAP Sections
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(['subjective', 'objective', 'assessment', 'plan'] as const).map((sec) => {
                        const req = consultation.compliance.required_sections;
                        const isPresent = req ? Boolean(req[sec]) : true;
                        return (
                          <div
                            key={sec}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 font-semibold text-xs sm:text-sm ${
                              isPresent
                                ? isDark ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : isDark ? 'bg-red-950/40 border-red-800/80 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPresent
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-200 text-emerald-800'
                                : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-200 text-red-800'
                            }`}>
                              {isPresent ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                            <span className="capitalize">{sec}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checklist of Core Documentation Pillars */}
                  <div className="space-y-2.5">
                    <span className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider">
                      Core Documentation Checklist
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {consultation.compliance.items.map((item) => (
                        <div 
                          key={item.id}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                            isDark ? 'bg-neutral-800/40 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            item.passed 
                              ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.passed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </div>
                          <div>
                            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-neutral-900'}`}>{item.label}</div>
                            <div className={`text-xs sm:text-sm mt-0.5 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{item.description}</div>
                            {item.recommendation && !item.passed && (
                              <div className={`mt-1.5 text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                Tip: {item.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passed Checks (Accordion) */}
                  {consultation.compliance.passed_checks && consultation.compliance.passed_checks.length > 0 && (
                    <div className={`border rounded-xl p-3.5 ${isDark ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-200 bg-neutral-50/50'}`}>
                      <button
                        onClick={() => setExpandedPassedChecks(!expandedPassedChecks)}
                        className="w-full flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-400 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Passed Checks ({consultation.compliance.passed_checks.length})</span>
                        </span>
                        {expandedPassedChecks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {expandedPassedChecks && (
                        <ul className={`mt-3 space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {consultation.compliance.passed_checks.map((chk, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{chk}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Missing Information & Optimization Notes */}
                  {consultation.compliance.missingElements && consultation.compliance.missingElements.length > 0 && (
                    <div className={`border rounded-xl p-3.5 ${isDark ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-200 bg-neutral-50/50'}`}>
                      <button
                        onClick={() => setExpandedMissingInfo(!expandedMissingInfo)}
                        className="w-full flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-400 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span>Completeness & Missing Information Notes ({consultation.compliance.missingElements.length})</span>
                        </span>
                        {expandedMissingInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {expandedMissingInfo && (
                        <ul className={`mt-3 space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {consultation.compliance.missingElements.map((m, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Documentation Warnings */}
                  {consultation.compliance.warnings && consultation.compliance.warnings.length > 0 && (
                    <div className={`border rounded-xl p-3.5 ${
                      isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <button
                        onClick={() => setExpandedWarnings(!expandedWarnings)}
                        className="w-full flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Audit Warnings ({consultation.compliance.warnings.length})</span>
                        </span>
                        {expandedWarnings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {expandedWarnings && (
                        <ul className="mt-3 space-y-1.5 text-xs sm:text-sm pl-1">
                          {consultation.compliance.warnings.map((w, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className={`space-y-2.5 pt-4 border-t ${isDark ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                    <span className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider">
                      Clinical Recommendations & Audit Protections
                    </span>
                    <ul className={`list-disc list-inside space-y-1.5 text-sm pl-1 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {consultation.compliance.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 3: ICD-10 Coding Agent */}
              {activeTab === 'icd' && (
                <div className={`p-5 md:p-6 rounded-2xl border space-y-6 text-sm md:text-base ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                    <div>
                      <h3 className="font-bold text-base md:text-lg">Suggested ICD-10-CM Diagnosis Codes</h3>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Matched against clinical assessment, chief complaint, and symptomatology.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowICDSuggestions(!showICDSuggestions)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                        isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white' : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-black'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Code</span>
                    </button>
                  </div>

                  {/* Add ICD Code Dropdown/Search */}
                  {showICDSuggestions && (
                    <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                      isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300'
                    }`}>
                      <div className="text-sm font-semibold">Search ICD-10 Knowledge Base</div>
                      <input
                        type="text"
                        placeholder="Search by code (e.g. R07, I10) or diagnosis description..."
                        value={searchICDQuery}
                        onChange={(e) => setSearchICDQuery(e.target.value)}
                        className={`w-full p-2.5 rounded-lg text-sm border ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                        }`}
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1">
                        {filteredAvailableICD.slice(0, 5).map((codeItem) => (
                          <div
                            key={codeItem.code}
                            onClick={() => {
                              onAddICDCode(codeItem);
                              setShowICDSuggestions(false);
                            }}
                            className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors ${
                              isDark ? 'hover:bg-neutral-700 text-neutral-200' : 'hover:bg-neutral-200 text-black'
                            }`}
                          >
                            <div>
                              <span className={`font-mono font-bold mr-2 text-sm ${isDark ? 'text-white' : 'text-black'}`}>{codeItem.code}</span>
                              <span className={isDark ? 'text-neutral-200' : 'text-neutral-800'}>{codeItem.description}</span>
                            </div>
                            <span className="text-xs text-neutral-500">{codeItem.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Table of active ICD Codes */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'}`}>
                          <th className="pb-2.5 font-bold">Code</th>
                          <th className="pb-2.5 font-bold">Type</th>
                          <th className="pb-2.5 font-bold">Description</th>
                          <th className="pb-2.5 font-bold">Category</th>
                          <th className="pb-2.5 font-bold text-right">Billable</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-neutral-800/60' : 'divide-neutral-200'}`}>
                        {consultation.icdCodes.map((code) => (
                          <tr key={code.code} className={isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'}>
                            <td className="py-3 font-mono font-bold">
                              <span className={`px-2.5 py-1 rounded-md text-xs sm:text-sm ${
                                code.isPrimary 
                                    ? isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold'
                                  : isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-800'
                              }`}>
                                {code.code}
                              </span>
                            </td>
                            <td className={isDark ? 'py-3 text-neutral-400 text-xs sm:text-sm' : 'py-3 text-neutral-600 text-xs sm:text-sm'}>
                              {code.isPrimary ? 'Primary Diagnosis' : 'Secondary Co-morbidity'}
                            </td>
                            <td className={`py-3 font-medium text-sm md:text-base ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>
                              {code.description}
                              {code.clinicalNotes && (
                                <p className={`text-xs font-normal mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{code.clinicalNotes}</p>
                              )}
                            </td>
                            <td className={`py-3 text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                              {code.category}
                            </td>
                            <td className="py-3 text-right font-mono">
                              <span className={isDark ? 'text-emerald-400 text-xs sm:text-sm font-semibold' : 'text-emerald-700 font-semibold text-xs sm:text-sm'}>✓ CMS Billable</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: EHR JSON Viewer */}
              {activeTab === 'ehr' && (
                <div className={`p-5 md:p-6 rounded-2xl border space-y-4 text-sm ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                    <div>
                      <h3 className="font-bold text-base md:text-lg">FHIR R4 / EHR Resource Representation</h3>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Interoperable JSON structure ready for Epic, Cerner, or clinical REST APIs.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(consultation.ehrJson, 'ehr-json')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                          isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {copiedKey === 'ehr-json' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedKey === 'ehr-json' ? 'Copied' : 'Copy JSON'}</span>
                      </button>

                      <button
                        onClick={onExportJSON}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        <FileCode className="w-4 h-4" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed max-h-96 ${
                    isDark ? 'bg-black text-neutral-300 border border-neutral-800' : 'bg-neutral-50 text-neutral-800 border border-neutral-200'
                  }`}>
                    <pre>{consultation.ehrJson}</pre>
                  </div>
                </div>
              )}

              {/* Tab 5: Raw Transcript */}
              {activeTab === 'transcript' && (
                <div className={`p-5 md:p-6 rounded-2xl border space-y-4 text-sm md:text-base ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                    <div>
                      <h3 className="font-bold text-base md:text-lg">Consultation Dialogue Transcript</h3>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Transcribed encounter conversation ({consultation.transcript.split(/\s+/).length} words).
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(consultation.transcript, 'transcript')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                        isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {copiedKey === 'transcript' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'transcript' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 leading-relaxed">
                    {consultation.transcript.split('\n').map((line, idx) => {
                      const isDoc = line.toLowerCase().startsWith('doctor:');
                      const isPt = line.toLowerCase().startsWith('patient:');
                      return (
                        <div key={idx} className="flex gap-2.5">
                          <span className={`font-bold shrink-0 text-sm md:text-base ${
                            isDoc 
                              ? isDark ? 'text-white' : 'text-black'
                              : isPt 
                                ? isDark ? 'text-neutral-400' : 'text-neutral-600'
                                : 'text-neutral-500'
                          }`}>
                            {isDoc ? 'Doctor:' : isPt ? 'Patient:' : ''}
                          </span>
                          <span className={`text-sm md:text-base ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
                            {line.replace(/^(doctor|patient):\s*/i, '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Toolbar underneath Assistant Card */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 text-xs sm:text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onExportPDF}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-colors ${
                      isDark ? 'hover:bg-neutral-800 border-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={onExportDOCX}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-colors ${
                      isDark ? 'hover:bg-neutral-800 border-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Word (.docx)</span>
                  </button>

                  <button
                    onClick={onExportJSON}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-colors ${
                      isDark ? 'hover:bg-neutral-800 border-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>EHR JSON</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onRegenerate}
                    title="Regenerate clinical documentation"
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
