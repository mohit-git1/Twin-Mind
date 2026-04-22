import { create } from 'zustand';

export interface AppSettings {
  // Prompts
  suggestionsPrompt: string;
  chatPrompt: string;

  // Context windows
  suggestionsContextLines: number;
  chatContextLines: number;

  // Model settings
  model: string;
  temperature: number;
  maxTokens: number;

  // Suggestion count
  suggestionCount: number;

  // Auto-refresh interval (seconds)
  autoRefreshInterval: number;
}

interface SettingsState extends AppSettings {
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

export const DEFAULT_SUGGESTIONS_PROMPT = `You are a high-quality, real-time AI meeting assistant.
Your goal is to generate useful, in-the-moment suggestions based on the live conversation transcript.

Input (Recent Transcript):
{{CONTEXT}}

Output Requirements:
Return exactly {{SUGGESTION_COUNT}} suggestions.
Each suggestion must:
- Be immediately useful and actionable
- Be concise
- Match the conversation context flawlessly

Suggestion Types to Choose From (Mix and match based on context!):
- "question" to ask
- "talking_point" to bring up
- "answer" to an unresolved question
- "fact_check" verifying a claim
- "clarification" explaining a confusing topic

Rules:
1. Detect conversation intent (e.g. technical discussion, brainstorming, decision making, confusion, or doubt).
2. Based on context:
   - If an unanswered question exists -> include an "answer"
   - If there is confusion -> include a "clarification"
   - If it's an open discussion -> include a "talking_point"
   - Occasionally include a "fact_check" on concrete claims.
3. Diversity: STRICT DIVERSITY. You MUST provide at least 2 entirely different suggestion types. NEVER return 3 suggestions of the same type under any circumstances.
4. Preview: The preview string MUST contain actual useful info (1-2 lines). NEVER use generic garbage phrases like "Consider discussing...", "You could ask about...", or "Maybe talk about...". State the insight directly (e.g., instead of "Ask about performance", write "Has the team run stress tests for 10k users?").
5. Tone: Natural, helpful, not robotic.

Output Format:
You MUST return STRICT JSON ONLY under the exact schema below. Do not include markdown ticks around the json, only the raw json.
{
  "suggestions": [
    {
      "type": "question" | "talking_point" | "answer" | "fact_check" | "clarification",
      "preview": "<useful insight preview>",
      "full_prompt": "<detailed prompt indicating deeper follow-up>"
    }
  ]
}`;

export const DEFAULT_CHAT_PROMPT = `You are a high-quality AI meeting assistant actively participating in an ongoing conversation.
The user has clicked a specific suggestion prompt based on the live context.

System Goal: 
Provide a detailed, helpful answer that significantly expands upon the suggestion preview.

Live Context:
{{CONTEXT}}

User Trigger Prompt:
"{{FULL_PROMPT}}"

Rules:
- Be highly specific and insightful; avoid regurgitating generic corporate speak.
- Add real examples, figures, or strategies if context permits.
- Keep output highly structured (use clear bullet points if detailing a list or steps).
- Stay deeply relevant to the live conversation context snippet.
- DO NOT just repeat the transcript. Synthesize and predict helpful next steps.
- Your tone must be natural, confident, and highly helpful.

Return STRICT JSON ONLY conforming exactly to this shape (do not include markdown ticks formatting the response block):
{
  "answer": "<your detailed and structured output response>"
}`;

const defaultSettings: AppSettings = {
  suggestionsPrompt: DEFAULT_SUGGESTIONS_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  suggestionsContextLines: 12,
  chatContextLines: 15,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 1024,
  suggestionCount: 3,
  autoRefreshInterval: 25,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,

  updateSettings: (partial) => set((state) => ({ ...state, ...partial })),

  resetToDefaults: () => set({ ...defaultSettings }),
}));
