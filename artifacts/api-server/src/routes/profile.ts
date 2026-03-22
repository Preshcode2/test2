import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

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

function requireAuth(req: Request, res: Response): string | null {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/profile", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, userId)).limit(1);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    res.json(formatProfile(profile));
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update display name and/or email
router.patch("/profile", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { displayName, email } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (displayName !== undefined) updates.displayName = displayName.trim() || null;
    if (email !== undefined) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Invalid email address" });
        return;
      }
      // Check not taken by another user
      const [existing] = await db.select().from(profilesTable)
        .where(eq(profilesTable.email, email)).limit(1);
      if (existing && existing.id !== userId) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
      updates.email = email.trim().toLowerCase();
    }
    const [profile] = await db.update(profilesTable)
      .set(updates)
      .where(eq(profilesTable.id, userId))
      .returning();
    res.json(formatProfile(profile));
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change password
router.post("/profile/change-password", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }
    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, userId)).limit(1);
    if (!profile) { res.status(404).json({ error: "User not found" }); return; }

    // If they have a password, verify current one
    if (profile.passwordHash) {
      if (!currentPassword) {
        res.status(400).json({ error: "Current password is required" });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, profile.passwordHash);
      if (!valid) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.update(profilesTable)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId));
    res.json({ success: true });
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete account
router.delete("/profile", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    await db.delete(profilesTable).where(eq(profilesTable.id, userId));
    req.session.destroy(() => {});
    res.json({ success: true });
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
