import mongoose, { Document, Schema } from 'mongoose';


export interface StreamData {
  _id: mongoose.Types.ObjectId;
  songId: string;
  userId: string;
  playedAt: Date;
}

const StreamSchema = new Schema({
  songId: { type: String, required: true },
  userId: { type: String, required: true },
  playedAt: { type: Date, default: Date.now }
});



type StreamDocument = StreamData & Document;

const Stream = mongoose.model<StreamDocument>('Stream', StreamSchema);

export default Stream;