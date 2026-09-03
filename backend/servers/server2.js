import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "../config/db.js";

import teamRoutes from "../routes/teamRoutes.js";
import questionRoutes from "../routes/questionRoutes.js";
import gameRoutes from "../routes/gameRoutes.js";
import monitorRoutes from "../routes/monitorRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = 5001;
const SERVER_NAME = "SERVER-2";

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);
app.set("serverName", SERVER_NAME);
app.set("serverPort", PORT);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// DATABASE
// ===============================

connectDB();

// ===============================
// ROUTES
// ===============================

app.use("/api/teams", teamRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/monitor", monitorRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    server: SERVER_NAME,
    message: "Coding Hunt Server 2 is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ONLINE",
    server: SERVER_NAME,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.get("/server-info", (req, res) => {
  res.json({
    success: true,
    server: SERVER_NAME,
    port: PORT,
    role: "Game API Instance",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// SOCKET.IO
// ===============================

io.on("connection", (socket) => {
  console.log(`🟢 ${SERVER_NAME}: Client connected - ${socket.id}`);

  socket.emit("server-connected", {
    server: SERVER_NAME,
    port: PORT,
    status: "ONLINE",
  });

  // Team room
  socket.on("join-team", (teamId) => {
    if (!teamId) return;

    socket.join(`team-${teamId}`);

    console.log(
      `👥 ${SERVER_NAME}: Team ${teamId} joined`
    );

    socket.emit("joined-team", {
      teamId,
      server: SERVER_NAME,
    });
  });

  // Game start
  socket.on("admin-start-game", () => {
    console.log(`▶️ ${SERVER_NAME}: Game started`);

    io.emit("game-started", {
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // Game pause
  socket.on("admin-pause-game", () => {
    console.log(`⏸️ ${SERVER_NAME}: Game paused`);

    io.emit("game-paused", {
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // Game reset
  socket.on("admin-reset-game", () => {
    console.log(`🔄 ${SERVER_NAME}: Game reset`);

    io.emit("game-reset", {
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // Game end
  socket.on("admin-end-game", () => {
    console.log(`🛑 ${SERVER_NAME}: Game ended`);

    io.emit("game-ended", {
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // Team update
  socket.on("team-update", (data) => {
    io.emit("team-updated", {
      ...data,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // Admin broadcast
  socket.on("admin-broadcast", (data) => {
    io.emit("admin-broadcast", {
      ...data,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${SERVER_NAME}: Client disconnected - ${socket.id}`);
  });
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    server: SERVER_NAME,
  });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error(`❌ ${SERVER_NAME} Error:`, err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    server: SERVER_NAME,
  });
});

// ===============================
// START SERVER
// ===============================

server.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 ${SERVER_NAME} STARTED`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`❤️  http://localhost:${PORT}/health`);
  console.log(`📊 http://localhost:${PORT}/api/monitor/status`);
  console.log("=================================");
});