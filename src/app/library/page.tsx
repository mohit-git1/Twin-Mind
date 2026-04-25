'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FolderOpen } from 'lucide-react';

function LibraryContent() {
  const searchParams = useSearchParams();
  const chatQuery = searchParams.get('q');
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full bg-[#0f1115] text-slate-200 font-sans overflow-hidden">
      <header className="px-5 py-4 border-b border-[#27272a] flex items-center gap-2 flex-none bg-[#1c1c1f]">
        <FolderOpen className="w-5 h-5 text-amber-500" />
        <h1 className="text-base font-semibold tracking-wide">Library & Memories</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {chatQuery && (
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Searching memories for</p>
            <p className="text-slate-200">"{chatQuery}"</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-10"><div className="animate-spin text-amber-500"><FolderOpen className="w-6 h-6" /></div></div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-lg font-medium text-slate-300">No meetings yet</h2>
            <p className="text-slate-500 text-sm mt-1">Your past meetings and chats will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map(session => (
              <div key={session.sessionId} className="bg-[#1c1c1f] p-5 rounded-2xl border border-[#27272a] hover:border-[#3f3f46] transition-colors cursor-pointer flex flex-col gap-3 group">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{session.title || 'Untitled Meeting'}</h3>
                  <span className="text-[10px] text-slate-500 font-medium px-2 py-1 bg-[#27272a] rounded">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {session.preview || 'No content...'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading library...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
