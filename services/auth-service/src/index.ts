import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import prisma from "./config/prisma";

const app = express();

app.use(express.json());

// Log every request so you can see Postman hits in the terminal
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use("/auth", authRoutes);

app.listen(env.port, async () => {
  console.log(`Auth service running on port ${env.port}`);
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
  }
});
