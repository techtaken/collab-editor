import { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (res.headersSent) return;
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
}
