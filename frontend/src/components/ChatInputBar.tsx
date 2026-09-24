import React, { useRef, useEffect, useState } from 'react';
import { 
  ArrowUp, 
  Paperclip, 
  Mic, 
  Square, 
  Sparkles, 
  Upload, 
  Volume2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDark: boolean;
  onOpenUpload: () => void;
  onStartDictation: () => void;
  onStopDictation: () => void;
  isDictating: boolean;
  dictationSeconds: number;
  hasActiveConsultation: boolean;
  newPatientId?: string;
  onChangePatientId?: (val: string) => void;
  newPatientName?: string;
  onChangePatientName?: (val: string) => void;
  newPatientAge?: string;
  onChangePatientAge?: (val: string) => void;
  newPatientGender?: string;
  onChangePatientGender?: (val: string) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  isDark,
  onOpenUpload,
  onStartDictation,
  onStopDictation,
  isDictating,
  dictationSeconds,
  hasActiveConsultation,
  newPatientId,
  onChangePatientId,
  newPatientName,
  onChangePatientName,
  newPatientAge,
  onChangePatientAge,
  newPatientGender,
  onChangePatientGender
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || isDictating) && !isLoading) {
        onSend();
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 shrink-0">
      {/* Main ChatGPT Input Capsule */}
      <div className={`
        relative rounded-3xl border transition-all duration-150 p-2.5
        ${isDark 
          ? 'bg-[#212121] border-neutral-700/80 focus-within:border-neutral-500 shadow-md' 
          : 'bg-white border-neutral-300 focus-within:border-neutral-700 shadow-sm focus-within:shadow-md'}
      `}>
        {/* Dictation Banner if Active */}
        {isDictating && (
          <div className={`mb-2 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs animate-pulse ${
            isDark ? 'bg-red-950/60 border border-red-800/60 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-medium">Dictating encounter... ({formatSeconds(dictationSeconds)})</span>
            </div>
            <button
              onClick={onStopDictation}
              className="text-[11px] font-semibold underline hover:no-underline"
            >
              Done & Transcribe
            </button>
          </div>
        )}

        {/* Little Demographic Input Fields for New Consultation */}
        {!hasActiveConsultation && (
          <div className={`mb-2 pb-2.5 border-b flex flex-wrap items-center gap-2 sm:gap-3 text-xs ${
            isDark ? 'border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700'
          }`}>
            {/* Patient ID */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">ID</span>
              <input
                type="text"
                value={newPatientId || ''}
                onChange={(e) => onChangePatientId?.(e.target.value)}
                placeholder="PT-10025"
                className={`w-20 sm:w-24 px-2 py-1 rounded-lg border text-xs font-mono font-medium focus:outline-none transition-colors ${
                  isDark 
                    ? 'bg-neutral-800/90 border-neutral-700 text-neutral-200 focus:border-neutral-400' 
                    : 'bg-neutral-50 border-neutral-300 text-neutral-800 focus:border-neutral-600'
                }`}
              />
            </div>

            {/* Patient Name */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">Name</span>
              <input
                type="text"
                value={newPatientName || ''}
                onChange={(e) => onChangePatientName?.(e.target.value)}
                placeholder="e.g. John Doe"
                className={`w-full px-2.5 py-1 rounded-lg border text-xs focus:outline-none transition-colors ${
                  isDark 
                    ? 'bg-neutral-800/90 border-neutral-700 text-neutral-200 focus:border-neutral-400 placeholder:text-neutral-500' 
                    : 'bg-neutral-50 border-neutral-300 text-neutral-800 focus:border-neutral-600 placeholder:text-neutral-400'
                }`}
              />
            </div>

            {/* Patient Age */}
            <div className="flex items-center gap-1.5 w-20 shrink-0">
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">Age</span>
              <input
                type="number"
                min={0}
                max={120}
                value={newPatientAge || ''}
                onChange={(e) => onChangePatientAge?.(e.target.value)}
                placeholder="45"
                className={`w-full px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
                  isDark 
                    ? 'bg-neutral-800/90 border-neutral-700 text-neutral-200 focus:border-neutral-400 placeholder:text-neutral-500' 
                    : 'bg-neutral-50 border-neutral-300 text-neutral-800 focus:border-neutral-600 placeholder:text-neutral-400'
                }`}
              />
            </div>

            {/* Patient Gender */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">Gender</span>
              <select
                value={newPatientGender || 'Not specified'}
                onChange={(e) => onChangePatientGender?.(e.target.value)}
                className={`px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-neutral-800/90 border-neutral-700 text-neutral-200 focus:border-neutral-400' 
                    : 'bg-neutral-50 border-neutral-300 text-neutral-800 focus:border-neutral-600'
                }`}
              >
                <option value="Not specified">Not specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasActiveConsultation
              ? "Instruct Clin AT (e.g. 'Add follow-up in 2 weeks', 'Detail physical exam', 'Summarize for patient')..."
              : "Paste consultation dialogue, doctor-patient discussion, or click mic to dictate..."
          }
          rows={1}
          className={`
            w-full resize-none bg-transparent px-2 text-[15px] md:text-base focus:outline-none placeholder:text-neutral-500 leading-relaxed
            ${isDark ? 'text-[#ececec]' : 'text-[#0d0d0d]'}
            max-h-[180px]
          `}
        />

        {/* Input Dock Bottom Controls */}
        <div className="flex items-center justify-between pt-1 mt-1">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenUpload}
              title="Upload consultation audio or text"
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
              }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={isDictating ? onStopDictation : onStartDictation}
              title={isDictating ? "Stop dictation" : "Start live voice dictation"}
              className={`p-1.5 rounded-full transition-all ${
                isDictating 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
              }`}
            >
              {isDictating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Action: Send Button */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 hidden sm:inline">
              Return to send
            </span>
            <button
              type="button"
              onClick={onSend}
              disabled={(!input.trim() && !isDictating) || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                (input.trim() || isDictating) && !isLoading
                  ? isDark 
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-xs' 
                    : 'bg-black text-white hover:bg-neutral-800 shadow-xs'
                  : isDark 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ChatGPT Footnote */}
      <p className="text-[10px] text-neutral-500 text-center mt-2 px-2">
        Clin AT assists clinical documentation. Always review notes, compliance findings, and ICD-10 codes prior to EHR signing.
      </p>
    </div>
  );
};
