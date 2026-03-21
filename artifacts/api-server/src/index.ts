process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  process.exit(1);
});

import app from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  console.error("FATAL: PORT environment variable is required but was not provided.");
  process.exit(1);
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  console.error(`FATAL: Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
}).on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
