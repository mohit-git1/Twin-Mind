'use client';

import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RotateCw, Loader2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useState, useCallback, useEffect, useRef } from 'react';

export function SuggestionsPanel() {
  const { transcript, suggestions, addSuggestionBatch, addChatMessage, isChatThinking, setIsChatThinking } = useAppStore();
  const settings = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (transcript.length === 0 || loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
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
        addSuggestionBatch({
          id: Date.now().toString(),
          items: mappedItems,
        });
      }
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [transcript, addSuggestionBatch, settings.suggestionsPrompt, settings.suggestionsContextLines, settings.suggestionCount, settings.model, settings.temperature, settings.maxTokens]);

  useEffect(() => {
    if (transcript.length > 0) fetchSuggestions();
  }, [transcript.length, fetchSuggestions]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">Live Suggestions</h2>
        <span className="text-xs text-[#71717a] font-medium">{suggestions.length} batches</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 flex-none">
        <button
          onClick={fetchSuggestions}
          disabled={isLoading || transcript.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#a1a1aa] border border-[#3f3f46] rounded-lg hover:bg-[#27272a] transition-colors disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 custom-scrollbar" ref={scrollRef}>
        {isLoading && suggestions.length === 0 && (
           <div className="p-5 border border-[#3f3f46] rounded-lg bg-[#161618] animate-pulse">
             <div className="h-4 bg-[#27272a] rounded w-1/3 mb-3"></div>
             <div className="h-3 bg-[#27272a] rounded w-2/3"></div>
           </div>
        )}
        
        {suggestions.length === 0 && !isLoading ? (
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
