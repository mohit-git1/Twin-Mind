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
    <div className="flex flex-col h-full w-full relative bg-white">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold tracking-tight text-[#0f2e4a]">Chat</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Session History</span>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar bg-slate-50/30">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
             <p className="text-slate-400 italic text-sm text-center">
               {isReadOnly ? "No chat history in this session." : "Select a suggestion or type a message..."}
             </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1.5">
               <span className={`text-[9px] font-bold tracking-widest uppercase ${
                 msg.sender === 'user' ? 'text-sky-600' : 'text-slate-400'
               }`}>
                 {msg.sender === 'user' ? 'You' : 'Assistant'}
               </span>
               <div className={`rounded-2xl p-4 shadow-sm ${
                 msg.sender === 'user' 
                   ? 'bg-sky-600 text-white border border-sky-500' 
                   : 'bg-white text-slate-800 border border-slate-200'
               }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                     {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text, null, 2)}
                  </p>
               </div>
            </div>
          ))
        )}

        {/* Thinking indicator */}
        {isChatThinking && (
          <div className="flex flex-col gap-1.5">
             <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">Assistant</span>
             <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-4 flex items-center gap-3 w-max shadow-sm">
               <span className="flex gap-1">
                 <span className="animate-bounce inline-block w-2 h-2 bg-sky-400 rounded-full" style={{ animationDelay: '0ms' }} />
                 <span className="animate-bounce inline-block w-2 h-2 bg-sky-400 rounded-full" style={{ animationDelay: '150ms' }} />
                 <span className="animate-bounce inline-block w-2 h-2 bg-sky-400 rounded-full" style={{ animationDelay: '300ms' }} />
               </span>
               <span className="text-xs text-slate-500 font-bold italic tracking-wide">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4 w-full" />
      </div>

      {/* Input Box */}
      <div className="flex-none px-5 py-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isChatThinking || isReadOnly}
            placeholder={isReadOnly ? "Read only session" : "Ask anything..."}
            className="flex-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isChatThinking || isReadOnly}
            className="bg-[#0f2e4a] hover:bg-[#1a3f61] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 shadow-md active:scale-95"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
