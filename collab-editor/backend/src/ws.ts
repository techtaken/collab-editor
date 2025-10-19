import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

/**
 * Simple Socket.IO setup:
 * - clients join a room: 'join-room' with roomId (doc id)
 * - client emits 'code-change' { roomId, code }
 * - server broadcasts to other clients in the room as 'remote-code-change' { code, sender }
 */
export function setupWs(server: HttpServer) {
  const io = new Server(server, {
    cors: {
    //   origin: process.env.FE_URL?.split(",") ?? "*",
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("ws: connected", socket.id);

    socket.on("join-room", (roomId: string) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`ws: ${socket.id} joined ${roomId}`);
    });

    socket.on("leave-room", (roomId: string) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`ws: ${socket.id} left ${roomId}`);
    });

    socket.on("code-change", (payload: { roomId: string; code: string }) => {
      const { roomId, code } = payload || {};
      if (!roomId) return;
      // broadcast to others in room
      socket.to(roomId).emit("remote-code-change", { code });
    });

    socket.on("disconnect", (reason) => {
      console.log("ws: disconnected", socket.id, reason);
    });
  });

  return io;
}