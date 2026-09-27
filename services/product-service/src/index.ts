import express from "express";
import { env } from "./config/env";
import { getRedis } from "./config/redis";
import productRoutes from "./routes/product.routes";

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", async (_req, res) => {
  const redis = await getRedis();
  res.json({
    status: "ok",
    service: "product-service",
    redis: env.redisEnabled && redis !== null,
  });
});

app.use("/products", productRoutes);

app.listen(env.port, () => {
  console.log(`Product service running on port ${env.port}`);
  if (env.redisEnabled) {
    getRedis().catch(() => undefined);
  }
});
