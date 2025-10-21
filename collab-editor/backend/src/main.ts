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

app.use(cors({
  origin: process.env.FE_URL?.split(",") ?? "*",  // 👈 exact domain, NOT '*'
  credentials: true,                   // 👈 must be true
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
app.options("*", cors());

// app.post("/api/users/login", (req, res) => {
//   res.json({ success: true });
// });

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

server.listen(3333, process.env.MY_IP, () => console.log("Server on port 3333"));

// server.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });
