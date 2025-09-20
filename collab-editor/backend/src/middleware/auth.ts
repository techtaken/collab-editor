import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Middleware to ensure the user is authenticated via JWT
export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  
  // const authHeader = req.headers["authorization"];

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ message: "Unauthorized: No token provided" });
  // }
  // const token = authHeader.split(" ")[1]; // Extract the JWT
  try {
    
    // Verify token using the same secret you used while signing
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };

    // Attach user to request so routes can access it
    // (req as any).user = { id: decoded.id, email: decoded.email };
(req as any).user = { id: "1", email: "test@gmail.com" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
}

// Same as above but does not fail if unauthenticated
export function allowAnonymous(req: Request, _res: Response, next: NextFunction) {
  const userId = (req.headers["x-user-id"] as string) || null;
  if (userId) (req as any).user = { id: userId };
  next();
}
