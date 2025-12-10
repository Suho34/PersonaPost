import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Import auth setup
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import BrandProfile from "@/models/BrandProfile";

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the Body
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 3. Connect to Database
    await connectDB();

    // 4. Upsert (Update or Insert) logic
    // We find a profile for this userId. If it exists, we update the URL.
    // If it doesn't exist, we create a new one.
    const profile = await BrandProfile.findOneAndUpdate(
      { userId: session.user.id }, // Search criteria
      {
        userId: session.user.id,
        websiteUrl: url,
        scrapeStatus: "idle", // Reset status if they change URL
      },
      { new: true, upsert: true } // Options: return the new doc, create if missing
    );

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// We also add a GET route so we can fetch the profile when the page loads
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const profile = await BrandProfile.findOne({ userId: session.user.id });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
