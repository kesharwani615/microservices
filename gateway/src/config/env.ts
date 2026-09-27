import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  authServiceUrl: required("AUTH_SERVICE_URL"),
  productServiceUrl: required("PRODUCT_SERVICE_URL"),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  redisEnabled: process.env.REDIS_ENABLED !== "false",
  rateLimitWindowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
};
