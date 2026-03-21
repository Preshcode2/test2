import { Router } from "express";
import { db, chatsTable, messagesTable, profilesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import type { Request, Response } from "express";
import { streamWithCascade, generateWithCascade } from "../lib/ai-cascade";
import { buildChatSystemPrompt, buildAnalysisPrompt } from "../lib/prompts";

const router = Router();

function requireAuth(req: Request, res: Response): string | null {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/chats", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const chats = await db.select().from(chatsTable)
      .where(eq(chatsTable.userId, userId))
      .orderBy(desc(chatsTable.createdAt));
    res.json(chats);
  } catch (err) {
    console.error("list chats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chats", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const { title } = req.body;
    const [chat] = await db.insert(chatsTable).values({ userId, title: title ?? "New Chat" }).returning();
    res.status(201).json(chat);
  } catch (err) {
    console.error("create chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chats/:chatId", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const [chat] = await db.select().from(chatsTable)
      .where(and(eq(chatsTable.id, req.params.chatId), eq(chatsTable.userId, userId)))
      .limit(1);

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const messages = await db.select().from(messagesTable)
      .where(eq(messagesTable.chatId, chat.id))
      .orderBy(messagesTable.createdAt);

    res.json({ ...chat, messages });
  } catch (err) {
    console.error("get chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/chats/:chatId", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    await db.delete(messagesTable).where(eq(messagesTable.chatId, req.params.chatId));
    await db.delete(chatsTable)
      .where(and(eq(chatsTable.id, req.params.chatId), eq(chatsTable.userId, userId)));
    res.status(204).send();
  } catch (err) {
    console.error("delete chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chats/:chatId/messages", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { content, tone = "charmer" } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ error: "content required" });
    return;
  }

  try {
    const [chat] = await db.select().from(chatsTable)
      .where(and(eq(chatsTable.id, req.params.chatId), eq(chatsTable.userId, userId)))
      .limit(1);

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, userId)).limit(1);

    if (!profile) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (profile.tier === "free" && profile.dailyCredits <= 0) {
      res.status(429).json({ error: "Daily credit limit reached. Upgrade to continue." });
      return;
    }

    await db.insert(messagesTable).values({ chatId: chat.id, role: "user", content: content.trim() });

    if (chat.title === "New Chat" || chat.title === "New Conversation") {
      await db.update(chatsTable)
        .set({ title: content.trim().slice(0, 45) })
        .where(eq(chatsTable.id, chat.id));
    }

    const history = await db.select().from(messagesTable)
      .where(eq(messagesTable.chatId, chat.id))
      .orderBy(messagesTable.createdAt);

    const messages = [
      { role: "system" as const, content: buildChatSystemPrompt(tone) },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders();

    let fullResponse = "";
    let responseSent = false;

    const sendEvent = (data: object) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    const finish = async () => {
      if (responseSent) return;
      responseSent = true;

      try {
        await db.insert(messagesTable).values({
          chatId: chat.id,
          role: "assistant",
          content: fullResponse || "(no response)",
        });

        if (profile.tier === "free") {
          await db.update(profilesTable)
            .set({ dailyCredits: Math.max(0, profile.dailyCredits - 1) })
            .where(eq(profilesTable.id, userId));
        }
      } catch (dbErr) {
        console.error("DB write error:", dbErr);
      }

      let analysis = null;
      try {
        const allMessages = await db.select().from(messagesTable)
          .where(eq(messagesTable.chatId, chat.id))
          .orderBy(messagesTable.createdAt);
        const conversationText = allMessages
          .map(m => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");
        const analysisPrompt = buildAnalysisPrompt(conversationText, tone);

        const analysisRaw = await Promise.race([
          generateWithCascade([{ role: "user", content: analysisPrompt }]),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error("analysis timeout")), 20000)),
        ]) as string;

        const jsonMatch = analysisRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("Analysis skipped:", (e as Error).message);
      }

      sendEvent({ done: true, analysis });
      res.end();
    };

    await streamWithCascade(
      messages,
      (token) => {
        fullResponse += token;
        sendEvent({ token });
      },
      finish,
      async (err) => {
        console.error("Stream error:", err.message);
        if (!responseSent) {
          responseSent = true;
          if (fullResponse) {
            await finish();
          } else {
            sendEvent({ error: err.message });
            res.end();
          }
        }
      },
    );
  } catch (err) {
    console.error("messages route:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
