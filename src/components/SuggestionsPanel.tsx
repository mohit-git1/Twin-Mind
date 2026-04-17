'use client';

import { useAppStore } from '@/store/useAppStore';
import { RotateCw, Loader2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useState, useCallback, useEffect, useRef } from 'react';

export function SuggestionsPanel() {
  const { transcript, suggestions, addSuggestionBatch, addChatMessage, isChatThinking, setIsChatThinking } = useAppStore();
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
        body: JSON.stringify({ transcript, full_prompt: item.full_prompt })
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      addChatMessage({ id: Date.now().toString() + '-ai', sender: 'ai', text: data.answer });
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
        body: JSON.stringify({ transcript }),
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
  }, [transcript, addSuggestionBatch]);

  useEffect(() => {
    if (transcript.length > 0) fetchSuggestions();
  }, [transcript.length, fetchSuggestions]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 border-b border-[#27272a] bg-[#1c1c1f]">
        <h2 className="text-xs font-semibold tracking-widest text-[#a1a1aa] uppercase">2. Live Suggestions</h2>
        <span className="text-xs text-[#71717a] uppercase tracking-widest">{suggestions.length} Batches</span>
      </div>

      <div className="flex items-center justify-between p-4 pb-2 flex-none">
        <button
          onClick={fetchSuggestions}
          disabled={isLoading || transcript.length === 0}
          className="flex items-center px-4 py-2 text-xs text-[#a1a1aa] border border-[#3f3f46] rounded-md hover:bg-[#27272a] transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RotateCw className="w-3 h-3 mr-2" />}
          Reload suggestions
        </button>
        <span className="text-[10px] text-[#71717a]">auto-refresh in 25s</span>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
        {isLoading && suggestions.length === 0 && (
           <div className="p-4 border border-[#3f3f46] rounded-lg bg-[#161618] animate-pulse">
             <div className="h-4 bg-[#27272a] rounded w-1/3 mb-2"></div>
             <div className="h-3 bg-[#27272a] rounded w-2/3"></div>
           </div>
        )}
        
        {suggestions.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[#71717a] italic text-sm text-center">Waiting for context...</p>
          </div>
        ) : (
          suggestions.map((batch, index) => (
            <div key={batch.id} className="space-y-3 animate-in fade-in duration-500">
              <div className="grid gap-3">
                {batch.items.map((item) => (
                  <SuggestionCard key={item.id} item={item} onClick={handleSuggestionClick} />
                ))}
              </div>
              {index !== suggestions.length - 1 && (
                <div className="flex items-center justify-center pt-2">
                   <div className="h-px bg-[#27272a] w-8"></div>
                   <span className="mx-4 text-[9px] text-[#71717a] uppercase tracking-widest">Older</span>
                   <div className="h-px bg-[#27272a] w-8"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
