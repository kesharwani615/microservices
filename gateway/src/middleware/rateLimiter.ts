import { Request, Response, NextFunction } from "express";
import { getRedis } from "../config/redis";
import { env } from "../config/env";

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0];
    return first ? first.trim() : req.ip || "unknown";
  }
  return req.ip || "unknown";
}

/**
 * Redis-backed rate limiter at the gateway edge.
 * Key: rate:{ip} — shared across all routes for that IP.
 */
export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const redis = await getRedis();
  if (!redis) {
    return next();
  }

  const ip = getClientIp(req);
  const key = `rate:${ip}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, env.rateLimitWindowSeconds);
    }

    res.setHeader("X-RateLimit-Limit", env.rateLimitMaxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, env.rateLimitMaxRequests - count)
    );

    if (count > env.rateLimitMaxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("[rateLimiter] error:", error);
    next();
  }
}
