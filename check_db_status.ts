
import dotenv from "dotenv";
dotenv.config();

// Dynamic imports to ensure env is loaded first
async function check() {
    try {
        console.log("Loading modules...");
        // @ts-ignore
        const connectDB = (await import("./src/lib/db")).default;
        // @ts-ignore
        const VoiceChunk = (await import("./src/models/VoiceChunk")).default;
        // @ts-ignore
        const BrandProfile = (await import("./src/models/BrandProfile")).default;

        await connectDB();
        console.log("Connected to DB");

        const chunkCount = await VoiceChunk.countDocuments();
        console.log("Total VoiceChunks:", chunkCount);

        const profiles = await BrandProfile.find({});
        console.log("BrandProfiles:", profiles.length);
        profiles.forEach((p: any) => {
            console.log(`- User: ${p.userId}`);
            console.log(`  URL: ${p.websiteUrl}`);
            console.log(`  Status: ${p.scrapeStatus}`);
            console.log(`  LastScraped: ${p.lastScraped}`);
        });

    } catch (e) {
        console.error("DB Check Failed:", e);
    }
    process.exit();
}
check();
