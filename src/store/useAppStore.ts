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

interface AppState {
  transcript: string[];
  suggestions: SuggestionBatch[];
  chatMessages: ChatMessage[];
  isChatThinking: boolean;
  addTranscriptLine: (line: string) => void;
  addSuggestionBatch: (batch: SuggestionBatch) => void;
  addChatMessage: (message: ChatMessage) => void;
  setIsChatThinking: (isThinking: boolean) => void;
  resetState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  transcript: [],
  suggestions: [],
  chatMessages: [],
  isChatThinking: false,

  addTranscriptLine: (line) =>
    set((state) => ({ transcript: [...state.transcript, line] })),

  addSuggestionBatch: (batch) =>
    set((state) => ({ suggestions: [batch, ...state.suggestions] })), // Prepend new batches

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setIsChatThinking: (isThinking) =>
    set({ isChatThinking: isThinking }),

  resetState: () => set({ transcript: [], suggestions: [], chatMessages: [], isChatThinking: false }),
}));
