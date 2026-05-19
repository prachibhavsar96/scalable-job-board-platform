import dotenv from "dotenv";

dotenv.config();

function getNumberFromEnv(name: string, defaultValue: number) {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? defaultValue : numberValue;
}

function getBooleanFromEnv(name: string, defaultValue: boolean) {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: getNumberFromEnv("PORT", 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  useRedis: getBooleanFromEnv("USE_REDIS", false),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jobsCacheTtlSeconds: getNumberFromEnv("JOBS_CACHE_TTL_SECONDS", 60),
  rateLimitWindowMs: getNumberFromEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  rateLimitMaxRequests: getNumberFromEnv("RATE_LIMIT_MAX_REQUESTS", 100),
};
