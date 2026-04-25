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

export interface IMeetingSession extends Document {
  userId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  transcript: ITranscriptLine[];
  chatHistory: IChatMessage[];
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

const MeetingSessionSchema = new Schema<IMeetingSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  transcript: [TranscriptLineSchema],
  chatHistory: [ChatMessageSchema],
});

// Prevent model recompilation on hot reload
const MeetingSession: Model<IMeetingSession> =
  mongoose.models.MeetingSession || mongoose.model<IMeetingSession>('MeetingSession', MeetingSessionSchema);

export default MeetingSession;
