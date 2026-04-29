import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionService } from "./src/services/extractionService.js";
import { getDb } from "./src/lib/db.js";
import { nanoid } from "nanoid";

dotenv.config();

console.log("Starting Eurosia Datapilot AI Server...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const db = await getDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize modular AI Extraction Service
  const extractionService = new ExtractionService();

  // Performance: Simple Rate Limiting Simulation with Logging
  const rateLimitMap = new Map<string, number>();
  const rateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const lastRequest = rateLimitMap.get(ip as string) || 0;

    if (now - lastRequest < 300) { 
      console.warn(`[RateLimit] Blocked request from ${ip}`);
      return res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please wait a moment between operations."
        }
      });
    }
    rateLimitMap.set(ip as string, now);
    next();
  };

  // Apply rate limiter to API routes only
  app.use("/api", rateLimiter);

  // Test route
  app.get("/test-server", (req, res) => {
    res.send("Server is alive and reachable on port 3000");
  });

  // API Routes with Standard Response Structure
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      data: { 
        status: "operational", 
        version: "1.1.0-production",
        uptime: process.uptime(),
        services: ["ai", "database", "storage"]
      },
      message: "Eurosia Datapilot AI is healthy"
    });
  });

  // Usage and Credits API
  app.get("/api/user/usage", (req, res) => {
    const usage = db.data.usage.find(u => u.userId === 'anonymous') || db.data.usage[0];
    res.json({
      success: true,
      data: {
        credits_remaining: usage.creditsRemaining,
        credits_limit: usage.creditsLimit,
        plan: usage.plan,
        billing_status: usage.billingStatus
      },
      message: "Usage data retrieved"
    });
  });

  // AI Extraction History
  app.get("/api/extractions/history", (req, res) => {
    const history = [...db.data.extractions].reverse().slice(0, 50);
    res.json({
      success: true,
      data: history,
      message: "Extraction history retrieved"
    });
  });

  // Get Specific Extraction
  app.get("/api/extractions/:id", (req, res) => {
    const { id } = req.params;
    const extraction = db.data.extractions.find(e => e.id === id);
    
    if (!extraction) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Extraction not found" }
      });
    }

    res.json({
      success: true,
      data: extraction,
      message: "Extraction retrieved"
    });
  });

  // Export Extraction
  app.post("/api/extractions/:id/export", (req, res) => {
    const { id } = req.params;
    const { format } = req.body;
    
    const extraction = db.data.extractions.find(e => e.id === id);
    if (!extraction) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Extraction not found" }
      });
    }

    res.json({
      success: true,
      data: {
        export_url: `https://storage.eurosia.ai/exports/${id}.${format || 'csv'}`,
        id,
        format: format || 'csv'
      },
      message: `Extraction exported to ${format || 'CSV'}`
    });
  });

  // Primary AI Extraction Engine Endpoint
  app.post("/api/extractions", async (req, res) => {
    const { instruction, prompt: userPrompt, context, url, html } = req.body;
    const finalInstruction = instruction || userPrompt;
    const inputContent = html || context;
    const isUrl = !!url && !html;

    if (!finalInstruction || (!inputContent && !url)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Instruction and source (URL or HTML) are required." }
      });
    }

    // Usage check
    const usageIndex = db.data.usage.findIndex(u => u.userId === 'anonymous');
    const usage = db.data.usage[usageIndex];
    if (usage.creditsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: { code: "OUT_OF_CREDITS", message: "You have run out of credits. Please upgrade your plan." }
      });
    }

    console.log(`[AI Engine] Starting extraction for URL: ${url || 'HTML Input'}`);

    try {
      const result = await extractionService.processExtraction(
        finalInstruction, 
        inputContent || url, 
        isUrl
      );

      const id = nanoid();
      const extractionResult = {
        id,
        url: url || "direct_input",
        instruction: finalInstruction,
        fields: result.fields,
        rows: result.rows,
        summary: result.summary,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
        userId: 'anonymous'
      };

      // Persistence
      db.data.extractions.push(extractionResult);
      db.data.usage[usageIndex].creditsRemaining -= 1;
      await db.write();

      res.json({
        success: true,
        data: extractionResult,
        message: "Extraction completed successfully"
      });
    } catch (error: any) {
      console.error("[AI Engine Error]", error);
      res.status(500).json({
        success: false,
        error: { 
          code: "EXTRACTION_FAILED", 
          message: error.message || "Failed to process extraction" 
        }
      });
    }
  });

  // Billing Simulation
  app.post("/api/billing/create-checkout", (req, res) => {
    const { planId } = req.body;
    res.json({
      success: true,
      data: {
        checkout_url: `https://checkout.stripe.com/pay/mock_session_${planId}`,
        session_id: `sess_${nanoid()}`
      },
      message: "Checkout session created"
    });
  });

  // Extension dedicated endpoint
  app.post("/api/extension/extract", async (req, res) => {
    const { prompt, html, url, token } = req.body;
    
    if (!prompt || !html) {
      return res.status(400).json({ success: false, error: "Prompt and HTML are required" });
    }

    try {
      const result = await extractionService.processExtraction(prompt, html, false);
      
      const id = nanoid();
      const extractionResult = {
        id,
        url: url || "extension_input",
        instruction: prompt,
        fields: result.fields,
        rows: result.rows,
        summary: result.summary,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
        userId: 'anonymous'
      };

      db.data.extractions.push(extractionResult);
      await db.write();

      return res.json({ success: true, data: extractionResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/plans", (req, res) => {
    res.json({
      success: true,
      data: [
        { id: "free", name: "Free", credits: 10, price: 0 },
        { id: "pro", name: "Pro", credits: 1000, price: 29 },
        { id: "business", name: "Business", credits: 5000, price: 99 }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback to index.html for SPA in development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API and assets that Vite should have handled
      if (url.startsWith("/api") || url.includes(".")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`-----------------------------------------------`);
    console.log(`Eurosia Datapilot AI server is ONLINE`);
    console.log(`URL: http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`-----------------------------------------------`);
  });
}

startServer();
