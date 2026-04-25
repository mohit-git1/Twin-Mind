import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import MeetingSession from '@/models/MeetingSession';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    await dbConnect();
    
    const meetingSession = await MeetingSession.findOne({
      _id: sessionId,
      userId: sessionAuth.user.id,
    }).lean();

    if (!meetingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: meetingSession });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
