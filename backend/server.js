
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import teamRoutes from "./routes/teamRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import monitorRoutes from "./routes/monitorRoutes.js";

dotenv.config();

// ==================================================
// CONFIG
// ==================================================

const PORT = Number(process.env.PORT) || 5000;

const CLIENT_URLS = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const SERVER_NAME = "SERVER-1";

// ==================================================
// APP AND HTTP SERVER
// ==================================================

const app = express();
const httpServer = http.createServer(app);

// ==================================================
// SOCKET.IO
// ==================================================

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URLS,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);
app.set("serverName", SERVER_NAME);
app.set("serverPort", PORT);

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
  cors({
    origin: CLIENT_URLS,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ==================================================
// HEALTH CHECK ROUTES
// ==================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CODING HUNT SERVER RUNNING",
    server: SERVER_NAME,
    port: PORT,
    status: "ONLINE",
    timestamp: new Date().toISOString(),
  });
});

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coding Hunt API running",
    server: SERVER_NAME,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: SERVER_NAME,
    status: "ONLINE",
    timestamp: new Date().toISOString(),
  });
});

app.get("/server-info", (req, res) => {
  res.status(200).json({
    success: true,
    server: SERVER_NAME,
    port: PORT,
    status: "ONLINE",
    socket: "ACTIVE",
    timestamp: new Date().toISOString(),
  });
});

// ==================================================
// API ROUTES
// ==================================================

app.use("/api/teams", teamRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/monitor", monitorRoutes);

// ==================================================
// SOCKET.IO CONNECTION
// ==================================================

let gameStatus = "READY";

io.on("connection", (socket) => {
  console.log(
    `[${SERVER_NAME}] Client connected: ${socket.id}`
  );

  // Send current game status to newly connected clients
  socket.emit("game-state", {
    status: gameStatus,
    server: SERVER_NAME,
  });

  // JOIN TEAM
  socket.on("join-team", (teamId) => {
    if (!teamId) return;

    socket.join(`team-${teamId}`);

    console.log(
      `[${SERVER_NAME}] Team ${teamId} joined`
    );
  });

  // ADMIN START GAME
  socket.on("admin-start-game", () => {
    gameStatus = "RUNNING";

    io.emit("game-started", {
      started: true,
      status: gameStatus,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });

    io.emit("game-state", {
      status: gameStatus,
      server: SERVER_NAME,
    });

    console.log(`[${SERVER_NAME}] GAME STARTED`);
  });

  // ADMIN PAUSE GAME
  socket.on("admin-pause-game", () => {
    if (gameStatus !== "RUNNING") return;

    gameStatus = "PAUSED";

    io.emit("game-paused", {
      paused: true,
      status: gameStatus,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });

    io.emit("game-state", {
      status: gameStatus,
      server: SERVER_NAME,
    });

    console.log(`[${SERVER_NAME}] GAME PAUSED`);
  });

  // ADMIN RESET GAME
  socket.on("admin-reset-game", () => {
    gameStatus = "READY";

    io.emit("game-reset", {
      reset: true,
      status: gameStatus,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });

    io.emit("game-state", {
      status: gameStatus,
      server: SERVER_NAME,
    });

    console.log(`[${SERVER_NAME}] GAME RESET`);
  });

  // ADMIN END GAME
  socket.on("admin-end-game", () => {
    gameStatus = "ENDED";

    io.emit("game-ended", {
      ended: true,
      status: gameStatus,
      server: SERVER_NAME,
      timestamp: new Date().toISOString(),
    });

    io.emit("game-state", {
      status: gameStatus,
      server: SERVER_NAME,
    });

    console.log(`[${SERVER_NAME}] GAME ENDED`);
  });

  // TEAM UPDATE
  socket.on("team-update", (data) => {
    if (!data) return;

    io.emit("team-updated", data);
  });

  // ADMIN BROADCAST
  socket.on("admin-broadcast", (data) => {
    if (!data) return;

    io.emit("admin-message", data);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(
      `[${SERVER_NAME}] Client disconnected: ${socket.id}`
    );
  });
});

// ==================================================
// 404 HANDLER
// ==================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    server: SERVER_NAME,
    path: req.originalUrl,
  });
});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {
  console.error(`[${SERVER_NAME}] SERVER ERROR:`, err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    server: SERVER_NAME,
  });
});

// ==================================================
// CONNECT DATABASE AND START SERVER
// ==================================================

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log(`CODING HUNT ${SERVER_NAME}`);
      console.log(`Port: ${PORT}`);
      console.log(`Health: /health`);
      console.log(`Test: /test`);
      console.log(`Monitor: /api/monitor/status`);
      console.log("Status: ONLINE");
      console.log("========================================");
    });
  } catch (error) {
    console.error("Failed to start Coding Hunt:", error);
    process.exit(1);
  }
}

startServer();
