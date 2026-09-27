# API Gateway

Single entry point for the e-commerce microservices backend.

## Why a Gateway?

Clients (Postman / frontend) talk only to the Gateway.
The Gateway routes requests to the correct microservice.

```text
Client
  ↓
API Gateway (:4000)
  ↓
Auth (:4001)  |  Product (:4002)
```

## Routes (current)

| Client URL | Proxied to |
|------------|------------|
| `GET /health` | Gateway itself |
| `POST /api/v1/auth/register` | `POST :4001/auth/register` |
| `POST /api/v1/auth/login` | `POST :4001/auth/login` |
| `POST /api/v1/auth/refresh` | `POST :4001/auth/refresh` |
| `POST /api/v1/auth/logout` | `POST :4001/auth/logout` |
| `GET /api/v1/auth/me` | `GET :4001/auth/me` |
| `POST /api/v1/products` | `POST :4002/products` |
| `GET /api/v1/products` | `GET :4002/products` |
| `GET /api/v1/products/:id` | `GET :4002/products/:id` |
| `PUT /api/v1/products/:id` | `PUT :4002/products/:id` |
| `DELETE /api/v1/products/:id` | `DELETE :4002/products/:id` |

## Run

Terminal 1 — Auth (must be running):

```bash
cd services/auth-service
npm run dev
```

Terminal 2 — Gateway:

```bash
cd gateway
npm install
npm run dev
```

## Test via Gateway (Postman)

`POST http://localhost:4000/api/v1/auth/register`

```json
{
  "name": "John",
  "email": "john-gateway@example.com",
  "password": "secret123"
}
```

## Responsibilities (now vs later)

| Now | Later |
|-----|--------|
| Routing | JWT verification at edge |
| CORS | Circuit breaker / retries |
| Request logging | Product/Cart/Order proxies |
| **Redis rate limiting** | Per-route limits |
| 502 if service down | Redis session blacklist |
