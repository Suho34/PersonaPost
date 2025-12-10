
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import VoiceChunk from "@/models/VoiceChunk";
import GeneratedPost from "@/models/GeneratedPost";
import { generateEmbedding, generateSocialPost, analyzeVirality } from "@/lib/ai";

export const maxDuration = 60; // Allow AI time to think

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, platform } = await req.json();

    await connectDB();

    let contextText: string[] = [];

    // DEFAULT: Search Brand Knowledge Base (Website)
    const query = topic || "Brand mission and values";
    console.log("Generating embedding for query:", query);
    const queryVector = await generateEmbedding(query);
    console.log("Embedding generated. Vector length:", queryVector.length);

    console.log("Running vector search...");
    const contextDocs = await VoiceChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 5,
        },
      },
      { $match: { userId: session.user.id } },
      { $project: { _id: 0, content: 1 } },
    ]);
    console.log("Vector search complete. Docs found:", contextDocs.length);

    contextText = contextDocs.map((doc) => doc.content);

    if (contextText.length === 0) {
      console.warn("No context found for user:", session.user.id);
      return NextResponse.json(
        { error: "No brand context found. Please scrape your website first." },
        { status: 400 }
      );
    }

    // 2. GENERATION (The "G")
    console.log(`Generating ${platform || "linkedin"} posts with context length: ${contextText.length}`);
    const newPostsContent = await generateSocialPost(
      contextText,
      topic,
      platform
    );
    console.log("Posts generated. Count:", newPostsContent.length);

    // 3. ANALYZE & SAVE (The Viral Score)
    const analysisPromises = newPostsContent.map((content) =>
      analyzeVirality(content, platform || "linkedin")
    );
    const analysisResults = await Promise.all(analysisPromises);

    const postsToSave = newPostsContent.map((content, index) => {
      const analysis = analysisResults[index];

      return {
        userId: session.user.id,
        content: content,
        platform: platform || "linkedin",
        isUsed: false,
        viralScore: analysis.score,
        feedback: analysis.feedback,
      };
    });

    console.log("Saving posts to DB...");
    await GeneratedPost.insertMany(postsToSave);
    console.log("Saved successfully.");

    return NextResponse.json({ success: true, count: postsToSave.length });
  } catch (error: any) {
    console.error("GENERATE API ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
