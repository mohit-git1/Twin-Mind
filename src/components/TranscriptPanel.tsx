'use client';

import { useAppStore } from '@/store/useAppStore';
import { Loader2, Mic } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export function TranscriptPanel() {
  const { transcript, isReadOnly } = useAppStore();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isTranscribing]);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold tracking-tight text-[#0f2e4a]">Transcript</h2>
        <div className="flex items-center gap-3">
          {isReadOnly ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-bold uppercase tracking-wider">
              Read Only
            </span>
          ) : (
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
              {isRecording ? '● Recording' : 'Idle'}
            </span>
          )}
        </div>
      </div>

      {/* Mic Control */}
      {!isReadOnly && (
        <div className="flex-none px-5 py-3 flex items-center gap-4 bg-slate-50/50">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
            className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300 shadow-sm ${
              isRecording
                ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                : 'border-slate-200 bg-white text-sky-600 hover:border-sky-300 hover:bg-slate-50'
            }`}
          >
            {isRecording ? (
              <span className="w-3.5 h-3.5 bg-red-500 rounded-sm animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <span className="text-xs font-medium text-slate-500">
            {isRecording ? "Listening... speak to transcribe." : "Click to start recording."}
          </span>
        </div>
      )}

      {/* Transcript Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
        {transcript.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-400 italic text-sm text-center">
              Transcript will appear here...
            </p>
          </div>
        ) : (
          transcript.map((line, index) => (
            <div key={index} className="text-slate-700 leading-relaxed text-[15px] group">
              <span className="text-slate-300 mr-3 font-mono text-[10px] select-none group-hover:text-slate-400 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>
              {line}
            </div>
          ))
        )}
        
        {isTranscribing && (
          <div className="flex items-center gap-2 text-sky-600 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold italic tracking-wide">Processing...</span>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>
    </div>
  );
}
