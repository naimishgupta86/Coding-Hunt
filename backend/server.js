import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import teamRoutes from "./routes/teamRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();

const server =
  http.createServer(app);


// ========================================
// SOCKET.IO
// ========================================

const io = new Server(
  server,
  {
    cors: {
      origin:
        process.env.CLIENT_URL ||
        "http://localhost:5173",

      methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ],
    },
  }
);
app.set("io", io);

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(
  express.json()
);


// ========================================
// DATABASE
// ========================================

connectDB();


// ========================================
// API ROUTES
// ========================================

app.use(
  "/api/teams",
  teamRoutes
);

app.use(
  "/api/questions",
  questionRoutes
);

app.use(
  "/api/game",
  gameRoutes
);


// ========================================
// HEALTH CHECK
// ========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "CODING HUNT SERVER RUNNING",
      server:
        process.env.SERVER_NAME ||
        "SERVER-1",
    });
  }
);


// ========================================
// SOCKET EVENTS
// ========================================

io.on(
  "connection",
  (socket) => {

    console.log(
      "Player connected:",
      socket.id
    );


    socket.on(
      "join-team",
      (teamId) => {

        socket.join(
          `team-${teamId}`
        );

        console.log(
          `Team ${teamId} joined`
        );

      }
    );


    socket.on(
      "team-update",
      (data) => {

        io.emit(
          "team-updated",
          data
        );

      }
    );


    socket.on(
      "admin-broadcast",
      (data) => {

        io.emit(
          "admin-message",
          data
        );

      }
    );


    socket.on(
      "disconnect",
      () => {

        console.log(
          "Player disconnected:",
          socket.id
        );

      }
    );

  }
);


// ========================================
// SERVER
// ========================================

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {

    console.log(
      `CODING HUNT SERVER running on port ${PORT}`
    );

  }
);