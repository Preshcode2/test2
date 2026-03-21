import { Router } from "express";
import crypto from "crypto";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

function verifyWhopSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expected = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function tierFromWhopPlan(planName: string): "plus" | "pro" {
  if (planName?.toLowerCase().includes("pro")) return "pro";
  return "plus";
}

router.post("/webhooks/whop", async (req: Request, res: Response) => {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const signature = req.headers["x-whop-signature"] as string;
  const rawBody = JSON.stringify(req.body);

  if (!signature || !verifyWhopSignature(rawBody, signature, secret)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const { event, data } = req.body;
  const customerEmail = data?.user?.email ?? data?.membership?.user?.email;
  const whopCustomerId = data?.user?.id ?? data?.membership?.user?.id;
  const planName = data?.plan?.name ?? "";

  try {
    if (event === "membership.created" || event === "membership.renewed") {
      const tier = tierFromWhopPlan(planName);
      if (customerEmail) {
        await db.update(profilesTable)
          .set({ tier, whopCustomerId, dailyCredits: 999, updatedAt: new Date() })
          .where(eq(profilesTable.email, customerEmail));
      }
    } else if (event === "membership.cancelled") {
      if (customerEmail) {
        await db.update(profilesTable)
          .set({ tier: "free", dailyCredits: 3, updatedAt: new Date() })
          .where(eq(profilesTable.email, customerEmail));
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
