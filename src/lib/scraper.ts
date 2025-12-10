import puppeteer from "puppeteer";

/**
 * 1. Helper to clean text
 * Removes extra spaces, tabs, and newlines.
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces/newlines with single space
    .replace(/\n+/g, " ")
    .trim();
}

/**
 * 2. Helper to "Chunk" text
 * Splits massive text into smaller pieces (e.g., 1000 chars) for the AI.
 */
function chunkText(text: string, maxChunkSize = 1000): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    // If adding the next word exceeds max size, push current chunk and start new
    if ((currentChunk + word).length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += `${word} `;
  }

  // Push the last leftover chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function scrapeAndChunk(url: string) {
  try {
    console.log(`Visiting (Puppeteer): ${url}`);

    // A. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // "new" is default efficiently now
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for some unexpected environments
    });

    const page = await browser.newPage();

    // B. Go to URL & Wait for Network Idle (SPA support)
    // We wait until no network connections for at least 500ms
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // C. Extract Text
    // We evaluate function inside the browser context
    const rawText = await page.evaluate(() => {
      // Remove junk elements inside the DOM before extracting text
      const junkSelectors = [
        "script", "style", "nav", "footer", "header", "iframe", "noscript",
        "[class*='menu']", "[class*='nav']", "[class*='footer']"
      ];
      junkSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Try to get main content, fallback to body
      const main = document.querySelector("main") || document.querySelector("article") || document.body;
      return main ? main.innerText : "";
    });

    await browser.close();

    // D. Clean and Chunk
    const cleanedText = cleanText(rawText);
    const chunks = chunkText(cleanedText);

    console.log(`Scraped ${chunks.length} chunks from ${url}`);

    // Fallback validation
    if (chunks.length === 0) {
      console.warn("Puppeteer found no text. The site might be blocking headless browsers.");
    }

    return chunks;

  } catch (error) {
    console.error("Puppeteer Scraping failed:", error);
    throw error;
  }
}
