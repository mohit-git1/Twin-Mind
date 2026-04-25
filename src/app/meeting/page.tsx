'use client';

import { TranscriptPanel } from '@/components/TranscriptPanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { ChatPanel } from '@/components/ChatPanel';

export default function MeetingPage() {

  return (
    <main className="flex flex-col flex-1 w-full overflow-hidden bg-slate-50 font-sans text-slate-900 relative min-h-0">


      {/* Full-width 3-column layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
        {/* Left Column - Transcript */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-slate-200 bg-white overflow-hidden shadow-sm">
          <TranscriptPanel />
        </section>

        {/* Middle Column - Suggestions */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-slate-200 bg-white overflow-hidden shadow-sm">
          <SuggestionsPanel />
        </section>

        {/* Right Column - Chat */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-white overflow-hidden shadow-sm">
          <ChatPanel />
        </section>
      </div>
    </main>
  );
}

