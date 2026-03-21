import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  // Nullable to support OAuth-only accounts (Google sign-in)
  passwordHash: text("password_hash"),
  // Google OAuth
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  displayName: text("display_name"),
  tier: text("tier").notNull().default("free"),
  dailyCredits: integer("daily_credits").notNull().default(3),
  referralCode: text("referral_code").unique().notNull(),
  whopCustomerId: text("whop_customer_id"),
  creditsResetAt: timestamp("credits_reset_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
