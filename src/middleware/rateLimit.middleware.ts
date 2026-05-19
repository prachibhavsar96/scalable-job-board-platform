import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const publicReadOnlyRoutes = new Set([
  "/api/dashboard/public-stats",
  "/api/jobs",
  "/api/companies",
]);

function isPublicReadOnlyRoute(req: { method: string; path: string }) {
  return req.method === "GET" && publicReadOnlyRoutes.has(req.path);
}

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max:
    env.nodeEnv === "development"
      ? Math.max(env.rateLimitMaxRequests, 500)
      : env.rateLimitMaxRequests,
  skip: isPublicReadOnlyRoute,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.nodeEnv === "development" ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
