// src/index.ts
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import http from "http";
import { setupYjsSocketServer } from "./yjs-server-premitive";

export const app = express();

// --- CORS CONFIGURATION ---
const allowedOrigins = process.env.FE_URL ? process.env.FE_URL.split(",") : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list or matches a Vercel preview pattern
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") || // Allow all Vercel subdomains
                      origin.includes("localhost");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));

// Pre-flight requests
app.options("*", cors());

app.use(express.json({ limit: "1mb" }));

// Register standard routes
registerRoutes(app);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// --- SERVER SETUP ---
const PORT = Number(process.env.PORT) || 3333;

// For Render/Production, we MUST bind to 0.0.0.0
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const server = http.createServer(app);

// Initialize Socket.io / Yjs Server
setupYjsSocketServer(server);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Allowed Origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "Defaults only"}`);
});