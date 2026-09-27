# Redis in Microservices

Redis is shared infrastructure (see root `docker-compose.yml`). Each service connects with its own client — **not** a shared DB like Mongo.

## Current usage in this project

| Service | Redis use | Keys |
|---------|-----------|------|
| **API Gateway** | Rate limiting per IP | `rate:{ip}` |
| **Product Service** | Cache product reads | `products:list:*`, `products:item:{id}` |

## Why Redis here?

- **Cache** — faster reads, less MongoDB load (Product GET)
- **Rate limit** — protect Auth/login from abuse (Gateway)
- **Later** — OTP, session blacklist, pub/sub for Socket.io, BullMQ jobs

## Connection

```env
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

Set `REDIS_ENABLED=false` to run without Redis (cache/rate limit skipped gracefully).

## Cache pattern (Product Service)

```text
GET /products
  → check Redis key
  → HIT: return cached JSON (cached: true)
  → MISS: query Mongo → save Redis (TTL 300s) → return (cached: false)

POST/PUT/DELETE product
  → invalidate keys matching products:*
```

## Rate limit pattern (Gateway)

```text
Request from IP
  → INCR rate:{ip}
  → EXPIRE on first hit (60s window)
  → if count > 100 → 429 Too Many Requests
```

## Interview one-liner

> Redis is in-memory and fast. We use it for caching hot reads and rate limiting at the gateway — not as the source of truth. MongoDB remains the database of record.
