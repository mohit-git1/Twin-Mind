'use client';

import { useSettingsStore, DEFAULT_SUGGESTIONS_PROMPT, DEFAULT_CHAT_PROMPT } from '@/store/useSettingsStore';
import { Settings, X, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SettingsModal({ children, triggerClassName }: { children?: React.ReactNode, triggerClassName?: string }) {
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

  // API Key State
  const [hasKey, setHasKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isKeyLoading, setIsKeyLoading] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState({ type: '', message: '' });

  const [confirmRemoveKey, setConfirmRemoveKey] = useState(false);

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
      
      // Fetch API Key status
      const checkKey = async () => {
        try {
          const res = await fetch('/api/user/apikey');
          if (res.ok) {
            const data = await res.json();
            setHasKey(data.hasKey);
          }
        } catch (e) {
          console.error('Failed to check API key status', e);
        }
      };
      checkKey();
    } else {
      // Clear feedback when closing
      setKeyFeedback({ type: '', message: '' });
      setApiKeyInput('');
      setConfirmRemoveKey(false);
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

  const handleSaveKey = async () => {
    if (!apiKeyInput.startsWith('gsk_')) {
      setKeyFeedback({ type: 'error', message: 'Key must start with gsk_' });
      return;
    }

    setIsKeyLoading(true);
    setKeyFeedback({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/apikey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey: apiKeyInput }),
      });

      if (res.ok) {
        setHasKey(true);
        setApiKeyInput('');
        setKeyFeedback({ type: 'success', message: 'API key saved securely' });
      } else {
        const data = await res.json();
        setKeyFeedback({ type: 'error', message: data.error || 'Failed to save key' });
      }
    } catch {
      setKeyFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setIsKeyLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    setIsKeyLoading(true);
    setKeyFeedback({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/apikey', {
        method: 'DELETE',
      });

      if (res.ok) {
        setHasKey(false);
        setConfirmRemoveKey(false);
        setKeyFeedback({ type: 'success', message: 'API key removed' });
      } else {
        setKeyFeedback({ type: 'error', message: 'Failed to remove key' });
      }
    } catch {
      setKeyFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setIsKeyLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={triggerClassName || "cursor-pointer inline-block"}>
        {children || (
          <button
            className="p-2 text-[#71717a] hover:text-slate-200 hover:bg-[#27272a] rounded-lg transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

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

              {/* API Key Section */}
              <section className="p-4 bg-[#1e1e24] border border-[#3f3f46] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-semibold text-slate-200 uppercase tracking-wide">
                    Groq API Key
                  </h3>
                  {keyFeedback.message && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        keyFeedback.type === 'error'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {keyFeedback.message}
                    </span>
                  )}
                </div>

                {hasKey ? (
                  <div className="flex items-center justify-between bg-[#161618] border border-emerald-500/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">API Key is set</span>
                    </div>
                    {confirmRemoveKey ? (
                      <div className="flex items-center gap-2 bg-[#27272a] rounded-lg px-2 py-1">
                        <span className="text-[11px] text-slate-200 font-medium px-1">Sure?</span>
                        <button
                          onClick={handleRemoveKey}
                          disabled={isKeyLoading}
                          className="px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        >
                          {isKeyLoading ? 'Removing...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmRemoveKey(false)}
                          disabled={isKeyLoading}
                          className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#3f3f46] rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveKey(true)}
                        className="px-3 py-1.5 text-[11px] font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors"
                      >
                        Remove Key
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="gsk_..."
                      className="flex-1 bg-[#161618] text-slate-200 border border-[#3f3f46] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#60a5fa] transition-colors"
                    />
                    <button
                      onClick={handleSaveKey}
                      disabled={isKeyLoading || !apiKeyInput}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-900 bg-[#60a5fa] hover:bg-[#3b82f6] rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isKeyLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Save Key
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-[#71717a] mt-2">
                  Your key is securely encrypted and never shown again. It is required to use the AI features.
                </p>
              </section>

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
