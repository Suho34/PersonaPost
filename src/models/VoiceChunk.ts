import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoiceChunk extends Document {
  userId: string;
  content: string;
  embedding: number[]; // The vector!
  sourceUrl: string;
}

const VoiceChunkSchema = new Schema<IVoiceChunk>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // We will always search "chunks belonging to this user"
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // An array of numbers
      required: true,
    },
    sourceUrl: {
      type: String, // Good to know which page this text came from
    },
  },
  { timestamps: true }
);

const VoiceChunk: Model<IVoiceChunk> =
  mongoose.models.VoiceChunk ||
  mongoose.model<IVoiceChunk>("VoiceChunk", VoiceChunkSchema);

export default VoiceChunk;
