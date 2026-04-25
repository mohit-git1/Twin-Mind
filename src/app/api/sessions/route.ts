import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import MeetingSession from '@/models/MeetingSession';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const meetingSession = await MeetingSession.create({
      userId: session.user.id,
      startedAt: new Date(),
      transcript: [],
      chatHistory: [],
    });

    return NextResponse.json({ sessionId: meetingSession._id.toString() }, { status: 201 });
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const sessions = await MeetingSession.find({ userId: session.user.id })
      .sort({ startedAt: -1 })
      .select('startedAt transcript')
      .lean();

    const formattedSessions = sessions.map(s => {
      // Get a short preview from the first few transcript lines
      const preview = s.transcript && s.transcript.length > 0 
        ? s.transcript.slice(0, 2).map(t => t.text).join(' ').substring(0, 60) + '...'
        : 'Empty session';

      return {
        sessionId: s._id.toString(),
        startedAt: s.startedAt,
        preview,
      };
    });

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Sessions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
