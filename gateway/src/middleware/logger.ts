import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[gateway] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}
