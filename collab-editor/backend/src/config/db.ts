// import mongoose from 'mongoose';
// import { Pool } from 'pg';

// const connectMongoDB = async () => {
//   const mongoUri = process.env.MONGO_URI!;
//   try {
//     await mongoose.connect(mongoUri);
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };

// const postgresPool = new Pool({
//   connectionString: process.env.POSTGRES_URI!,
// });

// postgresPool.connect()
//   .then(() => console.log("Connected to Postgres"))
//   .catch((err) => {
//     console.error("Postgres connection error:", err);
//     process.exit(1);
//   });

// export {postgresPool as db, connectMongoDB};

// src/db.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // Prevent multiple instances of Prisma Client in dev mode (hot reload problem)
  var __prisma: PrismaClient | undefined;
}

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

prisma = global.__prisma;

export default prisma;
