import { createServer, startServer } from "./server";

// Get command line arguments
const args = process.argv.slice(2);
const useSSE = args.includes("--sse");

const server = createServer();
startServer(server, useSSE);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

export default server;
