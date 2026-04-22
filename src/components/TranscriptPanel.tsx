'use client';

import { useAppStore } from '@/store/useAppStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export function TranscriptPanel() {
  const { transcript } = useAppStore();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isTranscribing]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">Transcript</h2>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium tracking-wide ${isRecording ? 'text-red-400' : 'text-[#71717a]'}`}>
            {isRecording ? '● REC' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Mic Control */}
      <div className="flex-none px-5 py-3 flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 ${
            isRecording
              ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
              : 'border-[#3f3f46] hover:bg-[#27272a]'
          }`}
        >
          {isRecording ? (
            <span className="w-3.5 h-3.5 bg-red-500 rounded-sm" />
          ) : (
            <span className="w-3.5 h-3.5 bg-[#60a5fa] rounded-full" />
          )}
        </button>
        <span className="text-sm text-[#a1a1aa]">
          {isRecording ? "Listening... speak to transcribe." : "Click to start recording."}
        </span>
      </div>

      {/* Transcript Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
        {transcript.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[#52525b] italic text-base text-center">
              Transcript will appear here...
            </p>
          </div>
        ) : (
          transcript.map((line, index) => (
            <div key={index} className="text-slate-200 leading-relaxed text-base">
              <span className="text-[#52525b] mr-3 font-mono text-xs">
                {String(index + 1).padStart(2, '0')}
              </span>
              {line}
            </div>
          ))
        )}
        
        {isTranscribing && (
          <div className="flex items-center gap-2 text-[#a1a1aa] py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium italic">Processing...</span>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>
    </div>
  );
}
