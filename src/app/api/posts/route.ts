import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import GeneratedPost from "@/models/GeneratedPost";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Get latest 10 posts, newest first
  const posts = await GeneratedPost.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10);

  return NextResponse.json({ posts });
}
