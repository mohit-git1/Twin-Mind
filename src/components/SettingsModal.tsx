'use client';

import { useSettingsStore, DEFAULT_SUGGESTIONS_PROMPT, DEFAULT_CHAT_PROMPT } from '@/store/useSettingsStore';
import { Settings, X, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettingsStore();
  const { updateSettings, resetToDefaults } = settings;

  // Local state for form editing
  const [localSettings, setLocalSettings] = useState({
    suggestionsPrompt: settings.suggestionsPrompt,
    chatPrompt: settings.chatPrompt,
    suggestionsContextLines: settings.suggestionsContextLines,
    chatContextLines: settings.chatContextLines,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    suggestionCount: settings.suggestionCount,
    autoRefreshInterval: settings.autoRefreshInterval,
  });

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        suggestionsPrompt: settings.suggestionsPrompt,
        chatPrompt: settings.chatPrompt,
        suggestionsContextLines: settings.suggestionsContextLines,
        chatContextLines: settings.chatContextLines,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        suggestionCount: settings.suggestionCount,
        autoRefreshInterval: settings.autoRefreshInterval,
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalSettings({
      suggestionsPrompt: DEFAULT_SUGGESTIONS_PROMPT,
      chatPrompt: DEFAULT_CHAT_PROMPT,
      suggestionsContextLines: 12,
      chatContextLines: 15,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 1024,
      suggestionCount: 3,
      autoRefreshInterval: 25,
    });
  };

  const updateLocal = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Settings Trigger — Gear Icon Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-[#71717a] hover:text-slate-200 hover:bg-[#27272a] rounded-lg transition-all duration-200"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] mx-4 bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] flex-none">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#60a5fa]" />
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Configuration</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#fbbf24] border border-[#78350f]/50 rounded-md hover:bg-[#78350f]/20 transition-colors"
                  title="Reset all to defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-[#71717a] hover:text-slate-200 hover:bg-[#27272a] rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">

              {/* Model & Parameters Section */}
              <section>
                <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3">Model &amp; Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">Model</label>
                    <select
                      value={localSettings.model}
                      onChange={(e) => updateLocal('model', e.target.value)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="gemma2-9b-it">Gemma 2 9B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">
                      Temperature <span className="text-[#60a5fa]">{localSettings.temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={localSettings.temperature}
                      onChange={(e) => updateLocal('temperature', parseFloat(e.target.value))}
                      className="w-full accent-[#60a5fa] h-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">Max Tokens</label>
                    <input
                      type="number"
                      min="128"
                      max="4096"
                      step="128"
                      value={localSettings.maxTokens}
                      onChange={(e) => updateLocal('maxTokens', parseInt(e.target.value) || 1024)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">Suggestion Count</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={localSettings.suggestionCount}
                      onChange={(e) => updateLocal('suggestionCount', parseInt(e.target.value) || 3)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Context Windows Section */}
              <section>
                <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3">Context Windows</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">
                      Suggestions — Transcript Lines
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="50"
                      value={localSettings.suggestionsContextLines}
                      onChange={(e) => updateLocal('suggestionsContextLines', parseInt(e.target.value) || 12)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                    <span className="text-[10px] text-[#52525b] mt-1 block">Last N transcript lines sent for suggestions</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">
                      Chat — Transcript Lines
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="50"
                      value={localSettings.chatContextLines}
                      onChange={(e) => updateLocal('chatContextLines', parseInt(e.target.value) || 15)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                    <span className="text-[10px] text-[#52525b] mt-1 block">Last N transcript lines sent for chat answers</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#71717a] mb-1.5 font-medium">Auto-Refresh Interval (s)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={localSettings.autoRefreshInterval}
                      onChange={(e) => updateLocal('autoRefreshInterval', parseInt(e.target.value) || 25)}
                      className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Live Suggestions Prompt */}
              <section>
                <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3">
                  Live Suggestions Prompt
                </h3>
                <p className="text-[10px] text-[#52525b] mb-2">
                  Use <code className="text-[#60a5fa] bg-[#1e3a8a]/20 px-1 py-0.5 rounded">{'{{CONTEXT}}'}</code> for transcript context and <code className="text-[#60a5fa] bg-[#1e3a8a]/20 px-1 py-0.5 rounded">{'{{SUGGESTION_COUNT}}'}</code> for the count.
                </p>
                <textarea
                  value={localSettings.suggestionsPrompt}
                  onChange={(e) => updateLocal('suggestionsPrompt', e.target.value)}
                  rows={10}
                  className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#60a5fa] transition-colors resize-y custom-scrollbar"
                />
              </section>

              {/* Chat / Detailed Answers Prompt */}
              <section>
                <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3">
                  Chat / Detailed Answers Prompt
                </h3>
                <p className="text-[10px] text-[#52525b] mb-2">
                  Use <code className="text-[#60a5fa] bg-[#1e3a8a]/20 px-1 py-0.5 rounded">{'{{CONTEXT}}'}</code> for transcript context and <code className="text-[#60a5fa] bg-[#1e3a8a]/20 px-1 py-0.5 rounded">{'{{FULL_PROMPT}}'}</code> for the user&apos;s trigger prompt.
                </p>
                <textarea
                  value={localSettings.chatPrompt}
                  onChange={(e) => updateLocal('chatPrompt', e.target.value)}
                  rows={10}
                  className="w-full bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-md px-3 py-2.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#60a5fa] transition-colors resize-y custom-scrollbar"
                />
              </section>
            </div>

            {/* Footer */}
            <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 border-t border-[#27272a]">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs text-[#a1a1aa] border border-[#3f3f46] rounded-md hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold text-slate-900 bg-[#60a5fa] hover:bg-[#3b82f6] rounded-md transition-colors shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
