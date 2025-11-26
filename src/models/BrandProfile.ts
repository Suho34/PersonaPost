import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the Interface
export interface IBrandProfile extends Document {
  userId: string;
  websiteUrl: string;
  scrapeStatus: "idle" | "scraped" | "error";
  lastScraped: Date;
}

// 2. Define the Schema
const BrandProfileSchema = new Schema<IBrandProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // One profile per user
      index: true, // Makes searching by userId fast
    },
    websiteUrl: {
      type: String,
      required: true,
    },
    scrapeStatus: {
      type: String,
      enum: ["idle", "scraped", "error"],
      default: "idle",
    },
    lastScraped: {
      type: Date,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// 3. Export the Model
const BrandProfile: Model<IBrandProfile> =
  mongoose.models.BrandProfile ||
  mongoose.model<IBrandProfile>("BrandProfile", BrandProfileSchema);

export default BrandProfile;
