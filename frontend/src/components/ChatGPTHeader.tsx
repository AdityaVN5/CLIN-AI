import React, { useState } from 'react';
import { 
  Menu, 
  ChevronDown, 
  Sparkles, 
  FileDown, 
  Share2, 
  Plus, 
  Stethoscope,
  CheckCircle2,
  FileCode,
  FileText,
  Printer,
  Pencil
} from 'lucide-react';
import { Consultation } from '../types/clinical';
import { SAMPLE_CONSULTATIONS } from '../data/icdDatabase';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDark: boolean;
  currentConsultation: Consultation | null;
  onNewConsultation: () => void;
  onLoadSample: (sample: Consultation) => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onExportJSON: () => void;
  onOpenEditPatient?: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  activeView?: 'chat' | 'dashboard';
}

export const ChatGPTHeader: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isDark,
  currentConsultation,
  onNewConsultation,
  onLoadSample,
  onExportPDF,
  onExportDOCX,
  onExportJSON,
  onOpenEditPatient,
  selectedModel,
  onSelectModel,
  activeView = 'chat'
}) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const models = [
    { 
      id: 'clin-at-1a', 
      name: 'Clin AT 1a', 
      version: 'Clin v1.0', 
      desc: 'Ambient consultation transcription, real-time SOAP structuring & ICD-10 coding',
      active: true 
    },
    { 
      id: 'clin-at-pro', 
      name: 'Clin AT Pro', 
      version: 'v2.0', 
      desc: 'Advanced multi-specialty differential diagnostic reasoning & cross-encounter telemetry',
      active: false 
    },
    { 
      id: 'compliance-strict', 
      name: 'Strict CMS & Interop Auditor', 
      version: 'v1.2', 
      desc: 'Rigorous billing compliance scoring, CMS 2021 MDM audits & FHIR R4 schema enforcement',
      active: false 
    },
    { 
      id: 'fast-scribe', 
      name: 'Ambient Emergency Scribe', 
      version: 'v1.0', 
      desc: 'Ultra low-latency acute care dictation & rapid trauma encounter documentation',
      active: false 
    }
  ];

  return (
    <header className={`
      relative z-30 flex items-center justify-between px-4 py-2.5 h-12 border-b
      ${isDark ? 'bg-[#171717]/95 border-neutral-800 text-[#ececec]' : 'bg-white/95 border-neutral-200 text-[#171717]'}
      backdrop-blur-md transition-colors
    `}>
      {/* Left zone: Sidebar toggle + Model Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowModelMenu(!showModelMenu);
              setShowSampleMenu(false);
              setShowExportMenu(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark 
                ? 'hover:bg-neutral-800 text-neutral-200' 
                : 'hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">{selectedModel}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}>
                Clin v1.0
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showModelMenu && (
            <div className={`absolute top-full left-0 mt-1.5 w-80 rounded-xl shadow-xl border p-1.5 z-50 ${
              isDark ? 'bg-[#212121] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
            }`}>
              <div className="px-2.5 py-2 flex items-center justify-between text-[11px] font-medium text-neutral-400 border-b border-neutral-700/50">
                <span>Model & Documentation Engine</span>
                <span className="font-mono text-[10px]">Clin v1.0</span>
              </div>
              <div className="p-1 space-y-1">
                {models.map(m => {
                  const isSelected = selectedModel === m.name;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!m.active}
                      onClick={() => {
                        if (m.active) {
                          onSelectModel(m.name);
                          setShowModelMenu(false);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                        m.active
                          ? isSelected
                            ? isDark 
                              ? 'bg-neutral-800 text-white font-medium shadow-xs' 
                              : 'bg-neutral-100 text-black font-semibold shadow-xs'
                            : isDark ? 'hover:bg-neutral-800/60 text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700'
                          : 'opacity-50 cursor-not-allowed bg-transparent text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs">{m.name}</span>
                            {m.version && (
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded opacity-75">
                                {m.version}
                              </span>
                            )}
                          </div>
                          {!m.active ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                              isDark ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-200/80 text-neutral-600 border border-neutral-300'
                            }`}>
                              Coming soon
                            </span>
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                              isDark ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-snug">
                          {m.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Zone: Active Patient Badge OR Dashboard title */}
      {activeView === 'dashboard' ? (
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Clinical Operations Dashboard</span>
          <span className="text-neutral-400">·</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
            isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
          }`}>
            Ledger & Analytics
          </span>
        </div>
      ) : currentConsultation ? (
        <div className="flex items-center gap-1.5 md:gap-2 text-xs">
          <span className={`hidden sm:inline font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Patient:</span>
          <span className={`font-bold truncate max-w-[110px] sm:max-w-none ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {currentConsultation.patient.name}
          </span>
          <span className="text-neutral-400">·</span>
          <span className={`font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {currentConsultation.patient.age}y
          </span>
          <span className="text-neutral-400">·</span>
          <span className={`font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {currentConsultation.patient.gender}
          </span>
          <span className={`hidden md:inline font-mono text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            ({currentConsultation.patient.mrn})
          </span>

          {/* Edit Patient Details Option */}
          <button
            onClick={onOpenEditPatient}
            title="Edit patient details"
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] border transition-colors shrink-0 ${
              isDark 
                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-white' 
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black shadow-2xs'
            }`}
          >
            <Pencil className="w-3 h-3 text-neutral-400" />
            <span>Edit</span>
          </button>

          <span className="text-neutral-400 hidden lg:inline">·</span>
          <span className={`hidden lg:inline text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
            currentConsultation.compliance.score >= 90
              ? isDark ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : 'bg-amber-50 text-amber-700 border border-amber-300'
          }`}>
            {currentConsultation.compliance.score}% Compliant
          </span>
        </div>
      ) : null}

      {/* Right Zone: Sample loader & Export */}
      <div className="flex items-center gap-1.5">
        {/* Sample Encounters */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSampleMenu(!showSampleMenu);
              setShowModelMenu(false);
              setShowExportMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              isDark 
                ? 'hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60' 
                : 'hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <span>Examples</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showSampleMenu && (
            <div className={`absolute top-full right-0 mt-1.5 w-64 rounded-xl shadow-xl border p-1 z-50 ${
              isDark ? 'bg-[#212121] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
            }`}>
              <div className="p-2 text-[11px] font-medium text-neutral-400 border-b border-neutral-700/50">
                Load Sample Encounter
              </div>
              <div className="p-1 space-y-0.5">
                {SAMPLE_CONSULTATIONS.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onLoadSample(sample);
                      setShowSampleMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                      isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <div className="font-medium truncate">{sample.title}</div>
                    <div className="text-[10px] text-neutral-400">{sample.patient.name} · {sample.patient.specialty}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Dropdown */}
        {currentConsultation && (
          <div className="relative">
            <button
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowModelMenu(false);
                setShowSampleMenu(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-white text-black hover:bg-neutral-200' 
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showExportMenu && (
              <div className={`absolute top-full right-0 mt-1.5 w-52 rounded-xl shadow-xl border p-1 z-50 ${
                isDark ? 'bg-[#212121] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
              }`}>
                <div className="p-2 text-[11px] font-medium text-neutral-400 border-b border-neutral-700/50">
                  Export Clinical Report
                </div>
                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onExportPDF();
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                      isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <div className="font-medium">Print / PDF Report</div>
                      <div className="text-[10px] text-neutral-400">Hospital letterhead summary</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportDOCX();
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                      isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <div className="font-medium">Word (.docx)</div>
                      <div className="text-[10px] text-neutral-400">Editable clinic document</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                      isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <div className="font-medium">EHR / FHIR (.json)</div>
                      <div className="text-[10px] text-neutral-400">Interoperable JSON record</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
