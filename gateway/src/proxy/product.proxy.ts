import { RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";

/**
 * Express mounts at "/api/v1/products", so proxy sees "/:id" or "/".
 * Prepend "/products" for the Product Service.
 */
export const productProxy: RequestHandler = createProxyMiddleware({
  target: env.productServiceUrl,
  changeOrigin: true,
  pathRewrite: (path) => `/products${path}`,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(
        `[gateway] proxy → ${env.productServiceUrl}${proxyReq.path} (${req.method})`
      );
    },
    error: (err, _req, res) => {
      console.error("[gateway] product proxy error:", err.message);
      const response = res as import("express").Response;
      if (!response.headersSent) {
        response.status(502).json({
          success: false,
          message: "Product service unavailable",
        });
      }
    },
  },
});
