import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db, profilesTable, referralsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";

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

function resetCreditsIfNeeded(profile: typeof profilesTable.$inferSelect) {
  const now = new Date();
  const hoursSinceReset = (now.getTime() - new Date(profile.creditsResetAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceReset >= 24 && profile.tier === "free";
}

// ─── Email / Password Signup ─────────────────────────────────────────────────
router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode: usedCode } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db.select().from(profilesTable)
      .where(eq(profilesTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = nanoid(8).toUpperCase();

    const [profile] = await db.insert(profilesTable).values({
      email,
      passwordHash,
      referralCode,
      tier: "free",
      dailyCredits: 3,
    }).returning();

    if (usedCode && profile) {
      const referrer = await db.select().from(profilesTable)
        .where(eq(profilesTable.referralCode, usedCode)).limit(1);
      if (referrer.length > 0) {
        await db.insert(referralsTable).values({
          referrerId: referrer[0].id,
          referredId: profile.id,
        });
        // Bonus credits for both
        await db.update(profilesTable)
          .set({ dailyCredits: referrer[0].dailyCredits + 10 })
          .where(eq(profilesTable.id, referrer[0].id));
        await db.update(profilesTable)
          .set({ dailyCredits: profile.dailyCredits + 10 })
          .where(eq(profilesTable.id, profile.id));
        profile.dailyCredits += 10;
      }
    }

    (req.session as any).userId = profile.id;
    res.status(201).json(formatProfile(profile));
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Email / Password Login ──────────────────────────────────────────────────
router.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", async (err: unknown, user: typeof profilesTable.$inferSelect | false, info: { message?: string } | undefined) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: info?.message ?? "Invalid credentials" });
      return;
    }

    req.logIn(user, async (loginErr: Error | null) => {
      if (loginErr) return next(loginErr);

      (req.session as any).userId = user.id;

      // Reset daily credits if needed
      if (resetCreditsIfNeeded(user)) {
        const now = new Date();
        await db.update(profilesTable)
          .set({ dailyCredits: 3, creditsResetAt: now })
          .where(eq(profilesTable.id, user.id));
        user.dailyCredits = 3;
      }

      res.json(formatProfile(user));
    });
  })(req, res, next);
});

// ─── Google OAuth ────────────────────────────────────────────────────────────
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
  async (req: Request, res: Response) => {
    const user = req.user as typeof profilesTable.$inferSelect;
    (req.session as any).userId = user.id;

    // Reset daily credits if needed
    if (resetCreditsIfNeeded(user)) {
      const now = new Date();
      await db.update(profilesTable)
        .set({ dailyCredits: 3, creditsResetAt: now })
        .where(eq(profilesTable.id, user.id));
    }

    const frontendUrl = process.env.VITE_APP_URL ?? "";
    res.redirect(`${frontendUrl}/dashboard`);
  },
);

// ─── Get Current User ────────────────────────────────────────────────────────
router.get("/auth/me", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, userId)).limit(1);
    if (!profile) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (resetCreditsIfNeeded(profile)) {
      const now = new Date();
      await db.update(profilesTable)
        .set({ dailyCredits: 3, creditsResetAt: now })
        .where(eq(profilesTable.id, profile.id));
      profile.dailyCredits = 3;
    }

    res.json(formatProfile(profile));
  } catch (err) {
    console.error("auth/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────────
router.post("/auth/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err: Error | null) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

export default router;
