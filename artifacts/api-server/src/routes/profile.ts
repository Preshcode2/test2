import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

function formatProfile(p: typeof profilesTable.$inferSelect) {
  return {
    id: p.id,
    email: p.email,
    tier: p.tier,
    dailyCredits: p.dailyCredits,
    referralCode: p.referralCode,
    whopCustomerId: p.whopCustomerId,
    avatarUrl: p.avatarUrl,
    displayName: p.displayName,
    createdAt: p.createdAt,
  };
}

router.get("/profile", async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, userId)).limit(1);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(formatProfile(profile));
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const { email, displayName } = req.body;
    const [profile] = await db.update(profilesTable)
      .set({ email, displayName, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId))
      .returning();
    res.json(formatProfile(profile));
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
