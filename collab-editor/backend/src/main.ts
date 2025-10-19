import express from "express";
import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import http from "http";
import { setupWs } from "./ws";

export const app = express();

// app.use(helmet());
// app.use(cors({ origin: process.env.FE_URL?.split(",") ?? "*", credentials: true }));
app.use(cors());
app.use(express.json({ limit: "1mb" }));
// app.use(cookieParser());

// Mount all routers in one place
registerRoutes(app);

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3333;

// create HTTP server and attach Socket.IO
const server = http.createServer(app);
setupWs(server);
server.listen(3333, "0.0.0.0", () => console.log("Server on port 4000"));

// server.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });
