import { create } from 'zustand';

export interface SuggestionItem {
  id: string;
  type: 'question' | 'talking_point' | 'answer' | 'fact_check' | 'clarification';
  preview: string;
  full_prompt: string;
}

export interface SuggestionBatch {
  id: string;
  items: SuggestionItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export interface Notification {
  type: 'error' | 'success' | 'info';
  message: string;
}

interface AppState {
  transcript: string[];
  suggestions: SuggestionBatch[];
  chatMessages: ChatMessage[];
  isChatThinking: boolean;
  sessionId: string | null;
  isReadOnly: boolean;
  notification: Notification | null;

  // Recording & suggestion timer state
  isRecording: boolean;
  suggestionCountdown: number;
  isGeneratingSuggestions: boolean;
  suggestionTimerPaused: boolean;

  setSessionId: (id: string | null) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  clearNotification: () => void;
  setIsRecording: (isRecording: boolean) => void;
  setSuggestionCountdown: (count: number) => void;
  setIsGeneratingSuggestions: (val: boolean) => void;
  setSuggestionTimerPaused: (val: boolean) => void;
  loadSession: (session: any) => void;
  addTranscriptLine: (line: string) => void;
  addSuggestionBatch: (batch: SuggestionBatch) => void;
  addChatMessage: (message: ChatMessage) => void;
  setIsChatThinking: (isThinking: boolean) => void;
  resetState: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  transcript: [],
  suggestions: [],
  chatMessages: [],
  isChatThinking: false,
  sessionId: null,
  isReadOnly: false,
  notification: null,

  // Recording & suggestion timer defaults
  isRecording: false,
  suggestionCountdown: 30,
  isGeneratingSuggestions: false,
  suggestionTimerPaused: true, // paused until first recording stops

  setSessionId: (id) => set({ sessionId: id }),
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setSuggestionCountdown: (count) => set({ suggestionCountdown: count }),
  setIsGeneratingSuggestions: (val) => set({ isGeneratingSuggestions: val }),
  setSuggestionTimerPaused: (val) => set({ suggestionTimerPaused: val }),

  loadSession: (session) => {
    set({
      sessionId: session._id,
      isReadOnly: true,
      transcript: session.transcript.map((t: any) => t.text),
      chatMessages: session.chatHistory.map((c: any) => ({
        id: c.timestamp,
        sender: c.role === 'user' ? 'user' : 'ai',
        text: c.content
      })),
      suggestions: []
    });
  },

  addTranscriptLine: async (line) => {
    set((state) => ({ transcript: [...state.transcript, line] }));
    const { sessionId } = get();
    if (sessionId) {
      try {
        await fetch(`/api/sessions/${sessionId}/transcript`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speaker: 'Speaker 1', text: line }),
        });
      } catch (err) {
        console.error('Failed to sync transcript line:', err);
      }
    }
  },

  addSuggestionBatch: (batch) =>
    set((state) => ({ suggestions: [batch, ...state.suggestions] })),

  addChatMessage: async (message) => {
    set((state) => ({ chatMessages: [...state.chatMessages, message] }));
    const { sessionId } = get();
    if (sessionId) {
      try {
        await fetch(`/api/sessions/${sessionId}/chat`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            role: message.sender === 'ai' ? 'assistant' : 'user', 
            content: message.text 
          }),
        });
      } catch (err) {
        console.error('Failed to sync chat message:', err);
      }
    }
  },

  setIsChatThinking: (isThinking) =>
    set({ isChatThinking: isThinking }),

  resetState: () => set({
    transcript: [],
    suggestions: [],
    chatMessages: [],
    isChatThinking: false,
    sessionId: null,
    isReadOnly: false,
    isRecording: false,
    suggestionCountdown: 30,
    isGeneratingSuggestions: false,
    suggestionTimerPaused: true,
  }),
}));
