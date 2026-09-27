import { getRedis } from "../config/redis";
import { env } from "../config/env";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("[cache] get error:", error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = env.cacheTtlSeconds
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("[cache] set error:", error);
  }
}

/** Clear all product cache keys after create/update/delete */
export async function invalidateProductCache(): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    const keys = await redis.keys("products:*");
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`[cache] invalidated ${keys.length} key(s)`);
    }
  } catch (error) {
    console.error("[cache] invalidate error:", error);
  }
}

export function productListCacheKey(query: {
  search?: string;
  category?: string;
  page: number;
  limit: number;
}): string {
  return `products:list:${query.search ?? ""}:${query.category ?? ""}:${query.page}:${query.limit}`;
}

export function productItemCacheKey(id: string): string {
  return `products:item:${id}`;
}
