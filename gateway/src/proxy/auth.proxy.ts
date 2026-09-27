import { RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";

/**
 * Forwards /api/v1/auth/* → Auth Service /auth/*
 *
 * Express mounts this at "/api/v1/auth", so the proxy only sees "/register".
 * We must prepend "/auth" again.
 *
 * Example:
 *   POST /api/v1/auth/register  →  POST http://localhost:4001/auth/register
 */
export const authProxy: RequestHandler = createProxyMiddleware({
  target: env.authServiceUrl,
  changeOrigin: true,
  pathRewrite: (path) => `/auth${path}`,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(
        `[gateway] proxy → ${env.authServiceUrl}${proxyReq.path} (${req.method})`
      );
    },
    error: (err, _req, res) => {
      console.error("[gateway] auth proxy error:", err.message);
      const response = res as import("express").Response;
      if (!response.headersSent) {
        response.status(502).json({
          success: false,
          message: "Auth service unavailable",
        });
      }
    },
  },
});
