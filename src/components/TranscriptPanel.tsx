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
      <div className="flex-none flex items-center justify-between p-4 border-b border-[#27272a]">
        <h2 className="text-xs font-semibold tracking-widest text-[#a1a1aa] uppercase">1. Mic & Transcript</h2>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-[#71717a] uppercase tracking-widest">
            {isRecording ? 'Recording' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex-none p-4 pb-0 flex items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-[#3f3f46] hover:bg-[#27272a] transition-colors"
        >
          {isRecording ? (
            <span className="w-3 h-3 bg-red-500 rounded-sm" />
          ) : (
            <span className="w-3 h-3 bg-[#60a5fa] rounded-full" />
          )}
        </button>
        <span className="ml-4 text-xs text-[#71717a]">
          {isRecording ? "Recording active. Speak to transcribe." : "Stopped. Click to resume."}
        </span>
      </div>

      {/* Transcript Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {transcript.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[#71717a] italic text-sm text-center">
              Transcript will appear here...
            </p>
          </div>
        ) : (
          transcript.map((line, index) => (
            <div key={index} className="text-slate-300 leading-relaxed text-sm">
              <span className="text-[#71717a] mr-2 font-mono text-[10px]">
                [{String(index + 1).padStart(3, '0')}]
              </span>
              {line}
            </div>
          ))
        )}
        
        {isTranscribing && (
          <div className="flex items-center space-x-2 text-[#71717a] mt-4 p-2">
            <Loader2 className="w-3 h-3 animate-spin text-[#a1a1aa]" />
            <span className="text-xs font-medium italic">Processing...</span>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>
    </div>
  );
}
