# E-Commerce Platform (Microservices)

Production-style e-commerce backend built with Node.js microservices — similar in spirit to Amazon/Flipkart backend architecture.

This project is designed for learning and interviews: authentication, payments, inventory, messaging, caching, Docker, and deployment.

---

## Business Domain

Online shopping platform where customers can:

1. Register / Login
2. Browse and search products
3. Add items to cart
4. Checkout and pay
5. Receive order confirmation
6. Track orders

### Core Order Flow

```text
Customer
   ↓
Login
   ↓
Browse Products
   ↓
Add to Cart
   ↓
Checkout
   ↓
Payment
   ↓
Create Order
   ↓
Reduce Stock
   ↓
Send Email / Notify Admin
```

This single business flow is split across multiple independent services.

---

## Architecture

```text
                         Client (Web / Mobile)
                                  |
                            API Gateway
                                  |
   ------------------------------------------------------------------------
   |          |          |         |          |           |               |
 Auth     Product      Cart      Order   Inventory    Payment      Notification
   |          |          |         |          |           |               |
   |          |          |         |          |           |               |
 AuthDB   ProductDB   CartDB   OrderDB  InventoryDB  PaymentDB   NotificationDB
 (Mongo)   (Mongo)    (Mongo)  (Mongo)    (Mongo)      (Mongo)       (Mongo)
                                  |
                              RabbitMQ
                                  |
                    -------------------------------
                    |             |               |
              Email Worker   Analytics      Stock Updates
                                  |
                                Redis
                         (cache / sessions / rate limit)
```

### Design Rules

- Each service is an independent Node.js app (own `package.json`, env, Dockerfile).
- **Database per service** — never query another service’s DB directly.
- Sync communication via **HTTP** when the client needs an immediate response.
- Async communication via **RabbitMQ** for background work (email, stock, analytics).

---

## Microservices

| Service | Responsibility | Database |
|---------|----------------|----------|
| **API Gateway** | Routing, auth check, rate limit, CORS, logging | — |
| **Auth Service** | Register, login, JWT, refresh token, logout, password reset | Auth DB |
| **Product Service** | Products, categories, images, search | Product DB |
| **Cart Service** | Add/remove/update cart items | Cart DB |
| **Order Service** | Create order, history, status, cancel | Order DB |
| **Inventory Service** | Stock levels, reserve/release stock | Inventory DB |
| **Payment Service** | Stripe, webhooks, refunds | Payment DB |
| **Notification Service** | Email / SMS / push from events | Notification DB |

### Service details

#### 1. Auth Service
- Register, Login, Logout
- JWT access token + refresh token
- Password reset
- Role (customer / admin)

#### 2. Product Service
- CRUD products
- Categories, product images
- Search / filters

#### 3. Cart Service
- Add / remove / update quantity
- View cart

#### 4. Order Service
- Create order from cart
- Order history & status
- Cancel order

#### 5. Inventory Service
- Available stock
- Reserve stock on checkout
- Update stock after payment / cancel

#### 6. Payment Service
- Stripe Checkout / PaymentIntent
- Webhooks
- Refunds

#### 7. Notification Service
- Consume RabbitMQ events
- Send email (order placed, payment success, etc.)

---

## Communication Patterns

### Synchronous (HTTP)

Used when the client needs an immediate response.

```text
Gateway → Auth Service → Response
Gateway → Product Service → Products
Gateway → Cart Service → Cart
```

Examples: login, get products, get cart, search.

### Asynchronous (RabbitMQ)

Used for side effects that should not block the user.

```text
Payment Success
     ↓
  RabbitMQ
     ↓
Order Service / Inventory Service / Notification Service
```

Examples: send email, reduce stock, analytics.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma (v6 for MongoDB support) |
| Database | MongoDB (one DB per service) |
| Cache | Redis |
| Message Broker | RabbitMQ |
| Auth | JWT + Refresh Token |
| Validation | Zod |
| File Storage | AWS S3 |
| API Docs | Swagger |
| Logging | Winston + Morgan |
| Containers | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| Process Manager | PM2 (optional on EC2) |
| Monitoring | Prometheus + Grafana (later) |
| Cloud | AWS EC2 |

---

## Project Structure

```text
ecommerce-microservices/
│
├── gateway/                          # API Gateway
│
├── services/
│   ├── auth-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── inventory-service/
│   ├── payment-service/
│   └── notification-service/
│
├── shared/
│   ├── logger/                       # Winston shared config
│   ├── auth/                         # JWT helpers / middleware
│   ├── events/                       # Event names & payloads
│   └── config/                       # Shared config helpers
│
├── docker-compose.yml
└── README.md
```

Each service will eventually contain:

```text
auth-service/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Development Roadmap

Build **one concept at a time**. Do not implement all services in parallel.

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Project planning + README + folder structure | Done |
| 2 | Repo setup, TypeScript tooling, shared basics | Done |
| 3 | Docker Compose (MongoDB, Redis, RabbitMQ) | Done |
| 4 | Shared library (logger, events, auth utils) | Pending |
| 5 | Auth Service (register/login/refresh/logout) | Done |
| 6 | API Gateway | Done |
| 7 | Product Service | Done |
| 8 | Cart Service | Pending |
| 9 | Order Service | Pending |
| 10 | Inventory Service | Pending |
| 11 | RabbitMQ event wiring | Pending |
| 12 | Notification Service | Pending |
| 13 | Payment Service (Stripe + webhooks) | Pending |
| 14 | Redis (cache, rate limit, sessions) | Done (cache + rate limit) |
| 15 | Monitoring, logging correlation, deployment | Pending |

### Why this order?

Auth comes first because almost every other service needs a verified user identity. Gateway comes next so the client has a single entry point. Domain services (product → cart → order → inventory) follow the shopping flow. Messaging and payments come after the core request/response path works.

---

## Example Event Flow (Checkout)

```text
1. Client → Gateway → Payment Service (pay)
2. Stripe webhook → Payment Service
3. Payment Service publishes: payment.succeeded
4. RabbitMQ fans out to:
   - Order Service     → mark order paid / create order
   - Inventory Service → confirm stock deduction
   - Notification      → send email
5. Client already got a fast response from payment initiation
```

---

## What You Will Learn

- Microservices architecture & database-per-service
- API Gateway (routing, CORS, rate limiting)
- JWT authentication across services
- Docker & Docker Compose
- RabbitMQ event-driven design
- Redis caching / rate limiting
- Prisma + MySQL
- Stripe webhooks & idempotency concepts
- Inventory reservation patterns
- Saga / distributed transaction ideas (conceptual)
- Centralized logging with request IDs
- Deploying services on AWS

---

## Local Prerequisites (for later phases)

- Node.js 20+
- Docker Desktop
- Git
- Postman or Thunder Client

---

## Getting Started

### Phase 1 — Planning (done)
- [x] Domain, services, communication, tech stack, folders, README, git

### Phase 2 — Auth + Docker (done)
- [x] Auth Service scaffold (Express + TypeScript + Prisma)
- [x] MongoDB via Docker Compose (+ Redis, RabbitMQ)
- [x] Auth APIs: register, login, refresh, logout, me

### Phase 6 — API Gateway (done)
- [x] Single entry point on port `4000`
- [x] Proxy `/api/v1/auth/*` → Auth Service
- [x] CORS + request logging

### Phase 7 — Product Service (done)
- [x] Product Service on port `4002` with own MongoDB (`product_db`)
- [x] Product CRUD + search/filter/pagination
- [x] Gateway proxy `/api/v1/products/*`

### Run locally

```bash
# 1) Start databases / broker
docker compose up -d

# 2) Auth service (terminal 1)
cd services/auth-service
npm run dev

# 3) Product service (terminal 2)
cd services/product-service
npm run prisma:push
npm run dev

# 4) API Gateway (terminal 3)
cd gateway
npm run dev
```

- Gateway health: `GET http://localhost:4000/health`
- Register: `POST http://localhost:4000/api/v1/auth/register`
- Products: `GET/POST http://localhost:4000/api/v1/products`
- Redis: `docker compose up -d` includes Redis on `6379`

**Next:** Phase 8 — Cart Service.

### MySQL vs MongoDB with Prisma

You do **not** create tables/collections manually.

- **MySQL**: write models in `schema.prisma`, then `prisma migrate dev` creates/updates tables.
- **MongoDB**: write models in `schema.prisma`, then `prisma db push` syncs collections/indexes.

Prisma 7 does not support MongoDB yet, so this project uses **Prisma 6**.

---

## License

MIT
