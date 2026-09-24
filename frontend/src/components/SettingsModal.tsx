import React, { useState, useEffect } from 'react';
import { X, Settings, User, Building, Shield, Sparkles, Check, Database, Bot, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  doctorName: string;
  onUpdateDoctorName: (name: string) => void;
  specialty: string;
  onUpdateSpecialty: (spec: string) => void;
  institution: string;
  onUpdateInstitution: (inst: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  doctorName,
  onUpdateDoctorName,
  specialty,
  onUpdateSpecialty,
  institution,
  onUpdateInstitution
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');
  const [name, setName] = useState(doctorName);
  const [spec, setSpec] = useState(specialty);
  const [inst, setInst] = useState(institution);
  const [npi, setNpi] = useState('1982736450');
  const [saved, setSaved] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(r => r.json())
        .then(data => setSystemSettings(data))
        .catch(err => console.warn('Could not load system settings:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateDoctorName(name);
    onUpdateSpecialty(spec);
    onUpdateInstitution(inst);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl space-y-4 ${
        isDark ? 'bg-[#1e1e1e] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-400" />
            <h2 className="font-semibold text-sm">System & Clinician Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex gap-1 p-1 rounded-lg border text-xs ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
              activeTab === 'profile'
                ? isDark ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Physician Profile
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
              activeTab === 'system'
                ? isDark ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            AI Models & DB Diagnostics
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>Attending Physician Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2.5 rounded-lg border ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>Clinical Specialty</label>
              <input
                type="text"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                className={`w-full p-2.5 rounded-lg border ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>Health System / Practice</label>
              <input
                type="text"
                value={inst}
                onChange={(e) => setInst(e.target.value)}
                className={`w-full p-2.5 rounded-lg border ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>NPI Number (National Provider Identifier)</label>
              <input
                type="text"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-mono ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs max-h-[340px] overflow-y-auto pr-1">
            {systemSettings ? (
              <>
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      LLM Provider
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                      Connected ({systemSettings.provider})
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-neutral-400">
                    <div>Reasoning Model: <span className="font-mono text-white">{systemSettings.reasoning_model}</span></div>
                    <div>Speech Engine: <span className="font-mono text-white">{systemSettings.stt_model}</span></div>
                    <div>Fallback LLM: <span className="font-mono text-white">{systemSettings.fallback_model}</span></div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border space-y-2 ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      SQLite Database Storage
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400 font-semibold">
                      Healthy & Active
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-neutral-400">
                    <div>Path: <span className="font-mono text-white">{systemSettings.db_path}</span></div>
                    <div>Total Stored Encounters: <span className="font-bold text-white">{systemSettings.total_stored_consultations}</span></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Configured Multi-Agent Architecture
                  </span>
                  {systemSettings.agents?.map((ag: any, i: number) => (
                    <div key={i} className={`p-2 rounded-lg border text-[11px] flex justify-between items-center ${
                      isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div>
                        <div className="font-medium text-white">{ag.agent}</div>
                        <div className="text-[10px] text-neutral-400">{ag.role}</div>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">{ag.engine}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-neutral-400 animate-pulse">
                Loading live environment diagnostics...
              </div>
            )}
          </div>
        )}

        {/* Modal actions */}
        <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-xs ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            Close
          </button>
          {activeTab === 'profile' && (
            <button
              onClick={handleSave}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved' : 'Save Preferences'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
