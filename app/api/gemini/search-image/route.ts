import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Lazy-initialized Gemini client to prevent crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Check if key is available. If not, return a structured fallback response with a warning
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Returning simulated fallback search analysis.");
      return NextResponse.json({
        isDemo: true,
        detectedObject: "Wireless Headphones",
        confidence: 0.95,
        matchTerms: ["headphones", "audio", "wireless", "gadget"],
        visualAnalysis: "Demo Mode: A pair of sleek modern black headphones with metallic accents."
      });
    }

    const ai = getGeminiClient();

    let mimeType = "image/jpeg";
    let base64Data = image;

    // Handle data URL scheme (e.g. data:image/png;base64,iVBOR...)
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match && match.length === 3) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze this product image.
Identify what item is in this image. Categorize it, find matching descriptive keywords, and return a JSON response matching this schema:
{
  "detectedObject": "Short name of the object detected (e.g. 'headphones', 'alarm clock', 'backpack', 'water bottle')",
  "confidence": 0.0 to 1.0,
  "matchTerms": ["array", "of", "3-5", "descriptive", "search", "keywords", "in", "lowercase", "that", "relate", "to", "this", "item", "(e.g.", "audio,", "music,", "electronic)"],
  "visualAnalysis": "A very short, 1-sentence description of the visual qualities (color, style, shape) of this product."
}
Format the output strictly as a JSON object. Ensure no additional text or Markdown wrapping is returned.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Image Search API Error:", error);
    return NextResponse.json({
      error: error.message || "Internal Server Error",
      isFallback: true,
      detectedObject: "General Object",
      confidence: 0.5,
      matchTerms: ["electronics", "wellness", "home", "fashion"],
      visualAnalysis: "An error occurred while calling the AI model, so general tags were applied."
    }, { status: 500 });
  }
}
