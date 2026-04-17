import { TranscriptPanel } from '@/components/TranscriptPanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { ChatPanel } from '@/components/ChatPanel';

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-[#0f1115] font-sans text-slate-300">
      {/* Top Header */}
      <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#1c1c1f]">
         <h1 className="text-sm font-semibold text-slate-200">TwinMind — Live Suggestions Web App (Reference Mockup)</h1>
         <div className="text-xs text-slate-500 hidden sm:block">3-column layout • Transcript • Live Suggestions • Chat</div>
      </header>

      {/* Columns Container */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-4 max-w-[1800px] w-full mx-auto">
        {/* Left Column - Transcript */}
        <section className="flex-1 flex flex-col min-w-0 rounded-xl border border-[#27272a] bg-[#1c1c1f] overflow-hidden">
          <TranscriptPanel />
        </section>

        {/* Middle Column - Suggestions */}
        <section className="flex-1 flex flex-col min-w-0 rounded-xl border border-[#27272a] bg-[#1c1c1f] overflow-hidden">
          <SuggestionsPanel />
        </section>

        {/* Right Column - Chat */}
        <section className="flex-1 flex flex-col min-w-0 rounded-xl border border-[#27272a] bg-[#1c1c1f] overflow-hidden">
          <ChatPanel />
        </section>
      </div>
    </main>
  );
}
