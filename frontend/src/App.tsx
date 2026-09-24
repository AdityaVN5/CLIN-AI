import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatGPTHeader } from './components/ChatGPTHeader';
import { LandingHero } from './components/LandingHero';
import { ChatInputBar } from './components/ChatInputBar';
import { ConversationView } from './components/ConversationView';
import { DashboardView } from './components/DashboardView';
import { AudioUploadModal } from './components/AudioUploadModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { EditPatientModal } from './components/EditPatientModal';
import { Consultation, SOAPNote, ICDCode, ChatMessage, PatientInfo } from './types/clinical';
import { SAMPLE_CONSULTATIONS } from './data/icdDatabase';
import { 
  analyzeCompliance, 
  extractSOAPFromTranscript, 
  matchICDCodes, 
  buildEHRDocument,
  downloadDOCXFile,
  downloadJSONFile
} from './utils/clinicalEngine';

export default function App() {
  const [consultations, setConsultations] = useState<Consultation[]>(SAMPLE_CONSULTATIONS);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(SAMPLE_CONSULTATIONS[0].id);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Clin AT 1a');

  // New consultation demographic inputs (Patient ID, Name, Age, Gender)
  const [newPatientId, setNewPatientId] = useState('PT-10025');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Not specified');

  // Physician profile state
  const [doctorName, setDoctorName] = useState('Dr. Aditya M., MD');
  const [specialty, setSpecialty] = useState('Cardiology & Internal Medicine');
  const [institution, setInstitution] = useState('ClinAT Health Network');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);

  // Live dictation state
  const [isDictating, setIsDictating] = useState(false);
  const [dictationSeconds, setDictationSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Sync dark class on root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load consultations from SQLite backend on initial mount
  useEffect(() => {
    async function loadBackendConsultations() {
      try {
        const res = await fetch('/api/consultations');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setConsultations(data);
            setCurrentConsultationId(data[0].id);
          }
        }
      } catch (err) {
        console.warn('Backend SQLite sync notice, using local demo consultations:', err);
      }
    }
    loadBackendConsultations();
  }, []);

  // Download helper for PDF, Word, and JSON exports directly from backend
  const downloadFileFromBackend = async (url: string, defaultName: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
        return;
      }
    } catch (e) {
      console.warn('Backend download notice:', e);
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewConsultation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentConsultation = consultations.find(c => c.id === currentConsultationId) || null;

  // Start Live Voice Dictation using Web Speech API
  const handleStartDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed}\n${currentTranscript.trim()}` : currentTranscript.trim();
          });
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    } else {
      // Simulate live microphone dictation for demo/browser without WebSpeech
      setInput(prev => prev ? `${prev}\nDoctor: Can you describe when the chest discomfort began?\nPatient: It started two days ago while climbing stairs.` : `Doctor: Can you describe when the chest discomfort began?\nPatient: It started two days ago while climbing stairs.`);
    }

    setIsDictating(true);
    setDictationSeconds(0);
    timerRef.current = setInterval(() => {
      setDictationSeconds(s => s + 1);
    }, 1000);
  };

  const handleStopDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsDictating(false);
  };

  // Switch / Select a consultation
  const handleSelectConsultation = (id: string) => {
    setCurrentConsultationId(id);
    setActiveView('chat');
  };

  // Start a fresh consultation (landing hero)
  const handleNewConsultation = async () => {
    setCurrentConsultationId(null);
    setInput('');
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientGender('Not specified');
    setActiveView('chat');
    try {
      const res = await fetch('/api/patients/next-id');
      if (res.ok) {
        const data = await res.json();
        if (data.patient_id) setNewPatientId(data.patient_id);
      }
    } catch (e) {
      setNewPatientId(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  };

  // Delete a consultation
  const handleDeleteConsultation = async (id: string) => {
    try {
      await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete notice:', err);
    }
    setConsultations(prev => prev.filter(c => c.id !== id));
    if (currentConsultationId === id) {
      const remaining = consultations.filter(c => c.id !== id);
      setCurrentConsultationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Process a consultation transcript (either from user send, audio upload, or sample)
  const processTranscript = async (
    transcriptText: string,
    audioFile?: { name: string; duration: number },
    customPatientOverride?: PatientInfo
  ) => {
    setIsLoading(true);

    const newId = `consult-${Date.now()}`;
    const patientName = newPatientName.trim()
      ? newPatientName.trim()
      : transcriptText.includes('Robert') ? 'Robert Henderson'
      : transcriptText.includes('Elena') ? 'Elena Rostova'
      : transcriptText.includes('Marcus') ? 'Marcus Vance'
      : 'Patient Encounter';

    const pid = newPatientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const ageVal = parseInt(newPatientAge, 10) || 52;
    const genderVal = (['Male', 'Female', 'Other'].includes(newPatientGender) ? newPatientGender : 'Other') as any;

    const defaultPatient: PatientInfo = customPatientOverride || {
      id: pid,
      name: patientName,
      age: ageVal,
      gender: genderVal,
      dob: `${2026 - ageVal}-05-18`,
      mrn: `MRN-${pid.replace('PT-', '') || Math.floor(100000 + Math.random() * 900000)}`,
      encounterDate: new Date().toISOString().split('T')[0],
      provider: doctorName,
      specialty: specialty
    };

    try {
      // Call backend API (Runs SOAP Agent, Compliance Agent, ICD Agent, EHR Agent, and saves to SQLite)
      const res = await fetch('/api/consultation/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, patient: defaultPatient })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.soap) {
          const backendConsultation: Consultation = {
            ...json.data,
            audioFileName: audioFile?.name,
            audioDurationSeconds: audioFile?.duration,
          };
          if (audioFile && backendConsultation.messages && backendConsultation.messages[0]) {
            backendConsultation.messages[0].audioAttachment = {
              name: audioFile.name,
              duration: `${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toString().padStart(2, '0')}`
            };
          }
          setConsultations(prev => [backendConsultation, ...prev.filter(c => c.id !== backendConsultation.id)]);
          setCurrentConsultationId(backendConsultation.id);
          setInput('');
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend process notice, using fallback engine:', err);
    }

    // Fallback offline clinical engine if server offline
    const generatedSoap = extractSOAPFromTranscript(transcriptText);
    const generatedCompliance = analyzeCompliance(generatedSoap, transcriptText);
    const generatedICD = matchICDCodes(transcriptText);

    const ehrDoc = buildEHRDocument(
      transcriptText,
      generatedSoap,
      generatedCompliance,
      generatedICD,
      defaultPatient
    );

    const ehrJsonString = JSON.stringify(ehrDoc, null, 2);

    const firstLineTitle = transcriptText.split('\n')[0]?.replace(/^patient:\s*/i, '').slice(0, 36) || 'Clinical Encounter';
    const cleanTitle = `${specialty.split(' ')[0]}: ${generatedSoap.assessment.primaryDiagnosis.split(' (')[0].slice(0, 32)}`;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: transcriptText,
      audioAttachment: audioFile ? {
        name: audioFile.name,
        duration: `${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toString().padStart(2, '0')}`
      } : undefined
    };

    const assistantMessage: ChatMessage = {
      id: `asst-${Date.now()}`,
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Clinical encounter documented. Verified documentation completeness (${generatedCompliance.score}%), generated structured SOAP note, and mapped ${generatedICD.length} ICD-10 diagnosis codes.`,
      consultationData: {
        soap: generatedSoap,
        compliance: generatedCompliance,
        icdCodes: generatedICD,
        ehrJson: ehrJsonString
      }
    };

    const newConsultation: Consultation = {
      id: newId,
      title: cleanTitle,
      timestamp: 'Just now',
      patient: defaultPatient,
      transcript: transcriptText,
      audioFileName: audioFile?.name,
      audioDurationSeconds: audioFile?.duration,
      soap: generatedSoap,
      compliance: generatedCompliance,
      icdCodes: generatedICD,
      ehrJson: ehrJsonString,
      messages: [userMessage, assistantMessage],
      status: 'completed'
    };

    setConsultations(prev => [newConsultation, ...prev]);
    setCurrentConsultationId(newId);
    setInput('');
    setIsLoading(false);
  };

  // Handle refinement in ongoing consultation
  const handleRefineConsultation = async (refinementPrompt: string) => {
    if (!currentConsultation) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: refinementPrompt
    };

    let replyText = `I have updated the clinical documentation according to: "${refinementPrompt}".`;
    let updatedSoap = { ...currentConsultation.soap };

    // Apply quick smart adjustments based on prompt
    const lower = refinementPrompt.toLowerCase();
    if (lower.includes('cardiology referral') || lower.includes('refer')) {
      updatedSoap.plan.treatmentAndMedications.push('Referral placed to Outpatient Cardiology for comprehensive ischemic workup');
      replyText = 'Added urgent cardiology referral to the treatment plan and updated follow-up timeline.';
    } else if (lower.includes('bp') || lower.includes('blood pressure')) {
      updatedSoap.plan.patientEducation.push('Target home blood pressure goal established at <130/80 mmHg with daily home log.');
      replyText = 'Updated blood pressure treatment targets and patient education plan.';
    } else if (lower.includes('secondary') || lower.includes('icd')) {
      const extraCode = matchICDCodes(refinementPrompt)[0];
      if (extraCode && !currentConsultation.icdCodes.some(c => c.code === extraCode.code)) {
        currentConsultation.icdCodes.push(extraCode);
        replyText = `Added secondary diagnostic code: ${extraCode.code} - ${extraCode.description}.`;
      }
    }

    try {
      const res = await fetch('/api/chat/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSoap: updatedSoap,
          prompt: refinementPrompt,
          history: currentConsultation.messages
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.reply) replyText = json.reply;
        if (json.updatedSoap) updatedSoap = json.updatedSoap;
      }
    } catch (e) {
      console.warn('Backend refine notice:', e);
    }

    const assistantMessage: ChatMessage = {
      id: `asst-${Date.now()}`,
      sender: 'assistant',
      timestamp: 'Just now',
      text: replyText,
      consultationData: {
        soap: updatedSoap,
        compliance: currentConsultation.compliance,
        icdCodes: currentConsultation.icdCodes,
        ehrJson: currentConsultation.ehrJson
      }
    };

    const updatedConsultation: Consultation = {
      ...currentConsultation,
      soap: updatedSoap,
      messages: [...currentConsultation.messages, userMessage, assistantMessage]
    };

    setConsultations(prev => prev.map(c => c.id === updatedConsultation.id ? updatedConsultation : c));
    setInput('');
    setIsLoading(false);
  };

  // Main Send Action
  const handleSend = () => {
    if (isDictating) {
      handleStopDictation();
    }
    const textToSend = input.trim();
    if (!textToSend) return;

    if (!currentConsultation) {
      const pid = newPatientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`;
      const name = newPatientName.trim() || 'Patient Encounter';
      const ageVal = parseInt(newPatientAge, 10) || 45;
      const genderVal = (['Male', 'Female', 'Other'].includes(newPatientGender) ? newPatientGender : 'Other') as any;

      const patientData: PatientInfo = {
        id: pid,
        name: name,
        age: ageVal,
        gender: genderVal,
        dob: `${2026 - ageVal}-01-01`,
        mrn: `MRN-${pid.replace('PT-', '') || Math.floor(100000 + Math.random() * 900000)}`,
        encounterDate: new Date().toISOString().split('T')[0],
        provider: doctorName,
        specialty: specialty
      };
      processTranscript(textToSend, undefined, patientData);
    } else {
      handleRefineConsultation(textToSend);
    }
  };

  // Update SOAP from inline edit
  const handleUpdateSoap = async (updatedSoap: SOAPNote) => {
    if (!currentConsultation) return;

    try {
      const res = await fetch(`/api/consultations/${currentConsultation.id}/soap`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soap: updatedSoap })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setConsultations(prev => prev.map(c => c.id === json.data.id ? json.data : c));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend update notice:', e);
    }

    const newCompliance = analyzeCompliance(updatedSoap, currentConsultation.transcript);
    const newEhr = buildEHRDocument(
      currentConsultation.transcript,
      updatedSoap,
      newCompliance,
      currentConsultation.icdCodes,
      currentConsultation.patient
    );

    const updated: Consultation = {
      ...currentConsultation,
      soap: updatedSoap,
      compliance: newCompliance,
      ehrJson: JSON.stringify(newEhr, null, 2)
    };

    setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Add ICD-10 Code
  const handleAddICDCode = (newCode: ICDCode) => {
    if (!currentConsultation) return;
    const updatedCodes = [...currentConsultation.icdCodes, newCode];
    const updated: Consultation = {
      ...currentConsultation,
      icdCodes: updatedCodes
    };
    setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Handle Renaming encounter title (patient name remains unchanged)
  const handleRenameConsultation = (id: string, newTitle: string) => {
    setConsultations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, title: newTitle.trim() || c.title };
      }
      return c;
    }));
  };

  // Handle Pin / Unpin encounter
  const handleTogglePin = (id: string) => {
    setConsultations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    }));
  };

  // Handle updating patient details from the top bar edit option
  const handleUpdatePatientInfo = (updatedPatient: PatientInfo) => {
    if (!currentConsultationId) return;
    setConsultations(prev => prev.map(c => {
      if (c.id === currentConsultationId) {
        const updatedEhr = buildEHRDocument(c.transcript, c.soap, c.compliance, c.icdCodes, updatedPatient);
        return {
          ...c,
          patient: updatedPatient,
          ehrJson: JSON.stringify(updatedEhr, null, 2)
        };
      }
      return c;
    }));
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDark ? 'bg-[#171717] text-[#ececec]' : 'bg-white text-[#0d0d0d]'}`}>
      {/* ChatGPT Collapsible Sidebar */}
      <Sidebar
        consultations={consultations}
        currentConsultationId={currentConsultationId}
        onSelectConsultation={handleSelectConsultation}
        onNewConsultation={handleNewConsultation}
        onDeleteConsultation={handleDeleteConsultation}
        onRenameConsultation={handleRenameConsultation}
        onTogglePin={handleTogglePin}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        doctorName={doctorName}
        specialty={specialty}
        activeView={activeView}
        onOpenDashboard={() => setActiveView('dashboard')}
      />

      {/* Main ChatGPT Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <ChatGPTHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDark={isDark}
          currentConsultation={currentConsultation}
          onNewConsultation={handleNewConsultation}
          onLoadSample={(sample) => {
            if (!consultations.some(c => c.id === sample.id)) {
              setConsultations(prev => [sample, ...prev]);
            }
            setCurrentConsultationId(sample.id);
            setActiveView('chat');
          }}
          onExportPDF={() => setIsExportModalOpen(true)}
          onExportDOCX={() => currentConsultation && downloadDOCXFile(currentConsultation.soap, currentConsultation.patient, currentConsultation.icdCodes, currentConsultation.compliance)}
          onExportJSON={() => currentConsultation && downloadJSONFile(currentConsultation.ehrJson, `EHR_${currentConsultation.patient.mrn}.json`)}
          onOpenEditPatient={() => setIsEditPatientModalOpen(true)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          activeView={activeView}
        />

        {/* Content Area: Dashboard OR Active Consultation View OR Landing Hero */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {activeView === 'dashboard' ? (
            <DashboardView
              consultations={consultations}
              isDark={isDark}
              onSelectConsultation={(id) => {
                handleSelectConsultation(id);
                setActiveView('chat');
              }}
              onNewConsultation={handleNewConsultation}
              onDeleteConsultation={handleDeleteConsultation}
              onOpenPrintModal={(c) => {
                setCurrentConsultationId(c.id);
                setIsExportModalOpen(true);
              }}
            />
          ) : currentConsultation ? (
            <ConversationView
              consultation={currentConsultation}
              messages={currentConsultation.messages}
              isDark={isDark}
              onUpdateSoap={handleUpdateSoap}
              onAddICDCode={handleAddICDCode}
              onExportPDF={() => setIsExportModalOpen(true)}
              onExportDOCX={() => {
                downloadFileFromBackend(
                  `/api/consultations/${currentConsultation.id}/export/docx`,
                  `consultation_${currentConsultation.patient.mrn || currentConsultation.id}.docx`
                ).catch(() => downloadDOCXFile(currentConsultation.soap, currentConsultation.patient, currentConsultation.icdCodes, currentConsultation.compliance));
              }}
              onExportJSON={() => {
                downloadFileFromBackend(
                  `/api/consultations/${currentConsultation.id}/export/json`,
                  `consultation_${currentConsultation.patient.mrn || currentConsultation.id}.json`
                ).catch(() => downloadJSONFile(currentConsultation.ehrJson, `EHR_${currentConsultation.patient.mrn}.json`));
              }}
              onRegenerate={() => processTranscript(currentConsultation.transcript)}
              doctorName={doctorName}
            />
          ) : (
            <LandingHero
              isDark={isDark}
              onSelectSample={(sample) => {
                if (!consultations.some(c => c.id === sample.id)) {
                  setConsultations(prev => [sample, ...prev]);
                }
                setCurrentConsultationId(sample.id);
                setActiveView('chat');
              }}
              onStartDictation={handleStartDictation}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onQuickPrompt={(text) => {
                setInput(text);
                if (!newPatientName) setNewPatientName('Robert Henderson');
                if (!newPatientAge) setNewPatientAge('52');
                if (newPatientGender === 'Not specified') setNewPatientGender('Male');
              }}
            />
          )}
        </main>

        {/* ChatGPT Style Floating Input Dock at Bottom (Chat view only, no suggestions) */}
        {activeView === 'chat' && (
          <ChatInputBar
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            isDark={isDark}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onStartDictation={handleStartDictation}
            onStopDictation={handleStopDictation}
            isDictating={isDictating}
            dictationSeconds={dictationSeconds}
            hasActiveConsultation={Boolean(currentConsultation)}
            newPatientId={newPatientId}
            onChangePatientId={setNewPatientId}
            newPatientName={newPatientName}
            onChangePatientName={setNewPatientName}
            newPatientAge={newPatientAge}
            onChangePatientAge={setNewPatientAge}
            newPatientGender={newPatientGender}
            onChangePatientGender={setNewPatientGender}
          />
        )}
      </div>

      {/* Upload Audio Modal */}
      <AudioUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isDark={isDark}
        onProcessAudio={(fileName, duration, transcript) => {
          processTranscript(transcript, { name: fileName, duration });
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDark={isDark}
        doctorName={doctorName}
        onUpdateDoctorName={setDoctorName}
        specialty={specialty}
        onUpdateSpecialty={setSpecialty}
        institution={institution}
        onUpdateInstitution={setInstitution}
      />

      {/* Export Clinical Report Printable Modal */}
      {currentConsultation && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          isDark={isDark}
          consultation={currentConsultation}
        />
      )}

      {/* Edit Patient Demographics Modal */}
      {currentConsultation && (
        <EditPatientModal
          isOpen={isEditPatientModalOpen}
          onClose={() => setIsEditPatientModalOpen(false)}
          isDark={isDark}
          patient={currentConsultation.patient}
          onSave={handleUpdatePatientInfo}
        />
      )}
    </div>
  );
}
