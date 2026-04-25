'use client';

import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RotateCw, Loader2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useCallback, useEffect, useRef } from 'react';

export function SuggestionsPanel() {
  const {
    transcript,
    suggestions,
    addSuggestionBatch,
    addChatMessage,
    isChatThinking,
    setIsChatThinking,
    suggestionCountdown,
    setSuggestionCountdown,
    isGeneratingSuggestions,
    setIsGeneratingSuggestions,
    suggestionTimerPaused,
    isRecording,
  } = useAppStore();
  const settings = useSettingsStore();
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stable refs for intervals
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionRef = useRef<NodeJS.Timeout | null>(null);

  const handleSuggestionClick = async (item: any) => {
    if (isChatThinking || transcript.length === 0) return;
    setIsChatThinking(true);
    addChatMessage({ id: Date.now().toString(), sender: 'user', text: item.preview });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          full_prompt: item.full_prompt,
          settings: {
            chatPrompt: settings.chatPrompt,
            chatContextLines: settings.chatContextLines,
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
          },
        })
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const answerText = typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer, null, 2);
      addChatMessage({ id: Date.now().toString() + '-ai', sender: 'ai', text: answerText });
    } catch (err) {
      console.error('Chat AI failed', err);
    } finally {
      setIsChatThinking(false);
    }
  };

  const fetchSuggestions = useCallback(async () => {
    const currentTranscript = useAppStore.getState().transcript;
    if (currentTranscript.length === 0 || loadingRef.current) return;
    loadingRef.current = true;
    setIsGeneratingSuggestions(true);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: currentTranscript,
          settings: {
            suggestionsPrompt: settings.suggestionsPrompt,
            suggestionsContextLines: settings.suggestionsContextLines,
            suggestionCount: settings.suggestionCount,
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      if (data.suggestions && data.suggestions.length > 0) {
        const mappedItems = data.suggestions.map((item: any, idx: number) => ({
          ...item,
          id: Date.now().toString() + '-' + idx,
        }));
        useAppStore.getState().addSuggestionBatch({
          id: Date.now().toString(),
          items: mappedItems,
        });
      }
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      loadingRef.current = false;
      setIsGeneratingSuggestions(false);
      setSuggestionCountdown(30);
    }
  }, [settings.suggestionsPrompt, settings.suggestionsContextLines, settings.suggestionCount, settings.model, settings.temperature, settings.maxTokens, setIsGeneratingSuggestions, setSuggestionCountdown]);

  // Helper to clear all intervals
  const clearAllIntervals = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (suggestionRef.current) {
      clearInterval(suggestionRef.current);
      suggestionRef.current = null;
    }
  }, []);

  // Track previous recording state to detect stop transitions
  const prevRecordingRef = useRef(isRecording);

  // EFFECT 1: Fetch suggestions when new transcript lines arrive during recording
  // This is the core trigger that makes suggestions actually appear
  const lastFetchedLengthRef = useRef(0);
  useEffect(() => {
    // Only auto-fetch during recording when new lines come in
    // (after recording stops, the timer takes over)
    if (transcript.length > 0 && transcript.length !== lastFetchedLengthRef.current) {
      lastFetchedLengthRef.current = transcript.length;
      fetchSuggestions();
    }
  }, [transcript.length, fetchSuggestions]);

  // EFFECT 2: Timer loop — starts when recording stops, pauses when recording starts
  useEffect(() => {
    const wasRecording = prevRecordingRef.current;
    prevRecordingRef.current = isRecording;

    // If recording or paused, kill all intervals
    if (isRecording || suggestionTimerPaused) {
      clearAllIntervals();
      return;
    }

    // Recording just stopped (was recording → now not recording)
    // Fire an immediate fetch, then start the 30s loop
    if (wasRecording && !isRecording) {
      fetchSuggestions();
    }

    // Start the countdown + auto-refresh loop
    setSuggestionCountdown(30);

    // 1-second countdown tick
    countdownRef.current = setInterval(() => {
      const current = useAppStore.getState().suggestionCountdown;
      if (current > 0) {
        useAppStore.getState().setSuggestionCountdown(current - 1);
      }
    }, 1000);

    // Fire suggestions every 30 seconds
    suggestionRef.current = setInterval(() => {
      const state = useAppStore.getState();
      if (state.isRecording || state.suggestionTimerPaused) return;

      fetchSuggestions();
    }, 30000);

    // Cleanup on unmount or when deps change
    return () => {
      clearAllIntervals();
    };
  }, [isRecording, suggestionTimerPaused, clearAllIntervals, fetchSuggestions, setSuggestionCountdown]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">Live Suggestions</h2>
        <span className="text-xs text-[#71717a] font-medium">{suggestions.length} batches</span>
      </div>

      {/* Controls / Countdown */}
      <div className="flex items-center justify-between px-5 py-3 flex-none border-b border-[#27272a]/50">
        <button
          onClick={fetchSuggestions}
          disabled={isGeneratingSuggestions || transcript.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] border border-[#3f3f46] rounded-md hover:bg-[#27272a] transition-colors disabled:opacity-40"
        >
          {isGeneratingSuggestions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
        
        <div className="flex items-center text-[10px] font-bold tracking-tight uppercase">
          {isGeneratingSuggestions ? (
            <div className="flex items-center gap-1.5 text-indigo-400">
              <span className="animate-pulse">✦ Generating...</span>
            </div>
          ) : suggestionTimerPaused || isRecording ? (
            <div className="flex items-center gap-1.5 text-amber-500/80">
              <span>⏸ Paused</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#71717a]">
              <span>In {suggestionCountdown}s</span>
              <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 transform -rotate-90" viewBox="0 0 24 24">
                  <circle className="text-[#27272a]" strokeWidth="4" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                  <circle 
                    className="text-indigo-500 transition-all duration-1000 ease-linear" 
                    strokeWidth="4" 
                    strokeDasharray={62.83} 
                    strokeDashoffset={62.83 - ((30 - suggestionCountdown) / 30) * 62.83} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="10" 
                    cx="12" 
                    cy="12" 
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 custom-scrollbar" ref={scrollRef}>
        {isGeneratingSuggestions && suggestions.length === 0 && (
           <div className="p-5 border border-[#3f3f46] rounded-lg bg-[#161618] animate-pulse">
             <div className="h-4 bg-[#27272a] rounded w-1/3 mb-3"></div>
             <div className="h-3 bg-[#27272a] rounded w-2/3"></div>
           </div>
        )}
        
        {suggestions.length === 0 && !isGeneratingSuggestions ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[#52525b] italic text-base text-center">Waiting for context...</p>
          </div>
        ) : (
          suggestions.map((batch, index) => (
            <div key={batch.id} className="space-y-3">
              <div className="grid gap-3">
                {batch.items.map((item) => (
                  <SuggestionCard key={item.id} item={item} onClick={handleSuggestionClick} />
                ))}
              </div>
              {index !== suggestions.length - 1 && (
                <div className="flex items-center justify-center py-2">
                   <div className="h-px bg-[#27272a] w-10"></div>
                   <span className="mx-4 text-[10px] text-[#52525b] uppercase tracking-widest">Older</span>
                   <div className="h-px bg-[#27272a] w-10"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
