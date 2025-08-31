import express from "express";
import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

// app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
// app.use(cookieParser());

// Mount all routers in one place
registerRoutes(app);

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
