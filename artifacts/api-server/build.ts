import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import { rm, readFile, copyFile, mkdir } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times without risking some
// packages that are not bundle compatible
const allowlist = [
  "@google/generative-ai",
  "axios",
  "bcryptjs",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-google-oauth20",
  "passport-local",
  "pg",
  "stripe",
  "tesseract.js",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

// Resolve workspace package source roots (two levels up from artifacts/api-server)
const workspaceRoot = path.resolve(__dirname, "../..");
const workspaceAlias: Record<string, string> = {
  "@workspace/db": path.resolve(workspaceRoot, "lib/db/src/index.ts"),
  "@workspace/api-zod": path.resolve(workspaceRoot, "lib/api-zod/src/index.ts"),
  "@workspace/api-client-react": path.resolve(workspaceRoot, "lib/api-client-react/src/index.ts"),
};

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });

  console.log("building server...");
  const pkgPath = path.resolve(__dirname, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter(
    (dep) =>
      !allowlist.includes(dep) &&
      !(pkg.dependencies?.[dep]?.startsWith("workspace:")),
  );

  await esbuild({
    entryPoints: [path.resolve(__dirname, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(distDir, "index.cjs"),
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    alias: workspaceAlias,
    logLevel: "info",
  });

  // connect-pg-simple reads table.sql relative to __dirname of the bundled file
  await mkdir(distDir, { recursive: true });
  const tableSqlSrc = path.resolve(__dirname, "node_modules/connect-pg-simple/table.sql");
  await copyFile(tableSqlSrc, path.resolve(distDir, "table.sql"));
  console.log("copied connect-pg-simple/table.sql → dist/table.sql");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
