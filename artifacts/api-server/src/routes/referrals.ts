import { Router } from "express";
import { db, referralsTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/referrals", async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId)).limit(1);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const referrals = await db.select().from(referralsTable).where(eq(referralsTable.referrerId, userId));

    res.json({
      referralCode: profile.referralCode,
      referralCount: referrals.length,
      referrals: referrals.map(r => ({ id: r.id, createdAt: r.createdAt })),
    });
  } catch (err) {
    console.error("referrals error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
