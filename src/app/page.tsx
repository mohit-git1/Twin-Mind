'use client';

import { TranscriptPanel } from '@/components/TranscriptPanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-[#0f1115] font-sans text-slate-200">
      {/* Gear icon — top right corner */}
      <div className="absolute top-3 right-4 z-40">
        <SettingsModal />
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
