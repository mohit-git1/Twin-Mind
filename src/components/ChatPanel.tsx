'use client';

import { useAppStore } from '@/store/useAppStore';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ChatPanel() {
  const { chatMessages, addChatMessage, isChatThinking } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    addChatMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    });
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 border-b border-[#27272a] bg-[#1c1c1f]">
        <h2 className="text-xs font-semibold tracking-widest text-[#a1a1aa] uppercase">3. Chat (Detailed Answers)</h2>
        <span className="text-xs text-[#71717a] uppercase tracking-widest">Session-Only</span>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
             <p className="text-[#71717a] italic text-sm text-center">Select a suggestion or type a message...</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="flex flex-col space-y-2 animate-in fade-in duration-300">
               <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-medium">
                 {msg.sender === 'user' ? 'YOU' : 'ASSISTANT'}
               </span>
               <div className="bg-[#161618] border border-[#3f3f46] rounded-md p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                     {msg.text}
                  </p>
               </div>
            </div>
          ))
        )}

        {/* Loading / Thinking Logic */}
        {isChatThinking && (
          <div className="flex flex-col space-y-2 mt-4 ml-2 mb-4">
             <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-medium">ASSISTANT</span>
             <div className="bg-[#161618] border border-[#3f3f46] border-dashed rounded-md p-4 flex items-center space-x-3 w-max">
               <span className="flex space-x-1 border border-[#3f3f46] rounded-full px-2 py-1 bg-[#1c1c1f]">
                 <span className="animate-bounce inline-block w-1.5 h-1.5 bg-[#71717a] rounded-full" style={{ animationDelay: '0ms' }} />
                 <span className="animate-bounce inline-block w-1.5 h-1.5 bg-[#71717a] rounded-full" style={{ animationDelay: '150ms' }} />
                 <span className="animate-bounce inline-block w-1.5 h-1.5 bg-[#71717a] rounded-full" style={{ animationDelay: '300ms' }} />
               </span>
               <span className="text-sm text-[#a1a1aa] font-medium tracking-wide">Synthesizing deep context...</span>
             </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>

      {/* Input Box Fixed at Bottom */}
      <div className="flex-none p-4 border-t border-[#27272a] bg-[#1c1c1f]">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isChatThinking}
            placeholder="Ask anything..."
            className="flex-1 bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[#71717a] transition-colors placeholder-[#71717a] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isChatThinking}
            className="bg-[#60a5fa] hover:bg-[#3b82f6] text-slate-900 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
