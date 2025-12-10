import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import GeneratedPost from "@/models/GeneratedPost";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { postId } = await req.json();
        if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

        await connectDB();

        await GeneratedPost.updateOne(
            { _id: postId },
            {
                $inc: { copyCount: 1 },
                $set: { isUsed: true }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
