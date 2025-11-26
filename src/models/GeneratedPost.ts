import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGeneratedPost extends Document {
  userId: string;
  content: string;
  platform: "twitter" | "linkedin"; // Future proofing
  isUsed: boolean; // Has the user copied/posted this?
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
  },
  { timestamps: true }
);

const GeneratedPost: Model<IGeneratedPost> =
  mongoose.models.GeneratedPost ||
  mongoose.model<IGeneratedPost>("GeneratedPost", GeneratedPostSchema);

export default GeneratedPost;
