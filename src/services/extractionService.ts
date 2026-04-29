import OpenAI from "openai";
import * as cheerio from "cheerio";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractionResult {
  fields: string[];
  rows: any[];
  confidence: number;
  summary?: string;
}

export interface AIProvider {
  extract(instruction: string, context: string): Promise<ExtractionResult>;
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  private safeParse(text: string): any {
    try {
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("[AI] Failed to parse JSON:", e);
      return {
        fields: [],
        rows: [],
        confidence: 0,
        summary: "Error parsing AI response"
      };
    }
  }

  async extract(instruction: string, context: string): Promise<ExtractionResult> {
    const prompt = `
      You are an expert data extraction agent for Eurosia Datapilot AI.
      User instruction: "${instruction}"
      
      Page Context (HTML simplified to text):
      ${context}
      
      Rules:
      1. Return valid JSON only.
      2. Format: { "fields": string[], "rows": object[], "confidence": number, "summary": string }
      3. Fields should be descriptive keys (e.g., "product_name" instead of "name").
      4. If data is missing for a row, use null or "".
      5. Extract as many relevant items as possible.
    `;

    let retries = 2;
    while (retries >= 0) {
      try {
        const response = await this.client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a precise data extraction specialist. Always return valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const content = response.choices[0].message.content || "{}";
        const data = this.safeParse(content);
        
        return {
          fields: data.fields || [],
          rows: data.rows || [],
          confidence: data.confidence || 0.9,
          summary: data.summary || "Extraction completed successfully",
        };
      } catch (error) {
        console.error(`[OpenAIProvider] Attempt failed (${retries} retries left):`, error);
        if (retries === 0) throw error;
        retries--;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error("OpenAI extraction failed after retries");
  }
}

export class GeminiProvider implements AIProvider {
  private genAI: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  private safeParse(text: string): any {
    try {
      // Robust cleaning for potential markdown or trailing junk
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("[AI] Failed to parse JSON from Gemini:", e);
      return {
        fields: [],
        rows: [],
        confidence: 0,
        summary: "Error parsing AI response"
      };
    }
  }

  async extract(instruction: string, context: string): Promise<ExtractionResult> {
    const prompt = `
      You are an expert data extraction agent for Eurosia Datapilot AI.
      User instruction: "${instruction}"
      
      Page Context:
      ${context}
      
      Rules:
      1. Return valid JSON only.
      2. Format: { "fields": string[], "rows": object[], "confidence": number, "summary": string }
    `;

    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["fields", "rows", "summary", "confidence"],
          properties: {
            fields: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            summary: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = this.safeParse(text);

    return {
      fields: data.fields || [],
      rows: data.rows || [],
      confidence: data.confidence || 0.9,
      summary: data.summary || "Extraction completed using Gemini",
    };
  }
}

export class MockProvider implements AIProvider {
  async extract(instruction: string, context: string): Promise<ExtractionResult> {
    console.log("[MockProvider] Extracting with instruction:", instruction);
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isProductSearch = instruction.toLowerCase().includes("product") || instruction.toLowerCase().includes("price");
    const isContactSearch = instruction.toLowerCase().includes("contact") || instruction.toLowerCase().includes("email");

    if (isProductSearch) {
      return {
        fields: ["product_name", "price", "stock_status", "rating"],
        rows: [
          { product_name: "Ultra HD Smart TV", price: "$599.99", stock_status: "In Stock", rating: "4.8" },
          { product_name: "Wireless ANC Headphones", price: "$249.50", stock_status: "Low Stock", rating: "4.5" },
          { product_name: "MacBook Pro M3", price: "$1,299.00", stock_status: "In Stock", rating: "4.9" },
          { product_name: "Ergonomic Desk Chair", price: "$189.00", stock_status: "Out of Stock", rating: "4.2" }
        ],
        confidence: 0.95,
        summary: "Mock results: Simulation mode is active because no AI provider keys were found."
      };
    }

    if (isContactSearch) {
      return {
        fields: ["full_name", "role", "email", "linked_in"],
        rows: [
          { full_name: "Alice Johnson", role: "Product Manager", email: "alice@company.com", linked_in: "linkedin.com/in/alicej" },
          { full_name: "Bob Smith", role: "Software Architect", email: "bob@tech.io", linked_in: "linkedin.com/in/bobsmith" }
        ],
        confidence: 0.92,
        summary: "Mock contact results provided for demo purposes."
      };
    }

    // Default mock response
    return {
      fields: ["extracted_key", "value", "context"],
      rows: [
        { extracted_key: "Mission", value: "Eurosia Datapilot aims to democratize data access.", context: "Introduction section" },
        { extracted_key: "Founder", value: "Thunderbit team", context: "About page" }
      ],
      confidence: 0.88,
      summary: "Generic mock extraction results. Real AI processing requires GEMINI_API_KEY."
    };
  }
}

export class ExtractionService {
  private provider: AIProvider;

  constructor() {
    const providerType = process.env.AI_PROVIDER;
    
    // Prioritize Gemini as it is the environment's default
    if (process.env.GEMINI_API_KEY && (providerType === "gemini" || !providerType)) {
      this.provider = new GeminiProvider(process.env.GEMINI_API_KEY);
    } else if (process.env.OPENAI_API_KEY && providerType === "openai") {
      this.provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    } else {
      this.provider = new MockProvider();
      if (providerType && providerType !== "mock") {
        console.warn(`[ExtractionService] ${providerType} requested but API key missing. Falling back to Mock.`);
      }
    }
  }

  cleanHTML(html: string): string {
    const $ = cheerio.load(html);
    // Remove noise: scripts, styles, navigation, headers, footers, etc.
    $("script, style, nav, footer, header, iframe, noscript, svg, .ads, #ads").remove();
    
    // Normalize text: collapse whitespace and trim
    return $("body").text().replace(/\s+/g, " ").trim();
  }

  chunkContent(content: string, maxChunkSize: number = 20000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += maxChunkSize) {
      chunks.push(content.substring(i, i + maxChunkSize));
    }
    return chunks;
  }

  async fetchURL(url: string): Promise<string> {
    try {
      console.log(`[ExtractionService] Fetching URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error(`[ExtractionService] Error fetching URL ${url}:`, error.message);
      throw new Error(`Failed to fetch content from ${url}`);
    }
  }

  async processExtraction(instruction: string, input: string, isUrl: boolean = false): Promise<ExtractionResult> {
    let rawContent = input;
    
    if (isUrl) {
      rawContent = await this.fetchURL(input);
    }

    const context = this.cleanHTML(rawContent);

    // We'll use the first chunk for now or join them if small enough
    const chunks = this.chunkContent(context);
    const primaryContext = chunks[0] || "";

    const result = await this.provider.extract(instruction, primaryContext);

    // Basic deduplication of rows
    const uniqueRows = this.deduplicateRows(result.rows);
    
    return {
      ...result,
      rows: uniqueRows
    };
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  private deduplicateRows(rows: any[]): any[] {
    const seen = new Set();
    return rows.filter(row => {
      const serialized = JSON.stringify(row);
      if (seen.has(serialized)) return false;
      seen.add(serialized);
      return true;
    });
  }
}

export class AnthropicProvider implements AIProvider {
  constructor(private apiKey: string) {}

  async extract(instruction: string, context: string): Promise<ExtractionResult> {
    // Stage 1: Stub for future implementation
    console.log("[AnthropicProvider] Integration planned for v1.2");
    throw new Error("AnthropicProvider not yet implemented.");
  }
}
