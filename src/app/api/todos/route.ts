import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import MeetingSession from '@/models/MeetingSession';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/todos - Get all todos for user across all sessions
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetings = await MeetingSession.find(
      { userId: session.user.id },
      { todos: 1, _id: 1 }
    ).lean();

    const allTodos = meetings.flatMap(m => 
      (m.todos || []).map((t: any) => ({
        ...t,
        done: t.done ?? t.completed ?? false,
        completed: t.completed ?? t.done ?? false,
        sessionId: m._id.toString()
      }))
    );

    // Sort by createdAt desc
    allTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ todos: allTodos });
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/todos - Create a new manual todo without a session, or attach to most recent
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, type = 'task', timing = 'today', sessionId } = await req.json();

    let targetSessionId = sessionId;
    if (!targetSessionId) {
      // Find most recent session
      const latestSession = await MeetingSession.findOne({ userId: session.user.id })
        .sort({ startedAt: -1 })
        .select('_id');
        
      if (latestSession) {
        targetSessionId = latestSession._id;
      } else {
        // Create dummy session if none exists
        const newSession = await MeetingSession.create({ userId: session.user.id });
        targetSessionId = newSession._id;
      }
    }

    const newTodo = {
      _id: new mongoose.Types.ObjectId(),
      text,
      type: type === 'todo' ? 'task' : type, // handle legacy 'todo' type
      timing,
      done: false,
      completed: false,
      createdAt: new Date()
    };

    await MeetingSession.findByIdAndUpdate(targetSessionId, {
      $push: { todos: newTodo }
    });

    return NextResponse.json({ todo: { ...newTodo, sessionId: targetSessionId.toString() } });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/todos - Update a todo
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, todoId, updates } = await req.json();

    const meeting = await MeetingSession.findOne({ _id: sessionId, userId: session.user.id });
    if (!meeting) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const todo = meeting.todos.find((t: any) => t._id.toString() === todoId);
    if (!todo) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });

    if (updates.done !== undefined) {
      todo.done = updates.done;
      todo.completed = updates.done;
    } else if (updates.completed !== undefined) {
      todo.completed = updates.completed;
      todo.done = updates.completed;
    }
    
    if (updates.timing !== undefined) todo.timing = updates.timing;
    if (updates.text !== undefined) todo.text = updates.text;
    if (updates.type !== undefined) todo.type = updates.type;

    await meeting.save();

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error('Failed to update todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
