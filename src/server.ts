import app from "./app";
import { env } from "./config/env";
import { disconnectRedis } from "./config/redis";
import prisma from "./db/prisma";
import { Socket } from "net";

const server = app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

let isShuttingDown = false;
const activeSockets = new Set<Socket>();

server.on("connection", (socket) => {
  activeSockets.add(socket);

  socket.on("close", () => {
    activeSockets.delete(socket);
  });
});

async function cleanupConnections() {
  await prisma.$disconnect();
  console.log("Prisma disconnected");

  await disconnectRedis();
}

function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down server...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);

  const closeSocketsTimer = setTimeout(() => {
    activeSockets.forEach((socket) => socket.destroy());
  }, 5000);

  forceExitTimer.unref();
  closeSocketsTimer.unref();

  server.close(async (error) => {
    clearTimeout(forceExitTimer);
    clearTimeout(closeSocketsTimer);

    if (error) {
      console.error("Error while closing server:", error.message);
      process.exit(1);
    }

    try {
      await cleanupConnections();
      console.log("Server shutdown complete");
      process.exit(0);
    } catch (cleanupError) {
      const message =
        cleanupError instanceof Error ? cleanupError.message : "Unknown error";
      console.error("Shutdown cleanup failed:", message);
      process.exit(1);
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
