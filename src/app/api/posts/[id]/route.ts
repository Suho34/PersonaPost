import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import GeneratedPost from "@/models/GeneratedPost";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;

        const deletedPost = await GeneratedPost.findOneAndDelete({
            _id: id,
            userId: session.user.id, // Security: Ensure user owns the post
        });

        if (!deletedPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { content } = await req.json();
        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        await connectDB();
        const { id } = await params;

        const updatedPost = await GeneratedPost.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { content: content },
            { new: true }
        );

        if (!updatedPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, post: updatedPost });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
