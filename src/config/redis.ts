import { createClient } from "redis";
import { env } from "./env";

export const isRedisEnabled = env.useRedis;

const redisClient = createClient({
  url: env.redisUrl,
});

let isConnecting = false;
let isRedisUnavailable = false;
let hasLoggedRedisUnavailable = false;

redisClient.on("error", (error) => {
  isRedisUnavailable = true;

  if (isRedisEnabled && !hasLoggedRedisUnavailable) {
    hasLoggedRedisUnavailable = true;
    console.warn(`Redis unavailable. Falling back to database. ${error.message}`);
  }
});

export async function connectRedis() {
  if (!isRedisEnabled || redisClient.isOpen || isConnecting || isRedisUnavailable) {
    return false;
  }

  isConnecting = true;

  try {
    await redisClient.connect();
    console.log("Redis connected");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    isRedisUnavailable = true;

    if (!hasLoggedRedisUnavailable) {
      hasLoggedRedisUnavailable = true;
      console.warn(`Redis unavailable. Falling back to database. ${message}`);
    }

    return false;
  } finally {
    isConnecting = false;
  }
}

export async function getCache(key: string) {
  const isConnected = await connectRedis();

  if (!isRedisEnabled || !isConnected || !redisClient.isOpen) {
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch {
    isRedisUnavailable = true;
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
  const isConnected = await connectRedis();

  if (!isRedisEnabled || !isConnected || !redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch {
    isRedisUnavailable = true;
  }
}

export async function clearCacheByPrefix(prefix: string) {
  const isConnected = await connectRedis();

  if (!isRedisEnabled || !isConnected || !redisClient.isOpen) {
    return;
  }

  try {
    for await (const keys of redisClient.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      const keysToDelete = Array.isArray(keys) ? keys : [keys];

      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
      }
    }
  } catch {
    isRedisUnavailable = true;
  }
}

export async function disconnectRedis() {
  if (!isRedisEnabled || !redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.quit();
    console.log("Redis disconnected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Redis disconnect failed:", message);
  }
}
