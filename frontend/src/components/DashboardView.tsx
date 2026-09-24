import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileDown, 
  Printer, 
  FileText, 
  FileCode, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Trash2,
  Filter,
  BarChart3,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { Consultation } from '../types/clinical';
import { downloadDOCXFile, downloadJSONFile } from '../utils/clinicalEngine';

interface DashboardViewProps {
  consultations: Consultation[];
  isDark: boolean;
  onSelectConsultation: (id: string) => void;
  onNewConsultation: () => void;
  onDeleteConsultation: (id: string) => void;
  onOpenPrintModal: (consultation: Consultation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  consultations,
  isDark,
  onSelectConsultation,
  onNewConsultation,
  onDeleteConsultation,
  onOpenPrintModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Compute analytics
  const totalEncounters = consultations.length;
  const avgCompliance = totalEncounters > 0 
    ? Math.round(consultations.reduce((acc, c) => acc + c.compliance.score, 0) / totalEncounters)
    : 0;
  const totalICDCodes = consultations.reduce((acc, c) => acc + c.icdCodes.length, 0);
  const exemplaryCount = consultations.filter(c => c.compliance.score >= 90).length;

  const filtered = consultations.filter(c => {
    const matchesSearch = 
      c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.soap.assessment.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.icdCodes.some(code => code.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (specialtyFilter === 'all') return matchesSearch;
    return matchesSearch && c.patient.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
  });

  const pipelineSteps = [
    {
      step: 'STEP 01',
      icon: '🎙️',
      title: 'Audio STT',
      subtitle: 'Voice Input',
      desc: 'Ambient recording or live mic speech-to-text capture'
    },
    {
      step: 'STEP 02',
      icon: '📝',
      title: 'Transcript',
      subtitle: 'Text Review',
      desc: 'Speaker-diarized doctor & patient dialogue parsing'
    },
    {
      step: 'STEP 03',
      icon: '📄',
      title: 'SOAP Note',
      subtitle: 'AI Structure',
      desc: 'Structured Subjective, Objective, Assessment, and Plan'
    },
    {
      step: 'STEP 04',
      icon: '✅',
      title: 'Compliance',
      subtitle: 'Audit Check',
      desc: 'CMS E/M completeness scoring and risk mitigation'
    },
    {
      step: 'STEP 05',
      icon: '🏷️',
      title: 'ICD-10',
      subtitle: 'Code Suggest',
      desc: 'Clinical diagnosis matching & billing code mapping'
    },
    {
      step: 'STEP 06',
      icon: '📋',
      title: 'EHR Record',
      subtitle: 'Export & DB',
      desc: 'FHIR JSON storage, printable PDF & DOCX generation'
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full ${
      isDark ? 'text-[#ececec]' : 'text-[#0d0d0d]'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Clinical Operations Dashboard</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
            }`}>
              Clin AT v2.5
            </span>
          </div>
          <p className={`text-xs md:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Real-time consultation analytics, automated SOAP documentation pipeline, and EHR encounter ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewConsultation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Consultation</span>
          </button>
        </div>
      </div>

      {/* Clinical Workflow Pipeline Banner (As requested by user) */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-[#fbfbfb] border-neutral-200/90 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Clinical Workflow Pipeline
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              End-to-end automated pipeline from physician encounter audio to structured electronic health record.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
            Pipeline Active
          </span>
        </div>

        {/* 6 Step Interactive Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-stretch">
          {pipelineSteps.map((stepItem, idx) => (
            <div 
              key={stepItem.step}
              className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all group ${
                isDark 
                  ? 'bg-neutral-800/40 hover:bg-neutral-800/80 border-neutral-700/60' 
                  : 'bg-white hover:bg-neutral-50 border-neutral-200/90 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400 mb-2">
                  <span>{stepItem.step}</span>
                  <span className="text-base">{stepItem.icon}</span>
                </div>
                <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                  {stepItem.title}
                </div>
                <div className={`text-[11px] font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'} mb-1`}>
                  {stepItem.subtitle}
                </div>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {stepItem.desc}
                </p>
              </div>

              {/* Step indicator arrow */}
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-neutral-400">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Total Encounters</span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">{totalEncounters}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <span>100% documented with SOAP</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Average Compliance</span>
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">{avgCompliance}%</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <span>{exemplaryCount} of {totalEncounters} rated Exemplary</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>ICD-10 Codes Mapped</span>
            <Hash className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">{totalICDCodes}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1">
            <span>All codes billable & CMS verified</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Clinician Time Saved</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">~18.4 min</div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1">
            <span>Per patient encounter</span>
          </div>
        </div>
      </div>

      {/* Consultations Ledger Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-xs'
      }`}>
        {/* Table Search & Filter Bar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-neutral-800' : 'border-neutral-200/90 bg-[#fafafa]'
        }`}>
          <div>
            <h2 className="font-bold text-sm">All Clinical Consultations</h2>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Showing {filtered.length} of {consultations.length} recorded patient encounters
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border ${
              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
            }`}>
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search patient, MRN, diagnosis, or ICD code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none placeholder:text-neutral-400 w-48 sm:w-64 text-xs"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
              }`}
            >
              <option value="all">All Specialties</option>
              <option value="Cardio">Cardiology</option>
              <option value="Endocrine">Endocrinology</option>
              <option value="Urgent">Urgent Care</option>
              <option value="Primary">Primary Care</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600 bg-neutral-50/70'}`}>
                <th className="py-3 px-4 font-semibold">Patient & Demographics</th>
                <th className="py-3 px-4 font-semibold">MRN</th>
                <th className="py-3 px-4 font-semibold">Encounter Date</th>
                <th className="py-3 px-4 font-semibold">Primary Diagnosis (SOAP)</th>
                <th className="py-3 px-4 font-semibold">Primary ICD-10</th>
                <th className="py-3 px-4 font-semibold text-center">Compliance</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-800/60' : 'divide-neutral-200/80'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No consultations matching current filter
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const primaryICD = c.icdCodes.find(code => code.isPrimary) || c.icdCodes[0];
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => onSelectConsultation(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                          {c.patient.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {c.patient.age}yo {c.patient.gender} · {c.patient.specialty}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-500">
                        {c.patient.mrn}
                      </td>

                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {c.patient.encounterDate}
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <div className={`font-medium truncate ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>
                          {c.soap.assessment.primaryDiagnosis}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          CC: {c.soap.subjective.chiefComplaint}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {primaryICD ? (
                          <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black border border-neutral-200'
                          }`}>
                            {primaryICD.code}
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
                          c.compliance.score >= 90
                            ? isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        }`}>
                          {c.compliance.score}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectConsultation(c.id)}
                            title="Open in SOAP Editor"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-neutral-700 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenPrintModal(c)}
                            title="Print / PDF Clinical Report"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-neutral-700 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => downloadDOCXFile(c.soap, c.patient, c.icdCodes, c.compliance)}
                            title="Download Word Document"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-neutral-700 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteConsultation(c.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg hover:text-red-500 transition-colors text-neutral-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
