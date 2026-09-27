# Product Service

Product catalog microservice — owns its own MongoDB database (`product_db`).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/products` | Create product |
| GET | `/products` | List / search (`?search=&category=&page=&limit=`) |
| GET | `/products/:id` | Get one product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Soft delete (`isActive: false`) |

## Run

```bash
# Mongo must already be up with replica set rs0
cd services/product-service
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

## Via API Gateway

```text
POST http://localhost:4000/api/v1/products
GET  http://localhost:4000/api/v1/products
GET  http://localhost:4000/api/v1/products/:id
```

## Redis caching

GET `/products` and GET `/products/:id` are cached in Redis (TTL 300s).
Response includes `"cached": true` when served from Redis.

Create/update/delete invalidates `products:*` keys.

```env
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300
```

See also: `shared/redis/README.md`

## Note on stock

Stock quantity is **not** owned here long-term.
Inventory Service will own stock later (database-per-service).
