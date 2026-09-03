import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Shield,
  Trophy,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  MapPin,
  LogOut,
  AlertTriangle,
  Code2,
  Users,
  Zap,
} from "lucide-react";

import { io } from "socket.io-client";

import "./PlayGame.css";

import { startAntiCheat } from "../utils/anticheat";

// ======================================================
// API
// ======================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

// ======================================================
// TOTAL GAME TIME
// ======================================================

const DEFAULT_TOTAL_GAME_TIME = 60 * 60;

// ======================================================
// COMPONENT
// ======================================================

function PlayGame() {
  const navigate = useNavigate();

  // ====================================================
  // TEAM
  // ====================================================

  const [team, setTeam] = useState(null);
  const [teamId, setTeamId] = useState("");
  const [startCode, setStartCode] = useState("");

  // ====================================================
  // GAME
  // ====================================================

  const [question, setQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [correctAnswer, setCorrectAnswer] =
    useState("");

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [timeLeft, setTimeLeft] = useState(
    DEFAULT_TOTAL_GAME_TIME
  );

  const [totalGameTime, setTotalGameTime] =
    useState(DEFAULT_TOTAL_GAME_TIME);

  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);

  // ====================================================
  // GAME STATE
  // ====================================================

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [gamePaused, setGamePaused] =
    useState(false);

  const [waitingForAdmin, setWaitingForAdmin] =
    useState(false);

  const [answered, setAnswered] =
    useState(false);

  const [answerCorrect, setAnswerCorrect] =
    useState(null);

  // ====================================================
  // CLUE
  // ====================================================

  const [clue, setClue] = useState("");
  const [locationHint, setLocationHint] =
    useState("");

  const [locationName, setLocationName] =
    useState("");

  const [showClue, setShowClue] =
    useState(false);

  const [loadingClue, setLoadingClue] =
    useState(false);

  // ====================================================
  // HALF CODE
  // ====================================================

  const [halfCode, setHalfCode] =
    useState("");

  const [codeVerified, setCodeVerified] =
    useState(false);

  const [verifyingCode, setVerifyingCode] =
    useState(false);

  // ====================================================
  // UI
  // ====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [eliminated, setEliminated] =
    useState(false);

  // ====================================================
  // REFS
  // ====================================================

  const timerRef = useRef(null);

  const antiCheatCleanupRef =
    useRef(null);

  const violationReported =
    useRef(false);

  const teamRef = useRef(null);
  const socketRef = useRef(null);

  // Keep latest team in ref
  useEffect(() => {
    teamRef.current = team;
  }, [team]);

  // ====================================================
  // LOAD CURRENT ROUND
  // ====================================================

  const loadCurrentRound = useCallback(
    async (currentTeamId) => {
      if (!currentTeamId) return;

      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await fetch(
          `${API_URL}/game/round/${encodeURIComponent(
            currentTeamId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load question."
          );
        }

        // -------------------------------
        // ELIMINATED
        // -------------------------------

        if (
          data.team?.status ===
          "Eliminated"
        ) {
          setTeam(data.team);
          setEliminated(true);
          setGameStarted(false);
          setWaitingForAdmin(false);
          return;
        }

        // -------------------------------
        // COMPLETED
        // -------------------------------

        if (
          data.completed === true ||
          data.finished === true ||
          data.team?.status ===
            "Completed"
        ) {
          setTeam(data.team);

          setScore(
            data.team?.score ?? 0
          );

          setLives(
            data.team?.lives ?? 0
          );

          setGameFinished(true);
          setGameStarted(false);
          setWaitingForAdmin(false);

          return;
        }

        // -------------------------------
        // TEAM
        // -------------------------------

        if (data.team) {
          setTeam(data.team);
        }

        // -------------------------------
        // TOTAL GAME TIME
        // -------------------------------

        const backendTotalTime =
          Number(
            data.totalGameTime ??
              data.gameTime ??
              data.totalTime ??
              DEFAULT_TOTAL_GAME_TIME
          );

        if (
          Number.isFinite(
            backendTotalTime
          ) &&
          backendTotalTime > 0
        ) {
          setTotalGameTime(
            backendTotalTime
          );
        }

        // -------------------------------
        // REMAINING TIME
        // -------------------------------

        if (
          data.remainingTime !==
            undefined &&
          data.remainingTime !== null
        ) {
          const remaining =
            Number(
              data.remainingTime
            );

          if (
            Number.isFinite(
              remaining
            )
          ) {
            setTimeLeft(
              Math.max(
                0,
                remaining
              )
            );
          }
        }

        // -------------------------------
        // QUESTION
        // -------------------------------

        setQuestion(data.question);

        // -------------------------------
        // ROUND
        // -------------------------------

        setRound(
          data.round ??
            data.question?.round ??
            data.team?.currentRound ??
            1
        );

        setTotalRounds(
          data.totalRounds ??
            data.total ??
            10
        );

        // -------------------------------
        // SCORE
        // -------------------------------

        setScore(
          data.team?.score ?? 0
        );

        // -------------------------------
        // LIVES
        // -------------------------------

        setLives(
          data.team?.lives ?? 3
        );

        // -------------------------------
        // RESET ANSWER
        // -------------------------------

        setSelectedAnswer("");
        setCorrectAnswer("");
        setAnswered(false);
        setAnswerCorrect(null);

        // -------------------------------
        // RESET CLUE
        // -------------------------------

        setClue("");
        setLocationHint("");
        setLocationName("");
        setShowClue(false);

        // -------------------------------
        // RESET CODE
        // -------------------------------

        setHalfCode("");
        setCodeVerified(false);

        // -------------------------------
        // GAME ACTIVE
        // -------------------------------

        setGameStarted(true);
        setGamePaused(false);
        setWaitingForAdmin(false);
        setGameFinished(false);
      } catch (err) {
        console.error(
          "LOAD ROUND ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to load question."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ====================================================
  // ADMIN GAME CONTROL + TEAM SOCKET
  // ====================================================

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const applyGameState = async (game) => {
      const status = game?.status;

      if (status === "RUNNING") {
        setGamePaused(false);
        setGameFinished(false);
        setWaitingForAdmin(false);

        const currentTeam = teamRef.current;

        if (currentTeam?.teamId && !eliminated) {
          await loadCurrentRound(currentTeam.teamId);
        }
        return;
      }

      if (status === "PAUSED") {
        setGamePaused(true);
        setGameStarted(false);
        setWaitingForAdmin(false);
        setMessage("GAME PAUSED BY ADMIN");

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      if (status === "ENDED") {
        setGamePaused(false);
        setGameStarted(false);
        setWaitingForAdmin(false);
        setGameFinished(true);
        setQuestion(null);
        setShowClue(false);
        setMessage("GAME ENDED BY ADMIN");

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      // READY / RESET
      setGamePaused(false);
      setGameStarted(false);
      setGameFinished(false);
      setWaitingForAdmin(!!teamRef.current?.teamId);
      setQuestion(null);
      setShowClue(false);
      setMessage(
        teamRef.current?.teamId
          ? "GAME RESET. Waiting for admin to start the hunt..."
          : ""
      );

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    socket.on("connect", async () => {
      console.log("Game socket connected:", socket.id);

      const currentTeam = teamRef.current;

      if (currentTeam?.teamId) {
        socket.emit("join-team", currentTeam.teamId);
      }

      // IMPORTANT:
      // Fetch current game state so players who join AFTER
      // admin START/PAUSE/END also get the correct state.
      try {
        const response = await fetch(`${API_URL}/game/status`);
        const data = await response.json();

        if (response.ok && data.game) {
          await applyGameState(data.game);
        }
      } catch (err) {
        console.error("GAME STATUS ERROR:", err);
      }
    });

    socket.on("game-state", async (game) => {
      await applyGameState(game);
    });

    socket.on("game-started", async (game) => {
      console.log("ADMIN STARTED GAME", game);

      const currentTeam = teamRef.current;

      setGamePaused(false);
      setWaitingForAdmin(false);
      setGameFinished(false);
      setMessage("HUNT STARTED! Good luck.");

      if (currentTeam?.teamId && !eliminated) {
        await loadCurrentRound(currentTeam.teamId);
      }
    });

    socket.on("game-paused", () => {
      console.log("ADMIN PAUSED GAME");

      setGamePaused(true);
      setGameStarted(false);
      setWaitingForAdmin(false);
      setMessage("GAME PAUSED BY ADMIN");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    socket.on("game-reset", () => {
      console.log("ADMIN RESET GAME");

      setGamePaused(false);
      setGameStarted(false);
      setGameFinished(false);
      setWaitingForAdmin(!!teamRef.current?.teamId);
      setQuestion(null);
      setSelectedAnswer("");
      setCorrectAnswer("");
      setAnswered(false);
      setAnswerCorrect(null);
      setClue("");
      setLocationHint("");
      setLocationName("");
      setShowClue(false);
      setHalfCode("");
      setCodeVerified(false);
      setTimeLeft(totalGameTime);
      setMessage(
        teamRef.current?.teamId
          ? "GAME RESET. Waiting for admin to start the hunt..."
          : "GAME RESET."
      );

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    socket.on("game-ended", () => {
      console.log("ADMIN ENDED GAME");

      setGamePaused(false);
      setGameStarted(false);
      setWaitingForAdmin(false);
      setGameFinished(true);
      setQuestion(null);
      setShowClue(false);
      setMessage("GAME ENDED BY ADMIN");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    socket.on("team-eliminated", (data) => {
      const currentTeam = teamRef.current;

      if (
        !currentTeam?.teamId ||
        data?.teamId !== currentTeam.teamId
      ) {
        return;
      }

      setEliminated(true);
      setGameStarted(false);
      setGamePaused(false);
      setWaitingForAdmin(false);
      setQuestion(null);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    socket.on("disconnect", () => {
      console.log("Game socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadCurrentRound]);

  // ====================================================
  // START GAME / PLAYER LOGIN
  // ====================================================

  const startGame = async (event) => {
    event.preventDefault();

    if (
      !teamId.trim() ||
      !startCode.trim()
    ) {
      setError(
        "Team ID and Start Code are required."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/teams/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            teamId: teamId
              .trim()
              .toUpperCase(),

            startCode: startCode
              .trim()
              .toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid Team ID or Start Code."
        );
      }

      const verifiedTeam =
        data.team || data;

      // -------------------------------
      // ELIMINATED
      // -------------------------------

      if (
        verifiedTeam.status ===
        "Eliminated"
      ) {
        setTeam(verifiedTeam);
        setEliminated(true);
        return;
      }

      // -------------------------------
      // SAVE TEAM
      // -------------------------------

      setTeam(verifiedTeam);
      teamRef.current = verifiedTeam;

      if (socketRef.current?.connected) {
        socketRef.current.emit(
          "join-team",
          verifiedTeam.teamId
        );
      }

      localStorage.setItem(
        "codingHuntCurrentTeam",
        JSON.stringify(
          verifiedTeam
        )
      );

      violationReported.current =
        false;

      // -------------------------------
      // TIMER
      // -------------------------------

      const serverTime =
        Number(
          data.totalGameTime ??
            data.gameTime ??
            data.totalTime ??
            DEFAULT_TOTAL_GAME_TIME
        );

      if (
        Number.isFinite(serverTime) &&
        serverTime > 0
      ) {
        setTotalGameTime(serverTime);
        setTimeLeft(serverTime);
      } else {
        setTotalGameTime(
          DEFAULT_TOTAL_GAME_TIME
        );

        setTimeLeft(
          DEFAULT_TOTAL_GAME_TIME
        );
      }

      // -------------------------------
      // IMPORTANT
      // -------------------------------
      // DO NOT LOAD QUESTION DIRECTLY.
      // First check the CURRENT ADMIN GAME STATE.
      // This also supports players joining after admin
      // has already started/paused/ended the game.

      setGameStarted(false);
      setGamePaused(false);
      setGameFinished(false);
      setWaitingForAdmin(true);

      try {
        const statusResponse = await fetch(
          `${API_URL}/game/status`
        );

        const statusData =
          await statusResponse.json();

        if (
          statusResponse.ok &&
          statusData.game
        ) {
          const status =
            statusData.game.status;

          if (status === "RUNNING") {
            setWaitingForAdmin(false);
            setGamePaused(false);
            setMessage(
              "HUNT IS LIVE! Loading your challenge..."
            );

            await loadCurrentRound(
              verifiedTeam.teamId
            );
          } else if (
            status === "PAUSED"
          ) {
            setWaitingForAdmin(false);
            setGamePaused(true);
            setMessage(
              "GAME PAUSED BY ADMIN"
            );
          } else if (
            status === "ENDED"
          ) {
            setWaitingForAdmin(false);
            setGameFinished(true);
            setMessage(
              "GAME ENDED BY ADMIN"
            );
          } else {
            setWaitingForAdmin(true);
            setMessage(
              "Team verified. Waiting for admin to start the hunt..."
            );
          }
        } else {
          setWaitingForAdmin(true);
          setMessage(
            "Team verified. Waiting for admin to start the hunt..."
          );
        }
      } catch (statusError) {
        console.error(
          "GAME STATUS CHECK ERROR:",
          statusError
        );

        setWaitingForAdmin(true);
        setMessage(
          "Team verified. Waiting for admin to start the hunt..."
        );
      }
    } catch (err) {
      console.error(
        "PLAYER LOGIN ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to verify team."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // ANTI CHEAT
  // ====================================================

  const reportViolation = useCallback(
    async (violationType) => {
      if (
        violationReported.current
      ) {
        return;
      }

      const currentTeam =
        teamRef.current ||
        (() => {
          try {
            const saved =
              localStorage.getItem(
                "codingHuntCurrentTeam"
              );

            return saved
              ? JSON.parse(saved)
              : null;
          } catch {
            return null;
          }
        })();

      if (!currentTeam?.teamId) {
        return;
      }

      violationReported.current =
        true;

      setGameStarted(false);
      setGameFinished(false);
      setGamePaused(false);
      setWaitingForAdmin(false);
      setQuestion(null);
      setAnswered(false);
      setSelectedAnswer("");
      setClue("");
      setShowClue(false);
      setEliminated(true);
      setError("");

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }

      if (
        antiCheatCleanupRef.current
      ) {
        antiCheatCleanupRef.current();

        antiCheatCleanupRef.current =
          null;
      }

      const eliminatedTeam = {
        ...currentTeam,
        status: "Eliminated",
        gameStarted: false,
      };

      setTeam(eliminatedTeam);

      localStorage.setItem(
        "codingHuntCurrentTeam",
        JSON.stringify(
          eliminatedTeam
        )
      );

      try {
        const response =
          await fetch(
            `${API_URL}/game/violation`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                teamId:
                  currentTeam.teamId,

                violation:
                  violationType,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "ANTI-CHEAT RESPONSE:",
          data
        );

        if (
          data.status ===
            "Eliminated" ||
          data.eliminated === true
        ) {
          setTeam(
            (previous) => ({
              ...(previous ||
                currentTeam),

              status:
                "Eliminated",

              gameStarted:
                false,
            })
          );
        }
      } catch (err) {
        console.error(
          "VIOLATION REPORT ERROR:",
          err
        );

        setTeam(
          (previous) => ({
            ...(previous ||
              currentTeam),

            status:
              "Eliminated",

            gameStarted:
              false,
          })
        );
      }
    },
    []
  );

  // ====================================================
  // ANTI CHEAT EFFECT
  // ====================================================

  useEffect(() => {
    if (
      !team?.teamId ||
      !gameStarted ||
      gamePaused ||
      eliminated ||
      gameFinished
    ) {
      return;
    }

    if (
      antiCheatCleanupRef.current
    ) {
      antiCheatCleanupRef.current();

      antiCheatCleanupRef.current =
        null;
    }

    antiCheatCleanupRef.current =
      startAntiCheat(
        reportViolation
      );

    return () => {
      if (
        antiCheatCleanupRef.current
      ) {
        antiCheatCleanupRef.current();

        antiCheatCleanupRef.current =
          null;
      }
    };
  }, [
    team?.teamId,
    gameStarted,
    gamePaused,
    eliminated,
    gameFinished,
    reportViolation,
  ]);

  // ====================================================
  // TOTAL GAME TIMER
  // ====================================================

  useEffect(() => {
    if (
      !gameStarted ||
      gamePaused ||
      eliminated ||
      gameFinished
    ) {
      return;
    }

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );
    }

    timerRef.current =
      setInterval(() => {
        setTimeLeft((previous) => {
          if (previous <= 1) {
            clearInterval(
              timerRef.current
            );

            timerRef.current = null;

            setTimeLeft(0);

            setGameStarted(false);
            setGameFinished(true);
            setQuestion(null);
            setShowClue(false);
            setAnswered(false);

            setMessage(
              "TIME OVER! The Coding Hunt has ended."
            );

            return 0;
          }

          return previous - 1;
        });
      }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }
    };
  }, [
    gameStarted,
    gamePaused,
    eliminated,
    gameFinished,
  ]);

  // ====================================================
  // SUBMIT ANSWER
  // ====================================================

  const handleAnswer = async (
    optionKey
  ) => {
    if (
      answered ||
      !question ||
      eliminated ||
      gamePaused ||
      !team?.teamId ||
      timeLeft <= 0
    ) {
      return;
    }

    setSelectedAnswer(optionKey);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `${API_URL}/game/answer`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              teamId:
                team.teamId,

              questionId:
                question.questionId,

              answer:
                optionKey,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit answer."
        );
      }

      setCorrectAnswer(
        data.correctAnswer || ""
      );

      setAnswerCorrect(
        data.correct === true
      );

      setAnswered(true);

      setScore(
        data.score ??
          team.score ??
          0
      );

      setLives(
        data.lives ??
          team.lives ??
          3
      );

      setTeam(
        (previous) => ({
          ...previous,

          score:
            data.score ??
            previous?.score ??
            0,

          lives:
            data.lives ??
            previous?.lives ??
            3,

          status:
            data.status ??
            previous?.status,
        })
      );

      if (
        data.status ===
        "Eliminated"
      ) {
        setEliminated(true);
        setGameStarted(false);
        setQuestion(null);
        return;
      }

      if (
        data.completed === true ||
        data.status === "Completed"
      ) {
        setGameFinished(true);
        setGameStarted(false);
      }
    } catch (err) {
      console.error(
        "ANSWER ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to submit answer."
      );

      setSelectedAnswer("");
    }
  };

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry = () => {
    if (
      lives <= 0 ||
      eliminated ||
      gamePaused ||
      timeLeft <= 0
    ) {
      return;
    }

    setSelectedAnswer("");
    setCorrectAnswer("");
    setAnswerCorrect(null);
    setAnswered(false);
    setError("");
    setMessage("");
  };

  // ====================================================
  // LOAD CLUE
  // ====================================================

  const loadClue = async () => {
    if (
      !team?.teamId ||
      !question?.questionId ||
      gamePaused ||
      timeLeft <= 0
    ) {
      return;
    }

    try {
      setLoadingClue(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/game/clue?teamId=${encodeURIComponent(
            team.teamId
          )}&questionId=${encodeURIComponent(
            question.questionId
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load clue."
        );
      }

      setClue(
        data.clue || ""
      );

      setLocationHint(
        data.locationHint || ""
      );

      setLocationName(
        data.locationName || ""
      );

      setShowClue(true);
    } catch (err) {
      console.error(
        "CLUE ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load clue."
      );
    } finally {
      setLoadingClue(false);
    }
  };

  // ====================================================
  // NEXT
  // ====================================================

  const handleNext = async () => {
    if (
      !answerCorrect ||
      eliminated ||
      gamePaused ||
      timeLeft <= 0
    ) {
      return;
    }

    await loadClue();
  };

  // ====================================================
  // VERIFY HALF CODE
  // ====================================================

  const verifyCode = async () => {
    if (
      !halfCode.trim() ||
      !team?.teamId ||
      !question?.questionId
    ) {
      setError(
        "Please enter the half code."
      );

      return;
    }

    if (
      timeLeft <= 0 ||
      gamePaused
    ) {
      setError(
        "Game is not active."
      );

      return;
    }

    try {
      setVerifyingCode(true);
      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/game/half-code`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              teamId:
                team.teamId,

              questionId:
                question.questionId,

              halfCode:
                halfCode
                  .trim()
                  .toUpperCase(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid half code."
        );
      }

      if (
        data.completed === true ||
        data.status === "Completed"
      ) {
        setGameFinished(true);
        setGameStarted(false);
        return;
      }

      setCodeVerified(true);

      setMessage(
        "Code verified! Loading next round..."
      );

      setHalfCode("");

      const nextTeam =
        data.team || team;

      if (data.team) {
        setTeam(data.team);

        localStorage.setItem(
          "codingHuntCurrentTeam",
          JSON.stringify(
            data.team
          )
        );
      }

      await loadCurrentRound(
        nextTeam.teamId
      );
    } catch (err) {
      console.error(
        "HALF CODE ERROR:",
        err
      );

      setError(
        err.message ||
          "Invalid half code."
      );
    } finally {
      setVerifyingCode(false);
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    if (
      antiCheatCleanupRef.current
    ) {
      antiCheatCleanupRef.current();

      antiCheatCleanupRef.current =
        null;
    }

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    localStorage.removeItem(
      "codingHuntCurrentTeam"
    );

    setTeam(null);
    teamRef.current = null;
    setTeamId("");
    setStartCode("");
    setQuestion(null);
    setGameStarted(false);
    setGamePaused(false);
    setWaitingForAdmin(false);
    setGameFinished(false);
    setEliminated(false);
    setError("");
    setMessage("");

    violationReported.current =
      false;

    navigate("/");
  };

  // ====================================================
  // FORMAT TIMER
  // ====================================================

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const secs =
      safeSeconds % 60;

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

  // ====================================================
  // ELIMINATED SCREEN
  // ====================================================

  if (
    eliminated ||
    team?.status ===
      "Eliminated"
  ) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">

            <div className="student-brand-icon">
              <Shield size={24} />
            </div>

            <span>
              CODING
              <strong>HUNT</strong>
            </span>

          </div>

        </nav>

        <main className="game-finished-wrapper">

          <div className="game-finished-card elimination-card">

            <div className="elimination-icon">
              <XCircle size={58} />
            </div>

            <div className="finished-badge danger-badge">
              ELIMINATED
            </div>

            <h1 className="finished-title elimination-title">
              TEAM ELIMINATED
            </h1>

            <p className="finished-subtitle">
              Your hunt session has
              been terminated.
            </p>

            <div className="elimination-warning">

              <AlertTriangle size={18} />

              <span>
                ANTI-CHEAT VIOLATION
              </span>

            </div>

            <div className="finished-team">
              TEAM:

              <span>
                {team?.teamId ||
                  teamId ||
                  "UNKNOWN"}
              </span>
            </div>

            <p className="elimination-text">
              Tab switching, leaving
              the game window or
              violating anti-cheat
              rules results in
              immediate elimination.
            </p>

            <button
              className="finished-home-btn"
              onClick={() => {
                localStorage.removeItem(
                  "codingHuntCurrentTeam"
                );

                navigate("/");
              }}
            >
              BACK TO HOME
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ====================================================
  // LOGIN SCREEN
  // ====================================================

  if (
    !team &&
    !gameStarted &&
    !gameFinished &&
    !waitingForAdmin
  ) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">

            <div className="student-brand-icon">
              <Shield size={24} />
            </div>

            <span>
              CODING
              <strong>HUNT</strong>
            </span>

          </div>

        </nav>

        <main className="student-login-wrapper">

          <div className="student-login-card">

            <div className="login-logo">
              <Shield size={38} />
            </div>

            <div className="login-badge">
              PLAYER ARENA
            </div>

            <h1>
              PLAYER LOGIN
            </h1>

            <p className="login-subtitle">
              Enter your team credentials
              to enter the hunt.
            </p>

            <form
              onSubmit={startGame}
              className="login-form"
            >

              <div className="login-field">

                <label>
                  <Users size={15} />
                  TEAM ID
                </label>

                <input
                  className="student-input"
                  type="text"
                  placeholder="e.g. TEAM001"
                  value={teamId}
                  onChange={(event) =>
                    setTeamId(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                />

              </div>

              <div className="login-field">

                <label>
                  <Lock size={15} />
                  START CODE
                </label>

                <input
                  className="student-input"
                  type="text"
                  placeholder="Enter start code"
                  value={startCode}
                  onChange={(event) =>
                    setStartCode(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                />

              </div>

              {error && (
                <div className="game-error login-error">

                  <AlertTriangle size={16} />

                  {error}

                </div>
              )}

              <button
                className="start-game-btn"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-loader" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    JOIN HUNT
                  </>
                )}

              </button>

            </form>

            <div className="login-info-grid">

              <div>
                <Heart size={17} />
                <strong>3</strong>
                <span>LIVES</span>
              </div>

              <div>
                <Trophy size={17} />
                <strong>
                  {totalRounds}
                </strong>
                <span>ROUNDS</span>
              </div>

              <div>
                <Clock size={17} />
                <strong>60</strong>
                <span>MINUTES</span>
              </div>

              <div>
                <Shield size={17} />
                <strong>ON</strong>
                <span>ANTI-CHEAT</span>
              </div>

            </div>

            <div className="login-warning">

              <AlertTriangle size={14} />

              Do not switch tabs during
              the hunt.

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ====================================================
  // WAITING FOR ADMIN
  // ====================================================

  if (
    team &&
    waitingForAdmin &&
    !gameStarted &&
    !gamePaused &&
    !gameFinished
  ) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">

            <div className="student-brand-icon">
              <Shield size={24} />
            </div>

            <span>
              CODING
              <strong>HUNT</strong>
            </span>

          </div>

        </nav>

        <main className="student-login-wrapper">

          <div className="student-login-card">

            <div className="login-logo">
              <Shield size={38} />
            </div>

            <div className="login-badge">
              TEAM VERIFIED
            </div>

            <h1>
              READY TO HUNT
            </h1>

            <p className="login-subtitle">
              Team{" "}
              <strong>
                {team.teamId}
              </strong>{" "}
              is successfully verified.
            </p>

            <div
              style={{
                marginTop: "30px",
                padding: "24px",
                border:
                  "1px solid rgba(0,255,120,0.25)",
                borderRadius: "14px",
                textAlign: "center",
                background:
                  "rgba(0,255,120,0.05)",
              }}
            >

              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "14px",
                }}
              >
                ⏳
              </div>

              <h3>
                WAITING FOR ADMIN
              </h3>

              <p
                style={{
                  marginTop: "8px",
                  opacity: 0.7,
                  fontSize: "14px",
                }}
              >
                The hunt will start
                simultaneously for all
                teams.
              </p>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >

                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      "#00ff78",
                    boxShadow:
                      "0 0 12px #00ff78",
                  }}
                />

                ADMIN CONTROL ACTIVE

              </div>

            </div>

            {message && (
              <div
                className="game-message"
                style={{
                  marginTop: "20px",
                }}
              >
                <Clock size={17} />
                {message}
              </div>
            )}

            <button
              className="finished-home-btn"
              style={{
                marginTop: "22px",
              }}
              onClick={logout}
            >
              <LogOut size={16} />
              EXIT
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ====================================================
  // GAME PAUSED
  // ====================================================

  if (
    team &&
    gamePaused &&
    !gameFinished &&
    !eliminated
  ) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">

            <div className="student-brand-icon">
              <Shield size={24} />
            </div>

            <span>
              CODING
              <strong>HUNT</strong>
            </span>

          </div>

        </nav>

        <main className="student-login-wrapper">

          <div className="student-login-card">

            <div className="login-logo">
              <Clock size={38} />
            </div>

            <div className="login-badge">
              GAME PAUSED
            </div>

            <h1>
              HUNT PAUSED
            </h1>

            <p className="login-subtitle">
              The administrator has
              temporarily paused the hunt.
            </p>

            <div
              style={{
                marginTop: "30px",
                padding: "24px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                textAlign: "center",
              }}
            >

              <Clock size={30} />

              <h3
                style={{
                  marginTop: "12px",
                }}
              >
                PLEASE WAIT
              </h3>

              <p
                style={{
                  marginTop: "8px",
                  opacity: 0.65,
                }}
              >
                The game will resume when
                the admin starts it again.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ====================================================
  // FINISHED
  // ====================================================

  if (gameFinished) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">

            <div className="student-brand-icon">
              <Shield size={24} />
            </div>

            <span>
              CODING
              <strong>HUNT</strong>
            </span>

          </div>

        </nav>

        <main className="game-finished-wrapper">

          <div className="game-finished-card">

            <div className="finished-success-icon">
              <Trophy size={60} />
            </div>

            <div className="finished-badge">
              {timeLeft <= 0
                ? "TIME OVER"
                : "HUNT COMPLETED"}
            </div>

            <h1 className="finished-title">

              {timeLeft <= 0
                ? "TIME'S UP!"
                : "CONGRATULATIONS!"}

            </h1>

            <p className="finished-subtitle">

              {timeLeft <= 0
                ? "The total hunt time has ended."
                : "You successfully completed the Coding Hunt."}

            </p>

            <div className="finished-score">

              <span>
                FINAL SCORE
              </span>

              <strong>
                {score}
              </strong>

              <small>
                POINTS
              </small>

            </div>

            <button
              className="finished-home-btn"
              onClick={() =>
                navigate("/")
              }
            >
              BACK TO HOME
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ====================================================
  // GAME SCREEN
  // ====================================================

  return (
    <div className="student-game-page">

      {/* NAVBAR */}

      <nav className="student-game-navbar">

        <div className="student-game-brand">

          <div className="student-brand-icon">
            <Shield size={24} />
          </div>

          <span>
            CODING
            <strong>HUNT</strong>
          </span>

        </div>

        <div className="student-team-info">

          <div className="team-display">

            <span>TEAM</span>

            <strong>
              {team?.teamId}
            </strong>

          </div>

          <div className="nav-stat">

            <Trophy size={16} />

            <strong>
              {score}
            </strong>

          </div>

          <div className="nav-stat">

            <Heart
              size={16}
              fill="currentColor"
            />

            <strong>
              {lives}
            </strong>

          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >

            <LogOut size={16} />

            <span>
              EXIT
            </span>

          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="game-main">

        {/* GAME STATUS BAR */}

        <div className="game-header">

          <div className="round-stat">

            <span>
              ROUND
            </span>

            <strong>
              {round}

              <small>
                /{totalRounds}
              </small>
            </strong>

          </div>

          <div className="progress-stat">

            <div className="progress-label">

              <span>
                HUNT PROGRESS
              </span>

              <strong>
                {Math.round(
                  (round /
                    totalRounds) *
                    100
                )}
                %
              </strong>

            </div>

            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width: `${
                    (round /
                      totalRounds) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* TIMER */}

          <div
            className={`timer-box ${
              timeLeft <= 300
                ? "timer-danger"
                : ""
            }`}
          >

            <Clock size={19} />

            <div>

              <span>
                TIME LEFT
              </span>

              <strong>
                {formatTime(
                  timeLeft
                )}
              </strong>

            </div>

          </div>

        </div>

        {/* ADMIN STATUS */}

        {message && (
          <div className="game-message">

            <CheckCircle size={17} />

            {message}

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="game-error">

            <AlertTriangle size={17} />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* QUESTION */}

        {question &&
          !showClue && (

            <section className="game-question-area">

              <div className="question-header">

                <div className="question-category">

                  <Code2 size={16} />

                  CODING CHALLENGE

                </div>

                <div className="question-number">

                  QUESTION #{round}

                </div>

              </div>

              <div className="game-question-card">

                <div className="question-card-top">

                  <span>
                    CHOOSE THE CORRECT ANSWER
                  </span>

                  <span>
                    +POINTS
                  </span>

                </div>

                <h1>
                  {question.question}
                </h1>

                {question.code && (
                  <pre className="question-code">

                    <code>
                      {question.code}
                    </code>

                  </pre>
                )}

              </div>

              {/* OPTIONS */}

              <div className="game-options">

                {Object.entries(
                  question.options || {}
                ).map(
                  ([key, value]) => {

                    const isSelected =
                      selectedAnswer ===
                      key;

                    const isCorrect =
                      answered &&
                      correctAnswer ===
                      key;

                    const isWrong =
                      answered &&
                      isSelected &&
                      !isCorrect;

                    return (
                      <button
                        key={key}
                        className={`
                          game-option
                          ${
                            isSelected
                              ? "game-option-selected"
                              : ""
                          }
                          ${
                            isCorrect
                              ? "game-option-correct"
                              : ""
                          }
                          ${
                            isWrong
                              ? "game-option-wrong"
                              : ""
                          }
                        `}
                        onClick={() =>
                          handleAnswer(
                            key
                          )
                        }
                        disabled={
                          answered ||
                          loading ||
                          gamePaused ||
                          timeLeft <= 0
                        }
                      >

                        <span className="option-key">
                          {key}
                        </span>

                        <span className="option-text">
                          {value}
                        </span>

                        {isCorrect && (
                          <CheckCircle
                            size={21}
                            className="option-icon"
                          />
                        )}

                        {isWrong && (
                          <XCircle
                            size={21}
                            className="option-icon"
                          />
                        )}

                      </button>
                    );
                  }
                )}

              </div>

              {/* ANSWER RESULT */}

              {answered && (
                <div
                  className={
                    answerCorrect
                      ? "answer-result answer-result-correct"
                      : "answer-result answer-result-wrong"
                  }
                >

                  {answerCorrect ? (
                    <>
                      <CheckCircle
                        size={21}
                      />

                      <div>

                        <strong>
                          CORRECT ANSWER
                        </strong>

                        <span>
                          Excellent! The next
                          clue is now unlocked.
                        </span>

                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={21}
                      />

                      <div>

                        <strong>
                          WRONG ANSWER
                        </strong>

                        <span>
                          The correct answer is
                          highlighted in green.
                        </span>

                      </div>
                    </>
                  )}

                </div>
              )}

              {/* RETRY */}

              {answered &&
                !answerCorrect &&
                lives > 0 &&
                timeLeft > 0 && (

                  <button
                    className="retry-btn"
                    onClick={
                      handleRetry
                    }
                  >
                    TRY AGAIN
                  </button>

                )}

              {/* NEXT */}

              {answered &&
                answerCorrect &&
                timeLeft > 0 && (

                  <button
                    className="next-question-btn"
                    onClick={
                      handleNext
                    }
                    disabled={
                      loadingClue
                    }
                  >

                    {loadingClue
                      ? "UNLOCKING..."
                      : "UNLOCK CLUE"}

                    <span>
                      →
                    </span>

                  </button>

                )}

            </section>
          )}

        {/* CLUE */}

        {showClue && (

          <section className="clue-section">

            <div className="clue-card">

              <div className="clue-success-icon">

                <Lock size={30} />

              </div>

              <div className="finished-badge">
                CLUE UNLOCKED
              </div>

              <h2>
                FIND THE NEXT LOCATION
              </h2>

              <p className="clue-text">

                {clue ||
                  "Your next clue has been unlocked."}

              </p>

              {/* LOCATION */}

              {locationName && (

                <div className="location-box">

                  <div className="location-icon">

                    <MapPin size={22} />

                  </div>

                  <div>

                    <span>
                      LOCATION
                    </span>

                    <strong>
                      {locationName}
                    </strong>

                  </div>

                </div>
              )}

              {/* HINT */}

              {locationHint && (

                <div className="location-hint">

                  <span>
                    LOCATION HINT
                  </span>

                  <p>
                    {locationHint}
                  </p>

                </div>
              )}

              {/* HALF CODE */}

              <div className="half-code-section">

                <div className="half-code-heading">

                  <div>
                    <KeyRoundIcon />
                  </div>

                  <div>

                    <h3>
                      ENTER HALF CODE
                    </h3>

                    <p>
                      Enter the code found at
                      the location.
                    </p>

                  </div>

                </div>

                <input
                  className="half-code-input"
                  type="text"
                  placeholder="ENTER CODE"
                  value={halfCode}
                  onChange={(event) =>
                    setHalfCode(
                      event.target.value
                    )
                  }
                  disabled={
                    verifyingCode ||
                    codeVerified ||
                    gamePaused ||
                    timeLeft <= 0
                  }
                  autoComplete="off"
                />

                <button
                  className="verify-code-btn"
                  onClick={
                    verifyCode
                  }
                  disabled={
                    verifyingCode ||
                    codeVerified ||
                    gamePaused ||
                    timeLeft <= 0
                  }
                >

                  {codeVerified
                    ? "CODE VERIFIED ✓"
                    : verifyingCode
                    ? "VERIFYING..."
                    : "VERIFY HALF CODE →"}

                </button>

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

// ======================================================
// SMALL ICON HELPER
// ======================================================

function KeyRoundIcon() {
  return (
    <Lock size={20} />
  );
}

export default PlayGame;