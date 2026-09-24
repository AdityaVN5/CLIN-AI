import React from 'react';
import { 
  Stethoscope, 
  Mic, 
  Upload, 
  FileText
} from 'lucide-react';
import { SAMPLE_CONSULTATIONS } from '../data/icdDatabase';
import { Consultation } from '../types/clinical';

interface LandingHeroProps {
  isDark: boolean;
  onSelectSample: (sample: Consultation) => void;
  onStartDictation: () => void;
  onOpenUpload: () => void;
  onQuickPrompt: (text: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  isDark,
  onSelectSample,
  onStartDictation,
  onOpenUpload,
  onQuickPrompt
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full py-12">
      {/* ChatGPT-style Icon Emblem */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform hover:scale-105 ${
        isDark ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-neutral-100 text-black border border-neutral-200'
      }`}>
        <Stethoscope className="w-7 h-7 stroke-[2.2]" />
      </div>

      {/* Main Headline */}
      <h1 className={`text-2xl md:text-3xl font-semibold tracking-tight text-center mb-2.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
        What clinical consultation would you like to document?
      </h1>
      
      <p className={`text-sm md:text-base text-center max-w-lg mb-8 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
        Clin AT listens, analyzes, and drafts complete SOAP documentation, compliance audits, ICD-10 diagnostic codes, and EHR records in real-time.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onStartDictation}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            isDark 
              ? 'bg-neutral-800/90 hover:bg-neutral-800 text-white border border-neutral-700/80 hover:border-neutral-600' 
              : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-2xs hover:border-neutral-300'
          }`}
        >
          <Mic className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} />
          <span>Dictate encounter</span>
        </button>

        <button
          onClick={onOpenUpload}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            isDark 
              ? 'bg-neutral-800/90 hover:bg-neutral-800 text-white border border-neutral-700/80 hover:border-neutral-600' 
              : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-2xs hover:border-neutral-300'
          }`}
        >
          <Upload className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} />
          <span>Upload audio recording</span>
        </button>

        <button
          onClick={() => onQuickPrompt(SAMPLE_CONSULTATIONS[0].transcript)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isDark 
              ? 'bg-neutral-800/90 hover:bg-neutral-800 text-white border border-neutral-700/80 hover:border-neutral-600' 
              : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-2xs hover:border-neutral-300'
          }`}
        >
          <FileText className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} />
          <span>Load sample encounter</span>
        </button>
      </div>
    </div>
  );
};
