import { log } from "console";
import { Request, Response, NextFunction } from "express";

// For production use proper JWT/session middleware. This is a placeholder.
export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  // Example: read user from req.headers["x-user-id"] or from JWT
  const userId = (req.headers["x-user-id"] as string) || null;
  console.log("user "+userId);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  (req as any).user = { id: userId };
  next();
}

// Same as above but does not fail if unauthenticated
export function allowAnonymous(req: Request, _res: Response, next: NextFunction) {
  const userId = (req.headers["x-user-id"] as string) || null;
  if (userId) (req as any).user = { id: userId };
  next();
}
