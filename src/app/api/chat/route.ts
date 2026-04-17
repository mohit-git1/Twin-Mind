import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { cleanText } from '@/lib/cleanText';

export async function POST(req: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'build_dummy',
    });

    const body = await req.json();
    const { transcript, full_prompt } = body;

    if (!full_prompt) {
      return NextResponse.json(
        { error: 'No full_prompt provided' },
        { status: 400 }
      );
    }

    const transcriptArray: string[] = transcript || [];
    
    // Process context cleanly 
    const recentLines = transcriptArray
      .slice(-15)
      .map(cleanText)
      .filter(Boolean);

    const conversationContext = recentLines.join('\n');

    const prompt = `You are a high-quality AI meeting assistant actively participating in an ongoing conversation.
The user has clicked a specific suggestion prompt based on the live context.

System Goal: 
Provide a detailed, helpful answer that significantly expands upon the suggestion preview.

Live Context:
${conversationContext}

User Trigger Prompt:
"${full_prompt}"

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Groq returned empty chat content');
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ answer: parsed.answer || 'I am sorry, I failed to process an answer.' });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate chat answer' },
      { status: 500 }
    );
  }
}
