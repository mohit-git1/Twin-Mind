import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITranscriptLine {
  speaker: string;
  text: string;
  timestamp: Date;
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ITodo {
  _id?: mongoose.Types.ObjectId;
  text: string;
  type: 'task' | 'goal';
  timing: 'today' | 'later';
  done: boolean;
  completed?: boolean;
  createdAt: Date;
}

export interface IMeetingSession extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  summary?: string;
  tags?: string[];
  startedAt: Date;
  endedAt?: Date;
  transcript: ITranscriptLine[];
  chatHistory: IChatMessage[];
  todos: ITodo[];
}

const TranscriptLineSchema = new Schema<ITranscriptLine>({
  speaker: { type: String, default: 'Speaker 1' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const TodoSchema = new Schema<ITodo>({
  text: { type: String, required: true },
  type: { type: String, enum: ['task', 'goal'], default: 'task' },
  timing: { type: String, enum: ['today', 'later'], default: 'later' },
  done: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const MeetingSessionSchema = new Schema<IMeetingSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: String,
  summary: String,
  tags: [String],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  transcript: [TranscriptLineSchema],
  chatHistory: [ChatMessageSchema],
  todos: [TodoSchema],
});

// Prevent model recompilation on hot reload
const MeetingSession: Model<IMeetingSession> =
  mongoose.models.MeetingSession || mongoose.model<IMeetingSession>('MeetingSession', MeetingSessionSchema);

export default MeetingSession;
