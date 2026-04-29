import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractionResult {
  fields: string[];
  data: Record<string, any>[];
  summary: string;
  confidence: number;
}

/**
 * AI Provider Interface for future modularity (OpenAI/Anthropic)
 */
export interface AIProvider {
  extract(instruction: string, context: string): Promise<ExtractionResult>;
}

export class GeminiProvider implements AIProvider {
  async extract(instruction: string, context: string): Promise<ExtractionResult> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY_MISSING');
    }

    // Safety: Chunk context if too large (Gemini handles 32k+ but let's be responsible)
    const sanitizedContext = context.length > 50000 
      ? context.substring(0, 50000) + "... [truncated]"
      : context;

    const prompt = `
      You are an expert data extraction agent for Eurosia Datapilot AI.
      User instruction: "${instruction}"
      
      Page Context:
      ${sanitizedContext}
      
      Rules:
      1. Return valid JSON only.
      2. If data is ambiguous, set confidence accordingly.
      3. Do not invent data.
      4. Standardize text (remove trailing spaces, common typos).
    `;

    try {
      // @ts-ignore
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["fields", "data", "summary", "confidence"],
            properties: {
              fields: { type: Type.ARRAY, items: { type: Type.STRING } },
              data: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              summary: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            }
          }
        }
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text || '{}') as ExtractionResult;
    } catch (error: any) {
      console.error("Gemini Scan Error:", error);
      throw new Error(`AI_EXTRACTION_FAILED: ${error.message}`);
    }
  }
}

const currentProvider = new GeminiProvider();

export async function extractData(instruction: string, context: string): Promise<ExtractionResult> {
  return currentProvider.extract(instruction, context);
}
