import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import type { Request, Response } from "express";

const router = Router();

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";

const PLAN_PRICES: Record<string, number> = {
  plus: 9,
  pro: 19,
};

// ─── Create crypto payment ────────────────────────────────────────────────────
router.post("/payments/crypto/create", async (req: Request, res: Response) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "NOWPayments not configured" });
    return;
  }

  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { plan } = req.body;
  if (!plan || !PLAN_PRICES[plan]) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const [profile] = await db.select().from(profilesTable)
    .where(eq(profilesTable.id, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  try {
    const response = await fetch(`${NOWPAYMENTS_API}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: PLAN_PRICES[plan],
        price_currency: "usd",
        order_id: `${userId}_${plan}_${Date.now()}`,
        order_description: `Quov AI ${plan} plan`,
        ipn_callback_url: `${process.env.APP_URL}/api/payments/crypto/webhook`,
        success_url: `${process.env.APP_URL}/dashboard?upgraded=1`,
        cancel_url: `${process.env.APP_URL}/upgrade`,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("NOWPayments error:", err);
      res.status(500).json({ error: "Failed to create payment" });
      return;
    }

    const payment = await response.json() as any;
    res.json({
      paymentId: payment.payment_id,
      paymentUrl: payment.invoice_url ?? `https://nowpayments.io/payment/?iid=${payment.payment_id}`,
    });
  } catch (err) {
    console.error("crypto payment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── NOWPayments IPN webhook ──────────────────────────────────────────────────
router.post("/payments/crypto/webhook", async (req: Request, res: Response) => {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    res.status(500).json({ error: "IPN secret not configured" });
    return;
  }

  // Verify signature
  const signature = req.headers["x-nowpayments-sig"] as string;
  if (!signature) {
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  const sortedBody = JSON.stringify(sortObject(req.body));
  const hmac = crypto.createHmac("sha512", ipnSecret);
  hmac.update(sortedBody);
  const expected = hmac.digest("hex");

  if (signature !== expected) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const { payment_status, order_id } = req.body;

  // order_id format: userId_plan_timestamp
  const parts = (order_id as string)?.split("_");
  if (!parts || parts.length < 2) {
    res.status(400).json({ error: "Invalid order_id" });
    return;
  }

  const userId = parts[0];
  const plan = parts[1] as "plus" | "pro";

  if (payment_status === "finished" || payment_status === "confirmed") {
    try {
      const credits = plan === "pro" ? 999 : 20;
      await db.update(profilesTable)
        .set({ tier: plan, dailyCredits: credits, updatedAt: new Date() })
        .where(eq(profilesTable.id, userId));
      console.log(`Upgraded user ${userId} to ${plan}`);
    } catch (err) {
      console.error("webhook db error:", err);
      res.status(500).json({ error: "DB update failed" });
      return;
    }
  }

  res.json({ received: true });
});

function sortObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key] && typeof obj[key] === "object" ? sortObject(obj[key]) : obj[key];
    return acc;
  }, {} as Record<string, any>);
}

export default router;
