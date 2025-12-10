import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import BrandProfile from "@/models/BrandProfile";
import VoiceChunk from "@/models/VoiceChunk";
import { scrapeAndChunk } from "@/lib/scraper";
import { generateEmbeddingsBatch } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // 1. Get URL
    const profile = await BrandProfile.findOne({ userId: session.user.id });
    if (!profile || !profile.websiteUrl) {
      return NextResponse.json({ error: "No website found." }, { status: 400 });
    }

    // 2. Scrape & Chunk (The "Eyes")
    console.log("Scraping...");
    const textChunks = await scrapeAndChunk(profile.websiteUrl);

    // CRITICAL FIX: Check if we actually got text back
    if (!textChunks || textChunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract text. Your site might be using extensive JavaScript or blocking bots." },
        { status: 400 }
      );
    }

    // 3. Generate Embeddings (The "Brain")
    console.log(`Generating embeddings for ${textChunks.length} chunks...`);
    const vectors = await generateEmbeddingsBatch(textChunks);

    // 4. Save to MongoDB (The "Memory")
    // First, delete old chunks for this user (so we don't have duplicates if they re-scrape)
    await VoiceChunk.deleteMany({ userId: session.user.id });

    // Prepare data for insertion
    const chunksToSave = vectors.map((item) => ({
      userId: session.user.id,
      content: item.content,
      embedding: item.vector,
      sourceUrl: profile.websiteUrl,
    }));

    // Insert all at once
    await VoiceChunk.insertMany(chunksToSave);

    // 5. Update Profile Status
    profile.scrapeStatus = "scraped";
    profile.lastScraped = new Date();
    await profile.save();

    return NextResponse.json({
      success: true,
      count: chunksToSave.length,
      message: "Brand voice processed and memorized!",
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
