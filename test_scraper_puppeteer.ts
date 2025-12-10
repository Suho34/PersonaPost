
import dotenv from "dotenv";
dotenv.config();

// We need dynamic import if we want to run this with tsx directly and ensure env is loaded? 
// Actually tsx handles it fine usually, but let's be safe.
import { scrapeAndChunk } from "./src/lib/scraper";

async function test() {
    console.log("Testing Puppeteer Scraper...");
    try {
        const chunks = await scrapeAndChunk("https://example.com");
        console.log("Success! Chunks:", chunks.length);
        console.log("Content:", chunks[0]);
    } catch (e) {
        console.error("Puppeteer Test Failed:", e);
    }
}
test();
