import { Express } from "express";
import { router as userRouter } from "../controllers/userController";
import { router as documentRouter } from "../controllers/documentController";
import { router as membershipRouter } from "../controllers/membershipController";
import { router as sharingRouter } from "../controllers/sharingController";
import { router as healthRouter } from "../controllers/healthController";

export function registerRoutes(app: Express) {
  app.use("/api/users", userRouter);
  app.use("/api/documents", documentRouter);
  app.use("/api/documents", membershipRouter); // nested routes under /:id/members
  app.use("/api/documents", sharingRouter);    // nested routes under /:id/share
  app.use("/", healthRouter);
}
