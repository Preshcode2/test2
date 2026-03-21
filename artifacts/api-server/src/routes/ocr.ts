import { Router } from "express";
import multer from "multer";
import type { Request, Response } from "express";
import { db, chatsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateWithCascade } from "../lib/ai-cascade";
import { buildAnalysisPrompt } from "../lib/prompts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/chats/:chatId/ocr", upload.single("image"), async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Image file required" });
    return;
  }

  const [chat] = await db.select().from(chatsTable)
    .where(and(eq(chatsTable.id, req.params.chatId), eq(chatsTable.userId, userId)))
    .limit(1);

  if (!chat) {
    res.status(404).json({ error: "Chat not found" });
    return;
  }

  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const extractedText = text.trim();

    let analysis = null;
    if (extractedText) {
      try {
        const prompt = buildAnalysisPrompt(extractedText, "charmer");
        const raw = await generateWithCascade([{ role: "user", content: prompt }]);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("OCR analysis error:", e);
      }
    }

    res.json({ extractedText, analysis });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

export default router;
