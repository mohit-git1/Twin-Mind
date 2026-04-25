import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import MeetingSession from '@/models/MeetingSession';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await req.json();
    const { role, content } = body;

    if (!role || !content || !['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role or content' }, { status: 400 });
    }

    await dbConnect();
    
    const updatedSession = await MeetingSession.findOneAndUpdate(
      { _id: sessionId, userId: sessionAuth.user.id },
      { $push: { chatHistory: { role, content, timestamp: new Date() } } },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat message appended' });
  } catch (error) {
    console.error('Chat PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
