'use client';

import { TranscriptPanel } from '@/components/TranscriptPanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { PastSessions } from '@/components/PastSessions';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

import { useState } from 'react';

export default function Home() {
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-[#0f1115] font-sans text-slate-200">
      {/* Top right controls — Sessions + Settings + Sign Out */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-2">
        <PastSessions />
        <SettingsModal />
        {confirmSignOut ? (
          <div className="flex items-center gap-2 bg-[#27272a] rounded-lg px-2 py-1 border border-[#3f3f46]">
            <span className="text-[11px] text-slate-200 font-medium px-1">Sure?</span>
            <button
              onClick={() => signOut({ redirectTo: '/signin' })}
              className="px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-400/10 rounded transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmSignOut(false)}
              className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#3f3f46] rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmSignOut(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-[#71717a] hover:text-red-400 hover:bg-[#27272a] rounded-lg transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>

      {/* Full-width 3-column layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Column - Transcript */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-[#27272a] bg-[#1c1c1f] overflow-hidden">
          <TranscriptPanel />
        </section>

        {/* Middle Column - Suggestions */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-[#27272a] bg-[#1c1c1f] overflow-hidden">
          <SuggestionsPanel />
        </section>

        {/* Right Column - Chat */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#1c1c1f] overflow-hidden">
          <ChatPanel />
        </section>
      </div>
    </main>
  );
}

