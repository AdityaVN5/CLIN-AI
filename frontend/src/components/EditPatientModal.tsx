import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Hash, Stethoscope, Save } from 'lucide-react';
import { PatientInfo } from '../types/clinical';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  patient: PatientInfo;
  onSave: (updated: PatientInfo) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  isDark,
  patient,
  onSave
}) => {
  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(patient.gender);
  const [dob, setDob] = useState(patient.dob);
  const [mrn, setMrn] = useState(patient.mrn);
  const [provider, setProvider] = useState(patient.provider);
  const [specialty, setSpecialty] = useState(patient.specialty);
  const [encounterDate, setEncounterDate] = useState(patient.encounterDate);

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setAge(patient.age);
      setGender(patient.gender);
      setDob(patient.dob);
      setMrn(patient.mrn);
      setProvider(patient.provider);
      setSpecialty(patient.specialty);
      setEncounterDate(patient.encounterDate);
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...patient,
      name: name.trim(),
      age: Number(age) || patient.age,
      gender,
      dob: dob.trim(),
      mrn: mrn.trim() || patient.mrn,
      provider: provider.trim(),
      specialty: specialty.trim(),
      encounterDate: encounterDate.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#1e1e1e] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-800'}`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Edit Patient Demographics</h2>
              <p className="text-[11px] text-neutral-500">Update encounter patient identity and metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Patient Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Robert Henderson"
              className={`w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
                isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Age (years)
              </label>
              <input
                type="number"
                min="0"
                max="125"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className={`w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Date of Birth (DOB)
              </label>
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="YYYY-MM-DD"
                className={`w-full p-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Medical Record # (MRN)
              </label>
              <input
                type="text"
                required
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                placeholder="MRN-XXXXXX"
                className={`w-full p-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Attending Provider
              </label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Dr. Name, MD"
                className={`w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Clinical Specialty
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Cardiology"
                className={`w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:ring-neutral-400' : 'bg-neutral-50 border-neutral-300 text-black focus:ring-neutral-800'
                }`}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Patient Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
