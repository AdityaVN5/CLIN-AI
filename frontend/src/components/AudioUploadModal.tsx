import React, { useState } from 'react';
import { X, Upload, FileAudio, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SAMPLE_CONSULTATIONS } from '../data/icdDatabase';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onProcessAudio: (fileName: string, durationSeconds: number, transcript: string) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onProcessAudio
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setSelectedPresetIndex(null);
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedPresetIndex(null);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Case 1: Pre-recorded demo preset
    if (selectedPresetIndex !== null) {
      const preset = SAMPLE_CONSULTATIONS[selectedPresetIndex];
      onProcessAudio(
        preset.audioFileName || 'encounter_recording.wav',
        preset.audioDurationSeconds || 120,
        preset.transcript
      );
      onClose();
      return;
    }

    // Case 2: Real audio file transcription via Groq Whisper API
    if (selectedFile) {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || errData.message || `Server returned ${res.status}`);
        }

        const data = await res.json();
        const transcriptText = data.transcript || '';

        if (!transcriptText.trim()) {
          throw new Error('Whisper transcribed empty audio. Please check your recording.');
        }

        onProcessAudio(selectedFile.name, 120, transcriptText);
        onClose();
      } catch (err: any) {
        console.error('Transcription error:', err);
        setErrorMessage(
          err.message || 'Audio transcription failed. Make sure Groq API is reachable.'
        );
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl space-y-4 ${
        isDark ? 'bg-[#1e1e1e] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-neutral-400" />
            <h2 className="font-semibold text-sm">Upload Clinical Audio Encounter</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isTranscribing}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag and drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragActive
              ? 'border-white bg-neutral-800/60'
              : isDark
                ? 'border-neutral-700 bg-neutral-900/40 hover:bg-neutral-900/80'
                : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <p className="text-xs font-medium mb-1">
            {selectedFile ? selectedFile.name : 'Drag & drop consultation audio file'}
          </p>
          <p className="text-[11px] text-neutral-500 mb-3">
            Supports MP3, WAV, M4A, WebM, OGG, FLAC (Whisper Large V3 Turbo)
          </p>

          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-100 text-black border border-neutral-300 shadow-2xs'
          }`}>
            <span>Select audio file</span>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
              onChange={handleFileChange}
              disabled={isTranscribing}
              className="hidden"
            />
          </label>
        </div>

        {/* Or select a pre-recorded simulated encounter */}
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Or select simulated clinical recording:
          </span>
          <div className="space-y-1.5">
            {SAMPLE_CONSULTATIONS.map((preset, idx) => (
              <div
                key={preset.id}
                onClick={() => {
                  if (isTranscribing) return;
                  setSelectedPresetIndex(idx);
                  setSelectedFile(null);
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                  selectedPresetIndex === idx
                    ? isDark ? 'bg-neutral-800 border-white text-white' : 'bg-neutral-100 border-black text-black'
                    : isDark ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedPresetIndex === idx ? 'border-white bg-white text-black' : 'border-neutral-500'
                  }`}>
                    {selectedPresetIndex === idx && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-medium">{preset.title}</div>
                    <div className="text-[10px] text-neutral-400">{preset.audioFileName} · {Math.floor((preset.audioDurationSeconds || 60) / 60)}m {(preset.audioDurationSeconds || 60) % 60}s</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal actions */}
        <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="text-[11px] text-neutral-400">
            {isTranscribing && (
              <span className="flex items-center gap-1.5 text-blue-400 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Transcribing with Groq Whisper...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isTranscribing}
              className={`px-3 py-1.5 rounded-lg text-xs ${
                isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!selectedFile && selectedPresetIndex === null) || isTranscribing}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (selectedFile || selectedPresetIndex !== null) && !isTranscribing
                  ? isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <span>Process & Transcribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
