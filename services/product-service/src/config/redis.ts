import { createClient, RedisClientType } from "redis";
import { env } from "./env";

let client: RedisClientType | null = null;
let connected = false;

export async function getRedis(): Promise<RedisClientType | null> {
  if (!env.redisEnabled) {
    return null;
  }

  if (client && connected) {
    return client;
  }

  client = createClient({ url: env.redisUrl });

  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
    connected = false;
  });

  client.on("connect", () => {
    connected = true;
    console.log("[redis] connected");
  });

  try {
    if (!client.isOpen) {
      await client.connect();
    }
    connected = true;
    return client;
  } catch (error) {
    console.error("[redis] failed to connect — running without cache");
    connected = false;
    return null;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }
  client = null;
  connected = false;
}
