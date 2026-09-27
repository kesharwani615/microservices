import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import { authProxy } from "./proxy/auth.proxy";
import { productProxy } from "./proxy/product.proxy";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
  })
);

app.use(requestLogger);

// Redis rate limiting (applies to all routes below)
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    redis: env.redisEnabled,
    routes: {
      auth: "/api/v1/auth/*",
      products: "/api/v1/products/*",
    },
  });
});

/**
 * Do NOT use express.json() before proxied routes.
 */
app.use("/api/v1/auth", authProxy);
app.use("/api/v1/products", productProxy);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found on API Gateway",
  });
});

app.listen(env.port, () => {
  console.log(`API Gateway running on port ${env.port}`);
  console.log(`Auth proxy: /api/v1/auth/* → ${env.authServiceUrl}/auth/*`);
  console.log(
    `Product proxy: /api/v1/products/* → ${env.productServiceUrl}/products/*`
  );
  if (env.redisEnabled) {
    console.log(
      `Rate limit: ${env.rateLimitMaxRequests} req / ${env.rateLimitWindowSeconds}s per IP`
    );
  }
});
