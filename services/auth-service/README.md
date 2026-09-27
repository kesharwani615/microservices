# Auth Service

Authentication microservice for the e-commerce platform.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | No | Refresh tokens |
| POST | `/auth/logout` | No | Logout (invalidate refresh token) |
| GET | `/auth/me` | Bearer access token | Current user |

## Setup

1. Start infra from repo root:

```bash
docker compose up -d
```

2. Install + push schema:

```bash
cd services/auth-service
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

## Example register body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
