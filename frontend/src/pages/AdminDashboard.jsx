import {
  Users,
  HelpCircle,
  Target,
  Trophy,
  Server,
  Play,
  Pause,
  Settings,
  LogOut,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  RotateCcw,
  Square,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// ==================================================
// CONFIG
// ==================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

// ==================================================
// SERVER CONFIG
// ==================================================

const SERVER_CONFIG = [
  {
    id: 1,
    name: "SERVER-1",
    url: "http://localhost:5000",
  },
  {
    id: 2,
    name: "SERVER-2",
    url: "http://localhost:5001",
  },
  {
    id: 3,
    name: "SERVER-3",
    url: "http://localhost:5002",
  },
  {
    id: 4,
    name: "SERVER-4",
    url: "http://localhost:5003",
  },
];

// ==================================================
// COMPONENT
// ==================================================

function AdminDashboard() {
  const navigate = useNavigate();

  const socketRef = useRef(null);

  // ==================================================
  // GAME STATE
  // ==================================================

  const [gameStatus, setGameStatus] =
    useState("READY");

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [operationLoading, setOperationLoading] =
    useState(false);

  // ==================================================
  // SERVER MONITOR STATE
  // ==================================================

  const [servers, setServers] = useState(
    SERVER_CONFIG.map((server) => ({
      ...server,
      status: "CHECKING",
      health: "Checking...",
      load: 0,
      responseTime: null,
      uptime: "--",
      memory: "--",
      port: server.url.split(":").pop(),
    }))
  );

  // ==================================================
  // CHECK ALL SERVERS
  // ==================================================

  const checkServers = async () => {
    const results = await Promise.all(
      SERVER_CONFIG.map(async (serverItem) => {
        const startTime = Date.now();

        try {
          const response = await fetch(
            `${serverItem.url}/api/monitor/status`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          const responseTime =
            Date.now() - startTime;

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const data = await response.json();

          const serverData =
            data?.server || {};

          const loadValue = parseInt(
            String(
              serverData.load || "0"
            ).replace("%", ""),
            10
          );

          const memoryUsage = parseInt(
            String(
              serverData.memory?.usage || "0"
            ).replace("%", ""),
            10
          );

          return {
            ...serverItem,

            name:
              serverData.name ||
              serverItem.name,

            port:
              serverData.port ||
              serverItem.url.split(":").pop(),

            status:
              serverData.status === "ONLINE"
                ? "ONLINE"
                : "OFFLINE",

            health:
              serverData.health ||
              "Healthy",

            load: Number.isNaN(loadValue)
              ? 0
              : loadValue,

            responseTime,

            uptime:
              serverData.uptime || "--",

            memory:
              Number.isNaN(memoryUsage)
                ? "--"
                : `${memoryUsage}%`,
          };
        } catch (error) {
          console.error(
            `${serverItem.name} monitor error:`,
            error
          );

          return {
            ...serverItem,

            status: "OFFLINE",

            health: "Unhealthy",

            load: 0,

            responseTime: null,

            uptime: "--",

            memory: "--",

            port:
              serverItem.url.split(":").pop(),
          };
        }
      })
    );

    setServers(results);
  };

  // ==================================================
  // LIVE SERVER MONITOR
  // ==================================================

  useEffect(() => {
    checkServers();

    const interval = setInterval(() => {
      checkServers();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // SOCKET CONNECTION
  // ==================================================

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: [
        "websocket",
        "polling",
      ],
    });

    socketRef.current = socket;

    // CONNECT
    socket.on("connect", () => {
      console.log(
        "Admin connected:",
        socket.id
      );

      setSocketConnected(true);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(
        "Admin socket disconnected"
      );

      setSocketConnected(false);
    });

    // GAME STATE
    socket.on(
      "game-state",
      (game) => {
        console.log(
          "Current game state:",
          game
        );

        if (game?.status) {
          setGameStatus(game.status);
        }
      }
    );

    // GAME STARTED
    socket.on(
      "game-started",
      (data) => {
        console.log(
          "GAME STARTED:",
          data
        );

        setGameStatus("RUNNING");
        setOperationLoading(false);
      }
    );

    // GAME PAUSED
    socket.on(
      "game-paused",
      (data) => {
        console.log(
          "GAME PAUSED:",
          data
        );

        setGameStatus("PAUSED");
        setOperationLoading(false);
      }
    );

    // GAME RESET
    socket.on(
      "game-reset",
      (data) => {
        console.log(
          "GAME RESET:",
          data
        );

        setGameStatus("READY");
        setOperationLoading(false);
      }
    );

    // GAME ENDED
    socket.on(
      "game-ended",
      (data) => {
        console.log(
          "GAME ENDED:",
          data
        );

        setGameStatus("ENDED");
        setOperationLoading(false);
      }
    );

    // OPERATION ERROR
    socket.on(
      "game-operation-error",
      (data) => {
        console.error(
          "GAME OPERATION ERROR:",
          data
        );

        alert(
          data?.message ||
            "Game operation failed."
        );

        setOperationLoading(false);
      }
    );

    // CLEANUP
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ==================================================
  // START GAME
  // ==================================================

  const handleStartGame = () => {
    if (!socketConnected) {
      alert(
        "Game server connected nahi hai."
      );
      return;
    }

    if (gameStatus === "RUNNING") {
      return;
    }

    setOperationLoading(true);

    socketRef.current.emit(
      "admin-start-game"
    );
  };

  // ==================================================
  // PAUSE GAME
  // ==================================================

  const handlePauseGame = () => {
    if (!socketConnected) {
      alert(
        "Game server connected nahi hai."
      );
      return;
    }

    if (gameStatus !== "RUNNING") {
      return;
    }

    setOperationLoading(true);

    socketRef.current.emit(
      "admin-pause-game"
    );
  };

  // ==================================================
  // RESET GAME
  // ==================================================

  const handleResetGame = () => {
    if (!socketConnected) {
      alert(
        "Game server connected nahi hai."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to reset the game?"
      );

    if (!confirmed) {
      return;
    }

    setOperationLoading(true);

    socketRef.current.emit(
      "admin-reset-game"
    );
  };

  // ==================================================
  // END GAME
  // ==================================================

  const handleEndGame = () => {
    if (!socketConnected) {
      alert(
        "Game server connected nahi hai."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to END the Coding Hunt?"
      );

    if (!confirmed) {
      return;
    }

    setOperationLoading(true);

    socketRef.current.emit(
      "admin-end-game"
    );
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    localStorage.removeItem(
      "adminLoggedIn"
    );

    navigate("/admin");
  };

  // ==================================================
  // STATUS HELPERS
  // ==================================================

  const isRunning =
    gameStatus === "RUNNING";

  const isPaused =
    gameStatus === "PAUSED";

  const isEnded =
    gameStatus === "ENDED";

  const getStatusText = () => {
    if (isRunning) {
      return "GAME RUNNING";
    }

    if (isPaused) {
      return "GAME PAUSED";
    }

    if (isEnded) {
      return "GAME ENDED";
    }

    return "GAME READY";
  };

  // ==================================================
  // ONLINE SERVERS
  // ==================================================

  const onlineServers =
    servers.filter(
      (serverItem) =>
        serverItem.status === "ONLINE"
    ).length;

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="admin-dashboard">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="admin-navbar">

        <div className="admin-nav-brand">

          <div className="admin-nav-icon">
            <Target size={22} />
          </div>

          <div>
            <h2>
              CODING <span>HUNT</span>
            </h2>

            <p>
              ADMIN CONTROL CENTER
            </p>
          </div>

        </div>

        <div className="admin-nav-right">

          <div className="admin-live">

            <Activity size={14} />

            {socketConnected
              ? "SYSTEM ONLINE"
              : "SERVER OFFLINE"}

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </nav>

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="admin-header">

        <div>

          <p className="admin-label">
            ADMINISTRATION
          </p>

          <h1>
            Hunt Control Center
          </h1>

          <p>
            Manage teams, rounds,
            questions and the live game.
          </p>

        </div>

        <div className="game-control">

          <div>

            <span
              className={`control-status ${
                isRunning ? "active" : ""
              }`}
            />

            {getStatusText()}

          </div>

          {isRunning ? (
            <button
              onClick={handlePauseGame}
              disabled={
                !socketConnected ||
                operationLoading
              }
            >
              <Pause size={15} />

              {operationLoading
                ? "PROCESSING..."
                : "PAUSE GAME"}
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              disabled={
                !socketConnected ||
                operationLoading ||
                isEnded
              }
            >
              <Play size={15} />

              {operationLoading
                ? "STARTING..."
                : "START GAME"}
            </button>
          )}

        </div>

      </section>

      {/* ==================================================
          STATS
      ================================================== */}

      <section className="admin-stats">

        <div className="admin-stat">

          <div className="admin-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <p>TOTAL TEAMS</p>
            <h2>50</h2>
            <small>REGISTERED</small>
          </div>

        </div>

        <div className="admin-stat">

          <div className="admin-stat-icon">
            <HelpCircle size={22} />
          </div>

          <div>
            <p>QUESTIONS</p>
            <h2>0</h2>
            <small>ADDED</small>
          </div>

        </div>

        <div className="admin-stat">

          <div className="admin-stat-icon">
            <Target size={22} />
          </div>

          <div>
            <p>ROUNDS</p>
            <h2>10</h2>
            <small>CONFIGURED</small>
          </div>

        </div>

        <div className="admin-stat">

          <div className="admin-stat-icon">
            <Server size={22} />
          </div>

          <div>
            <p>SERVERS</p>

            <h2>
              {onlineServers}/4
            </h2>

            <small>ONLINE</small>
          </div>

        </div>

      </section>

      {/* ==================================================
          MANAGEMENT
      ================================================== */}

      <section className="management-section">

        <div className="section-title">

          <div>

            <p className="admin-label">
              MANAGEMENT
            </p>

            <h2>
              Hunt Configuration
            </h2>

          </div>

        </div>

        <div className="management-grid">

          {/* TEAMS */}

          <div className="management-card">

            <div className="management-icon">
              <Users size={25} />
            </div>

            <div>
              <h3>
                Team Management
              </h3>

              <p>
                Create, edit, disable and
                manage all participating teams.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/teams")
              }
            >
              <Plus size={15} />
              MANAGE TEAMS
            </button>

          </div>

          {/* QUESTIONS */}

          <div className="management-card">

            <div className="management-icon">
              <HelpCircle size={25} />
            </div>

            <div>
              <h3>
                Question Management
              </h3>

              <p>
                Add, edit or delete questions
                for any of the 10 rounds.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/questions")
              }
            >
              <Plus size={15} />
              MANAGE QUESTIONS
            </button>

          </div>

          {/* ROUNDS */}

          <div className="management-card">

            <div className="management-icon">
              <Target size={25} />
            </div>

            <div>
              <h3>
                Round Management
              </h3>

              <p>
                Configure all 10 rounds,
                timers, marks and unlock rules.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/rounds")
              }
            >
              <Settings size={15} />
              MANAGE ROUNDS
            </button>

          </div>

          {/* RESULTS */}

          <div className="management-card">

            <div className="management-icon">
              <Trophy size={25} />
            </div>

            <div>
              <h3>
                Results & Leaderboard
              </h3>

              <p>
                Monitor scores, progress and
                live rankings of all teams.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/results")
              }
            >
              VIEW RESULTS
            </button>

          </div>

        </div>

      </section>

      {/* ==================================================
          LIVE CONTROL
      ================================================== */}

      <section className="live-control">

        <div className="live-control-header">

          <div>

            <p className="admin-label">
              LIVE CONTROL
            </p>

            <h2>
              Game Operations
            </h2>

          </div>

          <div className="server-status">

            <Server size={16} />

            {onlineServers} / 4 SERVERS ONLINE

          </div>

        </div>

        <div className="operation-grid">

          {/* START / PAUSE */}

          <div
            className={`operation operation-clickable ${
              isRunning
                ? "operation-active"
                : ""
            }`}
            onClick={
              isRunning
                ? handlePauseGame
                : handleStartGame
            }
          >

            {isRunning ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}

            <div>

              <strong>
                {isRunning
                  ? "Pause Game"
                  : "Start Game"}
              </strong>

              <small>
                {isRunning
                  ? "Temporarily stop all teams"
                  : "Launch the hunt for all teams"}
              </small>

            </div>

          </div>

          {/* ROUND TIMER */}

          <div
            className="operation operation-clickable"
            onClick={() =>
              navigate("/admin/rounds")
            }
          >

            <Clock size={20} />

            <div>

              <strong>
                Round Timer
              </strong>

              <small>
                Configure time limits
              </small>

            </div>

          </div>

          {/* GAME STATUS */}

          <div className="operation">

            <CheckCircle size={20} />

            <div>

              <strong>
                Game Status
              </strong>

              <small>
                {getStatusText()}
              </small>

            </div>

          </div>

          {/* SERVER STATUS */}

          <div className="operation">

            <Server size={20} />

            <div>

              <strong>
                Server Status
              </strong>

              <small>
                {onlineServers}/4 Online
              </small>

            </div>

          </div>

          {/* RESET */}

          <div
            className="operation operation-clickable"
            onClick={handleResetGame}
          >

            <RotateCcw size={20} />

            <div>

              <strong>
                Reset Game
              </strong>

              <small>
                Return hunt to READY state
              </small>

            </div>

          </div>

          {/* END */}

          <div
            className="operation operation-danger operation-clickable"
            onClick={handleEndGame}
          >

            <Square size={20} />

            <div>

              <strong>
                End Game
              </strong>

              <small>
                Permanently stop the hunt
              </small>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SERVER MONITOR
      ================================================== */}

      <section className="server-section">

        <div className="section-title">

          <div>

            <p className="admin-label">
              INFRASTRUCTURE
            </p>

            <h2>
              Server Monitor
            </h2>

          </div>

          <div className="server-status">

            <Server size={16} />

            {onlineServers}/4 ONLINE

          </div>

        </div>

        <div className="server-grid">

          {servers.map((serverItem) => {

            const isOnline =
              serverItem.status === "ONLINE";

            return (
              <div
                className={`server-card ${
                  isOnline
                    ? "server-online"
                    : serverItem.status === "OFFLINE"
                    ? "server-offline"
                    : "server-checking"
                }`}
                key={serverItem.id}
              >

                {/* SERVER TOP */}

                <div className="server-top">

                  <div>

                    <Server size={18} />

                    <strong>
                      {serverItem.name}
                    </strong>

                  </div>

                  <span
                    className={
                      isOnline
                        ? "status-online"
                        : serverItem.status ===
                          "OFFLINE"
                        ? "status-offline"
                        : "status-checking"
                    }
                  >

                    <span className="status-dot" />

                    {serverItem.status}

                  </span>

                </div>

                {/* LOAD / HEALTH */}

                <div className="server-load">

                  <div>

                    <small>
                      HEALTH
                    </small>

                    <strong>
                      {serverItem.health}
                    </strong>

                  </div>

                  <div>

                    <small>
                      CPU LOAD
                    </small>

                    <strong>
                      {serverItem.load}%
                    </strong>

                  </div>

                </div>

                {/* LOAD BAR */}

                <div className="server-bar">

                  <div
                    style={{
                      width: `${serverItem.load}%`,
                    }}
                  />

                </div>

                {/* SERVER INFO */}

                <div className="server-info-grid">

                  <div>

                    <small>
                      PORT
                    </small>

                    <strong>
                      {serverItem.port}
                    </strong>

                  </div>

                  <div>

                    <small>
                      MEMORY
                    </small>

                    <strong>
                      {serverItem.memory}
                    </strong>

                  </div>

                </div>

                {/* RESPONSE */}

                <div className="server-card-footer">

                  <span>
                    RESPONSE
                  </span>

                  <strong>
                    {serverItem.responseTime !==
                    null
                      ? `${serverItem.responseTime} ms`
                      : "--"}
                  </strong>

                </div>

                {/* UPTIME */}

                <div className="server-card-footer">

                  <span>
                    UPTIME
                  </span>

                  <strong>
                    {serverItem.uptime}
                  </strong>

                </div>

                {/* ENDPOINT */}

                <div className="server-card-footer">

                  <span>
                    ENDPOINT
                  </span>

                  <strong>
                    {serverItem.url.replace(
                      "http://",
                      ""
                    )}
                  </strong>

                </div>

              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;