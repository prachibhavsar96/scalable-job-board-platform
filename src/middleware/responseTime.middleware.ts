import { NextFunction, Request, Response } from "express";

export function responseTimeLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    console.log(`${req.method} ${req.originalUrl} completed in ${durationMs}ms`);
  });

  next();
}
