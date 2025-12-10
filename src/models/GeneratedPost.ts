import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGeneratedPost extends Document {
  userId: string;
  content: string;
  platform: "twitter" | "linkedin" | "instagram";
  isUsed: boolean; // Has the user copied/posted this?
  copyCount?: number; // New analytics field
  viralScore?: number; // AI score 0-100
  feedback?: string; // AI feedback
}

const GeneratedPostSchema = new Schema<IGeneratedPost>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "linkedin",
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    copyCount: {
      type: Number,
      default: 0,
    },
    viralScore: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

const GeneratedPost: Model<IGeneratedPost> =
  mongoose.models.GeneratedPost ||
  mongoose.model<IGeneratedPost>("GeneratedPost", GeneratedPostSchema);

export default GeneratedPost;
