import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import MeetingSession from '@/models/MeetingSession';
import mongoose from 'mongoose';

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
    const { text, timing = 'later', type = 'task' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    await dbConnect();

    const newTodo = {
      _id: new mongoose.Types.ObjectId(),
      text,
      timing,
      type,
      done: false,
      completed: false, // keep for compatibility
      createdAt: new Date()
    };

    const meetingSession = await MeetingSession.findOneAndUpdate(
      { _id: sessionId, userId: sessionAuth.user.id },
      { $push: { todos: newTodo } },
      { new: true }
    );

    if (!meetingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, todo: newTodo });
  } catch (error) {
    console.error('Session Todo PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
