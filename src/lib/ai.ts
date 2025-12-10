
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
const genModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 2. Function to generate an embedding for a single string
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// 3. Helper to batch process multiple chunks
export async function generateEmbeddingsBatch(texts: string[]) {
  const embeddings = await Promise.all(
    texts.map(async (text) => {
      const vector = await generateEmbedding(text);
      return { content: text, vector };
    })
  );
  return embeddings;
}

export async function generateSocialPost(
  contextChunks: string[],
  topic: string = "general updates",
  platform: "twitter" | "linkedin" | "instagram" = "linkedin"
): Promise<string[]> {
  // 1. Construct the Prompt
  const platformRules = {
    twitter: `
      - CRITICAL: Under 280 characters strict.
      - Style: Punchy, provocative, or value-dense.
      - Structure: Hook -> Value -> Call to Action (optional).
      - Use 1-2 relevant hashtags. Lowercase only.
      - No "Here is a tweet" preambles.
    `,
    linkedin: `
      - Style: Professional yet personal. Storytelling focus.
      - Structure: 
        1. Strong Hook (one line)
        2. "The Problem" or "The Context" (spaced out)
        3. The Insight/Solution (bullet points)
        4. Takeaway/Question.
      - Main aim: High engagement and comments.
      - Formatting: Use line breaks liberally for readability.
    `,
    instagram: `
      - Style: Visual, enthusiastic, lifestyle-oriented.
      - Structure: Catchy one-line hook. Deeper caption below.
      - Use Line breaks.
      - Ends with 3-5 high-traffic hashtags.
      - Assume there is an image attached (write the caption for it).
    `,
  };

  const prompt = `
    You are a world-class social media copywriter (top 1% on Typefully/Shield).
    
    YOUR GOAL:
    Write 3 unique, high-engagement ${platform} posts about: "${topic}".
    
    CONTEXT SOURCE: BRAND KNOWLEDGE BASE
    The provided context is snippets from the brand's website/docs.
    
    YOUR TASK:
    Write 3 fresh, on-brand social media posts.
    - Use the tone and facts from the context.
    - Do NOT mention "According to the text".
    
    BRAND VOICE & CONTEXT (Use this strictly):
    ${contextChunks.join("\n\n")}
    
    PLATFORM RULES (${platform.toUpperCase()}):
    ${platformRules[platform]}
    
    VIRAL FRAMEWORKS TO USE (Mix these up):
    1. PAS (Problem, Agitation, Solution)
    2. AIDA (Attention, Interest, Desire, Action)
    3. The "Unpopular Opinion"
    
    INSTRUCTIONS:
    - RETURN ONLY VALID JSON.
    - Format: ["Post 1 content...", "Post 2 content..."]
  `;

  // 2. Call Gemini
  const result = await genModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json", // Forces Gemini to return strictly JSON
    },
  });

  const response = result.response;

  // 3. Parse JSON
  try {
    const text = response.text();
    const posts = JSON.parse(text) as string[];
    return posts;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return ["Error generating posts. Please try again."];
  }
}

export async function analyzeVirality(content: string, platform: string): Promise<{ score: number; feedback: string }> {
  const prompt = `
        Act as a strict social media editor. Analyze this ${platform} post for virality.

        POST:
        "${content}"

        CRITERIA:
        1. Hook Strength (Grab attention?)
        2. Readability (Formatting, length)
        3. Value density (Fluff vs Insight)
        4. Call to Action (Clear?)

        OUTPUT JSON ONLY:
        {
            "score": number (0-100),
            "feedback": "One sentence specific actionable tip to improve it."
        }
    `;

  try {
    const result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const json = JSON.parse(result.response.text());
    return {
      score: json.score || 70,
      feedback: json.feedback || "Good start, try adding a stronger hook.",
    };
  } catch (e) {
    console.error("Virality Analysis failed:", e);
    return { score: 0, feedback: "Analysis unavailable." };
  }
}
