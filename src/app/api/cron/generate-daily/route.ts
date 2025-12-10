import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import GeneratedPost from "@/models/GeneratedPost";
import VoiceChunk from "@/models/VoiceChunk";
import { generateEmbedding, generateSocialPost } from "@/lib/ai";

// Allow this to run for up to 5 minutes (max for Vercel Hobby)
export const maxDuration = 300;

export async function GET(req: Request) {
  try {
    // 1. SECURITY CHECK
    // We check if the caller has the secret key.
    const headerList = await headers();
    const authHeader = headerList.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 2. FETCH ALL USERS
    // Since we didn't make a Mongoose model for User (BetterAuth did it),
    // we use the raw MongoDB connection to find them.
    const users = await mongoose.connection.db
      ?.collection("user")
      .find({})
      .toArray();

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found" });
    }

    const results = [];

    // 3. LOOP THROUGH EACH USER
    for (const user of users) {
      const userId = user._id.toString();

      console.log(`Processing user: ${userId}`);

      // A. Check if they have a website scraped
      // We look for ANY chunks belonging to this user
      const hasData = await VoiceChunk.exists({ userId: userId });

      if (!hasData) {
        results.push({ userId, status: "skipped_no_data" });
        continue;
      }

      // B. RAG: Get Context
      // We generate a generic "fresh content" embedding
      const queryVector = await generateEmbedding("Brand news and updates");

      const contextDocs = await VoiceChunk.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 50,
            limit: 3,
          },
        },
        { $match: { userId: userId } },
        { $project: { _id: 0, content: 1 } },
      ]);

      const contextText = contextDocs.map((doc) => doc.content);

      // C. GENERATION
      // We ask the AI to write a post for "today"
      const generatedContent = await generateSocialPost(
        contextText,
        "Daily automated brand update"
      );

      // D. SAVE
      if (generatedContent.length > 0) {
        const postsToSave = generatedContent.map((content) => ({
          userId: userId,
          content: content,
          platform: "linkedin",
          isUsed: false,
        }));

        await GeneratedPost.insertMany(postsToSave);
        results.push({ userId, status: "success", count: postsToSave.length });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
