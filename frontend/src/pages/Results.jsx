import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Medal,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";

import "./Results.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

const Results = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // =====================================================
  // LOAD INITIAL RESULTS
  // =====================================================

  const loadResults = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/teams`
      );

      const data = await response.json();

      if (data.success) {
        const teamData =
          data.teams ||
          data.data ||
          [];

        setTeams(teamData);
      }
    } catch (error) {
      console.error(
        "RESULTS LOAD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SOCKET.IO LIVE UPDATE
  // =====================================================

  useEffect(() => {
    loadResults();

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(
        "Results Socket Connected:",
        socket.id
      );

      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log(
        "Results Socket Disconnected"
      );

      setSocketConnected(false);
    });

    // ===================================================
    // LIVE TEAM UPDATE
    // ===================================================

    socket.on(
      "team-updated",
      (updatedTeam) => {
        console.log(
          "LIVE TEAM UPDATE:",
          updatedTeam
        );

        setTeams((previousTeams) => {
          const exists =
            previousTeams.some(
              (team) =>
                String(team.teamId).toUpperCase() ===
                String(updatedTeam.teamId).toUpperCase()
            );

          // ---------------------------------------------
          // NEW TEAM
          // ---------------------------------------------

          if (!exists) {
            return [
              ...previousTeams,
              updatedTeam,
            ];
          }

          // ---------------------------------------------
          // UPDATE EXISTING TEAM
          // ---------------------------------------------

          return previousTeams.map(
            (team) => {
              if (
                String(team.teamId).toUpperCase() ===
                String(updatedTeam.teamId).toUpperCase()
              ) {
                return {
                  ...team,
                  ...updatedTeam,
                };
              }

              return team;
            }
          );
        });

        // -----------------------------------------------
        // UPDATE OPEN DETAILS MODAL
        // -----------------------------------------------

        setSelectedTeam(
          (currentTeam) => {
            if (
              !currentTeam ||
              String(
                currentTeam.teamId
              ).toUpperCase() !==
                String(
                  updatedTeam.teamId
                ).toUpperCase()
            ) {
              return currentTeam;
            }

            return {
              ...currentTeam,
              ...updatedTeam,
            };
          }
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // =====================================================
  // FILTER + RANK
  // =====================================================

  const filteredTeams = useMemo(() => {
    return [...teams]
      .filter((team) => {
        const text =
          `${team.teamId || ""} ${
            team.teamName || ""
          } ${team.college || ""}`.toLowerCase();

        const matchesSearch =
          text.includes(
            search.toLowerCase()
          );

        const matchesStatus =
          statusFilter === "All" ||
          team.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      })
      .sort(
        (a, b) =>
          Number(b.score || 0) -
          Number(a.score || 0)
      )
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));
  }, [
    teams,
    search,
    statusFilter,
  ]);

  // =====================================================
  // TOP 3
  // =====================================================

  const topThree = useMemo(() => {
    return [...teams]
      .sort(
        (a, b) =>
          Number(b.score || 0) -
          Number(a.score || 0)
      )
      .slice(0, 3);
  }, [teams]);

  // =====================================================
  // STATS
  // =====================================================

  const totalTeams =
    teams.length;

  const activeTeams =
    teams.filter(
      (team) =>
        team.status === "Active"
    ).length;

  const completedTeams =
    teams.filter(
      (team) =>
        team.status === "Completed"
    ).length;

  const eliminatedTeams =
    teams.filter(
      (team) =>
        team.status === "Eliminated"
    ).length;

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "adminLoggedIn"
    );

    navigate("/admin");
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (seconds) => {
    if (!seconds) {
      return "—";
    }

    const value =
      Number(seconds);

    if (Number.isNaN(value)) {
      return seconds;
    }

    const hours =
      Math.floor(value / 3600);

    const minutes =
      Math.floor(
        (value % 3600) / 60
      );

    const secs =
      Math.floor(value % 60);

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="results-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="admin-navbar">

        <div className="admin-nav-left">

          <button
            className="admin-back-btn"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div className="admin-nav-brand">
            <Trophy size={20} />
            <span>
              CODING HUNT
            </span>
          </div>

        </div>

        <div className="admin-nav-right">

          <div
            className={`socket-status ${
              socketConnected
                ? "connected"
                : "disconnected"
            }`}
          >
            {socketConnected ? (
              <>
                <Wifi size={15} />
                LIVE
              </>
            ) : (
              <>
                <WifiOff size={15} />
                OFFLINE
              </>
            )}
          </div>

          <button
            className="admin-logout"
            onClick={logout}
          >
            LOGOUT
          </button>

        </div>

      </nav>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="results-container">

        <div className="results-header">

          <div>

            <div className="results-kicker">
              <TrendingUp size={15} />
              LIVE LEADERBOARD
            </div>

            <h1>
              Hunt Results
            </h1>

            <p>
              Real-time team performance
              and rankings
            </p>

          </div>

          <button
            className="refresh-btn"
            onClick={loadResults}
          >
            <RefreshCw
              size={16}
            />
            REFRESH
          </button>

        </div>

        {/* =================================================
            LIVE STATUS
        ================================================= */}

        <div
          className={`live-banner ${
            socketConnected
              ? "live"
              : "offline"
          }`}
        >
          {socketConnected ? (
            <>
              <span className="live-dot" />
              LIVE UPDATES ACTIVE —
              Results automatically update
              when a team answers a question.
            </>
          ) : (
            <>
              <WifiOff size={16} />
              Live connection unavailable.
            </>
          )}
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="results-stats">

          <div className="result-stat-card">
            <Users size={20} />
            <div>
              <span>
                TOTAL TEAMS
              </span>
              <strong>
                {totalTeams}
              </strong>
            </div>
          </div>

          <div className="result-stat-card">
            <TrendingUp size={20} />
            <div>
              <span>
                ACTIVE
              </span>
              <strong>
                {activeTeams}
              </strong>
            </div>
          </div>

          <div className="result-stat-card">
            <CheckCircle size={20} />
            <div>
              <span>
                COMPLETED
              </span>
              <strong>
                {completedTeams}
              </strong>
            </div>
          </div>

          <div className="result-stat-card">
            <ShieldAlert size={20} />
            <div>
              <span>
                ELIMINATED
              </span>
              <strong>
                {eliminatedTeams}
              </strong>
            </div>
          </div>

        </div>

        {/* =================================================
            TOP 3
        ================================================= */}

        {topThree.length > 0 && (
          <section className="podium-section">

            <div className="section-title">
              <Medal size={18} />
              TOP TEAMS
            </div>

            <div className="podium-grid">

              {topThree.map(
                (team, index) => (
                  <div
                    key={
                      team.teamId ||
                      index
                    }
                    className={`podium-card podium-${index + 1}`}
                  >

                    <div className="podium-rank">
                      #{index + 1}
                    </div>

                    <div className="podium-icon">
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : "🥉"}
                    </div>

                    <h3>
                      {team.teamName ||
                        team.teamId}
                    </h3>

                    <span>
                      {team.teamId}
                    </span>

                    <strong>
                      {team.score || 0}
                      <small>
                        POINTS
                      </small>
                    </strong>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="results-toolbar">

          <div className="search-box">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search team..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="status-filters">

            {[
              "All",
              "Active",
              "Completed",
              "Eliminated",
            ].map((status) => (
              <button
                key={status}
                className={
                  statusFilter ===
                  status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(
                    status
                  )
                }
              >
                {status}
              </button>
            ))}

          </div>

        </div>

        {/* =================================================
            RESULTS TABLE
        ================================================= */}

        <section className="results-table-section">

          <div className="section-title">
            <Trophy size={18} />
            LIVE RESULTS
          </div>

          {loading ? (
            <div className="results-empty">
              Loading results...
            </div>
          ) : filteredTeams.length ===
            0 ? (
            <div className="results-empty">
              No teams found.
            </div>
          ) : (
            <div className="results-table-wrapper">

              <table className="results-table">

                <thead>
                  <tr>
                    <th>
                      RANK
                    </th>
                    <th>
                      TEAM
                    </th>
                    <th>
                      SCORE
                    </th>
                    <th>
                      CORRECT
                    </th>
                    <th>
                      WRONG
                    </th>
                    <th>
                      LIVES
                    </th>
                    <th>
                      ROUND
                    </th>
                    <th>
                      TIME
                    </th>
                    <th>
                      STATUS
                    </th>
                    <th>
                      VIEW
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTeams.map(
                    (team) => {

                      const correct =
                        Number(
                          team.correct ||
                            team.correctAnswers ||
                            0
                        );

                      const wrong =
                        Number(
                          team.wrong ||
                            team.wrongAnswers ||
                            0
                        );

                      return (
                        <tr
                          key={
                            team.teamId
                          }
                        >

                          <td>
                            <span className="rank-number">
                              #
                              {team.rank}
                            </span>
                          </td>

                          <td>
                            <div className="team-cell">

                              <strong>
                                {team.teamName ||
                                  team.teamId}
                              </strong>

                              <small>
                                {
                                  team.teamId
                                }
                              </small>

                            </div>
                          </td>

                          <td>
                            <strong className="score-value">
                              {team.score ||
                                0}
                            </strong>
                          </td>

                          <td>
                            <span className="correct-value">
                              <CheckCircle
                                size={14}
                              />
                              {correct}
                            </span>
                          </td>

                          <td>
                            <span className="wrong-value">
                              <XCircle
                                size={14}
                              />
                              {wrong}
                            </span>
                          </td>

                          <td>
                            <span className="lives-value">
                              {"❤️".repeat(
                                Math.max(
                                  0,
                                  Number(
                                    team.lives ??
                                      0
                                  )
                                )
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="round-value">
                              {team.round ||
                                1}
                              /10
                            </span>
                          </td>

                          <td>
                            <span className="time-value">
                              <Clock
                                size={14}
                              />
                              {formatTime(
                                team.time
                              )}
                            </span>
                          </td>

                          <td>

                            <span
                              className={`status-badge status-${String(
                                team.status ||
                                  "Active"
                              ).toLowerCase()}`}
                            >
                              {
                                team.status ||
                                "Active"
                              }
                            </span>

                          </td>

                          <td>

                            <button
                              className="view-team-btn"
                              onClick={() =>
                                setSelectedTeam(
                                  team
                                )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* =================================================
          TEAM DETAILS MODAL
      ================================================= */}

      {selectedTeam && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedTeam(null)
          }
        >

          <div
            className="team-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span>
                  TEAM DETAILS
                </span>

                <h2>
                  {selectedTeam.teamName ||
                    selectedTeam.teamId}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedTeam(null)
                }
              >
                ×
              </button>

            </div>

            <div className="team-details-grid">

              <div>
                <span>
                  TEAM ID
                </span>
                <strong>
                  {selectedTeam.teamId}
                </strong>
              </div>

              <div>
                <span>
                  COLLEGE
                </span>
                <strong>
                  {selectedTeam.college ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  SCORE
                </span>
                <strong>
                  {selectedTeam.score ||
                    0}
                </strong>
              </div>

              <div>
                <span>
                  LIVES
                </span>
                <strong>
                  {selectedTeam.lives ??
                    0}
                </strong>
              </div>

              <div>
                <span>
                  ROUND
                </span>
                <strong>
                  {selectedTeam.round ||
                    1}
                  /10
                </strong>
              </div>

              <div>
                <span>
                  STATUS
                </span>
                <strong>
                  {selectedTeam.status ||
                    "Active"}
                </strong>
              </div>

            </div>

            <div className="modal-live-note">
              <span className="live-dot" />
              Details update automatically
              when this team submits an
              answer.
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Results;