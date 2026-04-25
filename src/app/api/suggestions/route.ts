import { NextRequest, NextResponse } from 'next/server';
import { cleanText } from '@/lib/cleanText';
import { auth } from '@/auth';
import { getGroqClient } from '@/lib/getGroqClient';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let groq;
    try {
      groq = await getGroqClient(session.user.id);
    } catch (e: any) {
      if (e.message === 'NO_API_KEY') {
        return NextResponse.json(
          { error: 'Please add your Groq API key in Settings' },
          { status: 403 }
        );
      }
      throw e;
    }

    const body = await req.json();
    const transcript: string[] = body.transcript || [];
    const settings = body.settings || {};

    // Use settings from client or defaults
    const contextLines = settings.suggestionsContextLines || 12;
    const suggestionCount = settings.suggestionCount || 3;
    const model = settings.model || 'llama-3.3-70b-versatile';
    const temperature = settings.temperature ?? 0.7;
    const maxTokens = settings.maxTokens || 1024;

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    const recentLines = transcript
      .slice(-contextLines)
      .map(t => t.replace(/\b(um|uh|okay|like|you know)\b/gi, "").replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    if (recentLines.length === 0) {
       return NextResponse.json({ suggestions: [] });
    }

    const conversationContext = recentLines.join('\n');

    // Build prompt from settings or use default
    let prompt: string;
    if (settings.suggestionsPrompt) {
      prompt = settings.suggestionsPrompt
        .replace(/\{\{CONTEXT\}\}/g, conversationContext)
        .replace(/\{\{SUGGESTION_COUNT\}\}/g, String(suggestionCount));
    } else {
      prompt = `You are a high-quality, real-time AI meeting assistant.
Your goal is to generate useful, in-the-moment suggestions based on the live conversation transcript.

Input (Recent Transcript):
${conversationContext}

Output Requirements:
Return exactly ${suggestionCount} suggestions.
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
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      response_format: { type: 'json_object' },
      temperature,
      max_tokens: maxTokens,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Groq returned empty content');
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ suggestions: parsed.suggestions || [] });

  } catch (error: any) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
