'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useRef, useEffect } from 'react';

export function ChatPanel() {
  const { chatMessages, addChatMessage, isChatThinking, isReadOnly } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isReadOnly) return;
    
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
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">Chat</h2>
        <span className="text-xs text-[#71717a] font-medium">Session Only</span>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
             <p className="text-[#52525b] italic text-base text-center">
               {isReadOnly ? "No chat history in this session." : "Select a suggestion or type a message..."}
             </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-2">
               <span className="text-xs text-[#71717a] uppercase tracking-widest font-semibold">
                 {msg.sender === 'user' ? 'YOU' : 'ASSISTANT'}
               </span>
               <div className={`rounded-lg p-4 ${
                 msg.sender === 'user' 
                   ? 'bg-[#1e293b] border border-[#334155]' 
                   : 'bg-[#161618] border border-[#3f3f46]'
               }`}>
                  <p className="text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
                     {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text, null, 2)}
                  </p>
               </div>
            </div>
          ))
        )}

        {/* Thinking indicator */}
        {isChatThinking && (
          <div className="flex flex-col gap-2">
             <span className="text-xs text-[#71717a] uppercase tracking-widest font-semibold">ASSISTANT</span>
             <div className="bg-[#161618] border border-[#3f3f46] border-dashed rounded-lg p-4 flex items-center gap-3 w-max">
               <span className="flex gap-1">
                 <span className="animate-bounce inline-block w-2 h-2 bg-[#71717a] rounded-full" style={{ animationDelay: '0ms' }} />
                 <span className="animate-bounce inline-block w-2 h-2 bg-[#71717a] rounded-full" style={{ animationDelay: '150ms' }} />
                 <span className="animate-bounce inline-block w-2 h-2 bg-[#71717a] rounded-full" style={{ animationDelay: '300ms' }} />
               </span>
               <span className="text-sm text-[#a1a1aa] font-medium">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>

      {/* Input Box */}
      <div className="flex-none px-5 py-4 border-t border-[#27272a]">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isChatThinking || isReadOnly}
            placeholder={isReadOnly ? "Read only session" : "Ask anything..."}
            className="flex-1 bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#60a5fa] transition-colors placeholder-[#52525b] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isChatThinking || isReadOnly}
            className="bg-[#60a5fa] hover:bg-[#3b82f6] text-slate-900 px-6 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
