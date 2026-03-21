import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import path from "path";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import router from "./routes";

const PgStore = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim())
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isHttps = process.env.NODE_ENV === "production";

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: "session",
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60,
  }),
  secret: process.env.SESSION_SECRET ?? "quov-ai-dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isHttps,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    sameSite: isHttps ? "none" : "lax",
  },
}));

// ─── Passport: Local Strategy ────────────────────────────────────────────────
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email: string, password: string, done: (err: unknown, user?: Express.User | false, options?: { message: string }) => void) => {
    try {
      const [profile] = await db.select().from(profilesTable)
        .where(eq(profilesTable.email, email)).limit(1);
      if (!profile || !profile.passwordHash) {
        return done(null, false, { message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(password, profile.passwordHash);
      if (!valid) return done(null, false, { message: "Invalid credentials" });
      return done(null, profile);
    } catch (err) {
      return done(err);
    }
  },
));

// ─── Passport: Google OAuth Strategy ────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "/api/auth/google/callback",
    },
    async (_accessToken: string, _refreshToken: string, profile: import("passport-google-oauth20").Profile, done: (err: Error | null, user?: Express.User | false) => void) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"));

        // Check if user exists by googleId
        let [existing] = await db.select().from(profilesTable)
          .where(eq(profilesTable.googleId, profile.id)).limit(1);

        if (!existing) {
          // Check by email (link accounts)
          const [byEmail] = await db.select().from(profilesTable)
            .where(eq(profilesTable.email, email)).limit(1);

          if (byEmail) {
            // Link Google to existing account
            const [updated] = await db.update(profilesTable)
              .set({
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value ?? byEmail.avatarUrl,
                displayName: profile.displayName ?? byEmail.displayName,
                updatedAt: new Date(),
              })
              .where(eq(profilesTable.id, byEmail.id))
              .returning();
            return done(null, updated);
          }

          // Create new account
          const referralCode = nanoid(8).toUpperCase();
          const [created] = await db.insert(profilesTable).values({
            email,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value,
            displayName: profile.displayName,
            referralCode,
            tier: "free",
            dailyCredits: 3,
          }).returning();
          return done(null, created);
        }

        return done(null, existing);
      } catch (err) {
        return done(err as Error);
      }
    },
  ));
}

// ─── Passport: Serialize / Deserialize ──────────────────────────────────────
passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, id)).limit(1);
    done(null, profile ?? false);
  } catch (err) {
    done(err as Error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", router);

// ─── Serve Frontend (production) ─────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  // process.cwd() is the project root on Render
  const frontendDist = path.resolve(process.cwd(), "artifacts/quov-ai/dist/public");
  app.use(express.static(frontendDist));
  app.get("*", (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export { passport };
export default app;
