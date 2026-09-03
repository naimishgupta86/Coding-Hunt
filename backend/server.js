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

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

const SERVER_CONFIG = [
  {
    name: "SERVER-1",
    port: 5000,
  },
  {
    name: "SERVER-2",
    port: 5001,
  },
  {
    name: "SERVER-3",
    port: 5002,
  },
  {
    name: "SERVER-4",
    port: 5003,
  },
];

// ==================================================
// CREATE SERVER
// ==================================================

const createServer = (serverName, port) => {
  const app = express();

  const server = http.createServer(app);

  // ------------------------------------------------
  // SERVER INFORMATION
  // ------------------------------------------------

  app.set("serverName", serverName);
  app.set("serverPort", port);

  // ==================================================
  // SOCKET.IO
  // ==================================================

  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  app.set("io", io);

  // ==================================================
  // MIDDLEWARE
  // ==================================================

  app.use(
    cors({
      origin: CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  app.use(express.json());

  // ==================================================
  // API ROUTES
  // ==================================================

  app.use("/api/teams", teamRoutes);

  app.use("/api/questions", questionRoutes);

  app.use("/api/game", gameRoutes);

  app.use("/api/monitor", monitorRoutes);

  // ==================================================
  // ROOT
  // ==================================================

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "CODING HUNT SERVER RUNNING",
      server: serverName,
      port,
      status: "ONLINE",
      timestamp: new Date().toISOString(),
    });
  });

  // ==================================================
  // HEALTH CHECK
  // ==================================================

  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      server: serverName,
      port,
      status: "ONLINE",
      timestamp: new Date().toISOString(),
    });
  });

  // ==================================================
  // SERVER INFO
  // ==================================================

  app.get("/server-info", (req, res) => {
    res.status(200).json({
      success: true,
      server: serverName,
      port,
      status: "ONLINE",
      socket: "ACTIVE",
      timestamp: new Date().toISOString(),
    });
  });

  // ==================================================
  // SOCKET CONNECTION
  // ==================================================

  io.on("connection", (socket) => {
    console.log(
      `[${serverName}] Client connected: ${socket.id}`
    );

    // ------------------------------------------------
    // JOIN TEAM
    // ------------------------------------------------

    socket.on("join-team", (teamId) => {
      if (!teamId) return;

      const roomName = `team-${teamId}`;

      socket.join(roomName);

      console.log(
        `[${serverName}] Team ${teamId} joined`
      );
    });

    // ------------------------------------------------
    // ADMIN START GAME
    // ------------------------------------------------

    socket.on("admin-start-game", () => {
      console.log(
        `[${serverName}] ADMIN STARTED GAME`
      );

      io.emit("game-started", {
        started: true,
        server: serverName,
        timestamp: new Date(),
      });

      console.log(
        `[${serverName}] GAME START SIGNAL SENT`
      );
    });

    // ------------------------------------------------
    // ADMIN PAUSE GAME
    // ------------------------------------------------

    socket.on("admin-pause-game", () => {
      console.log(
        `[${serverName}] ADMIN PAUSED GAME`
      );

      io.emit("game-paused", {
        paused: true,
        server: serverName,
        timestamp: new Date(),
      });

      console.log(
        `[${serverName}] GAME PAUSE SIGNAL SENT`
      );
    });

    // ------------------------------------------------
    // ADMIN RESET GAME
    // ------------------------------------------------

    socket.on("admin-reset-game", () => {
      console.log(
        `[${serverName}] ADMIN RESET GAME`
      );

      io.emit("game-reset", {
        reset: true,
        server: serverName,
        timestamp: new Date(),
      });

      console.log(
        `[${serverName}] GAME RESET SIGNAL SENT`
      );
    });

    // ------------------------------------------------
    // ADMIN END GAME
    // ------------------------------------------------

    socket.on("admin-end-game", () => {
      console.log(
        `[${serverName}] ADMIN ENDED GAME`
      );

      io.emit("game-ended", {
        ended: true,
        server: serverName,
        timestamp: new Date(),
      });

      console.log(
        `[${serverName}] GAME END SIGNAL SENT`
      );
    });

    // ------------------------------------------------
    // TEAM UPDATE
    // ------------------------------------------------

    socket.on("team-update", (data) => {
      if (!data) return;

      io.emit("team-updated", data);

      console.log(
        `[${serverName}] TEAM UPDATE SENT`
      );
    });

    // ------------------------------------------------
    // ADMIN BROADCAST
    // ------------------------------------------------

    socket.on("admin-broadcast", (data) => {
      if (!data) return;

      io.emit("admin-message", data);
    });

    // ------------------------------------------------
    // DISCONNECT
    // ------------------------------------------------

    socket.on("disconnect", () => {
      console.log(
        `[${serverName}] Client disconnected: ${socket.id}`
      );
    });
  });

  // ==================================================
  // 404
  // ==================================================

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "API route not found",
      server: serverName,
      path: req.originalUrl,
    });
  });

  // ==================================================
  // ERROR HANDLER
  // ==================================================

  app.use((err, req, res, next) => {
    console.error(
      `[${serverName}] SERVER ERROR:`,
      err
    );

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      server: serverName,
    });
  });

  // ==================================================
  // START SERVER
  // ==================================================

  server.listen(port, () => {
    console.log("");
    console.log("========================================");
    console.log(`       CODING HUNT ${serverName}`);
    console.log("========================================");
    console.log(`Server  : http://localhost:${port}`);
    console.log(`Health  : http://localhost:${port}/health`);
    console.log(
      `Monitor : http://localhost:${port}/api/monitor/status`
    );
    console.log("Status  : ONLINE");
    console.log("========================================");
    console.log("");
  });

  return server;
};

// ==================================================
// DATABASE
// ==================================================

connectDB();

// ==================================================
// START ALL 4 SERVERS
// ==================================================

SERVER_CONFIG.forEach(({ name, port }) => {
  createServer(name, port);
});