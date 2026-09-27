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
  port: Number(process.env.PORT || 4002),
  databaseUrl: required("DATABASE_URL"),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  redisEnabled: process.env.REDIS_ENABLED !== "false",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 300),
};
