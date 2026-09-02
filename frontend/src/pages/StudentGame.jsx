import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  ShieldAlert,
  Clock,
  Heart,
  Trophy,
  LogOut,
  AlertTriangle,
  MapPin,
  Lightbulb,
  KeyRound,
  Lock,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL;

function StudentGame() {
  const [team, setTeam] = useState(null);
  const [question, setQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(60);

  const [eliminated, setEliminated] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  // ==========================================
  // CLUE / LOCATION STATES
  // ==========================================

  const [showClue, setShowClue] =
    useState(false);

  const [showLocation, setShowLocation] =
    useState(false);

  const [showHalfCode, setShowHalfCode] =
    useState(false);

  const violationReported =
    useRef(false);

  const timerSubmitted =
    useRef(false);

  // ==========================================
  // GET TEAM FROM LOCAL STORAGE
  // ==========================================

  const getStoredTeam = () => {
    try {
      const saved =
        localStorage.getItem(
          "codingHuntTeam"
        );

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error(
        "Storage error:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // LOAD CURRENT ROUND
  // ==========================================

  const loadRound = async (teamId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/game/round/${teamId}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data.status === "Eliminated"
        ) {
          setEliminated(true);
        }

        setMessage(
          data.message ||
            "Unable to load round."
        );

        return;
      }

      // ----------------------------------------
      // TEAM
      // ----------------------------------------

      setTeam(data.team);

      // ----------------------------------------
      // ONE QUESTION PER ROUND
      // ----------------------------------------

      const currentQuestion =
        Array.isArray(data.questions)
          ? data.questions[0]
          : data.question || null;

      setQuestion(currentQuestion);

      // ----------------------------------------
      // RESET ROUND STATES
      // ----------------------------------------

      setSelectedAnswer("");

      setShowClue(false);
      setShowLocation(false);
      setShowHalfCode(false);

      timerSubmitted.current = false;

      setTimeLeft(
        currentQuestion?.time || 60
      );

      // New round must be started
      // by pressing START ROUND
      setGameStarted(false);

    } catch (error) {
      console.error(
        "LOAD ROUND ERROR:",
        error
      );

      setMessage(
        "Unable to connect to game server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const storedTeam =
      getStoredTeam();

    if (!storedTeam?.teamId) {
      setMessage(
        "Team session not found. Please login again."
      );

      setLoading(false);

      return;
    }

    loadRound(
      storedTeam.teamId
    );
  }, []);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    const storedTeam =
      getStoredTeam();

    if (!storedTeam?.teamId) {
      return;
    }

    const socket =
      io(SOCKET_URL);

    socket.emit(
      "join-team",
      storedTeam.teamId
    );

    // ----------------------------------------
    // TEAM ELIMINATED
    // ----------------------------------------

    socket.on(
      "team-eliminated",
      (data) => {
        if (
          data?.teamId ===
          storedTeam.teamId
        ) {
          setEliminated(true);

          setGameStarted(false);

          setMessage(
            data.reason ||
              "Team eliminated."
          );
        }
      }
    );

    // ----------------------------------------
    // ADMIN MESSAGE
    // ----------------------------------------

    socket.on(
      "admin-message",
      (data) => {
        console.log(
          "Admin message:",
          data
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // ==========================================
  // ANTI-CHEAT REPORT
  // ==========================================

  const reportViolation = async (
    reason
  ) => {
    if (
      violationReported.current
    ) {
      return;
    }

    const currentTeam =
      team || getStoredTeam();

    if (!currentTeam?.teamId) {
      return;
    }

    violationReported.current = true;

    setGameStarted(false);

    setEliminated(true);

    setMessage(
      `🚨 TEAM ELIMINATED — ${reason}`
    );

    try {
      await fetch(
        `${API_URL}/api/game/violation`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            teamId:
              currentTeam.teamId,

            violation: reason,
          }),
        }
      );
    } catch (error) {
      console.error(
        "Violation report error:",
        error
      );
    }
  };

  // ==========================================
  // TAB SWITCH / WINDOW BLUR
  // ==========================================

  useEffect(() => {
    if (
      !gameStarted ||
      eliminated ||
      completed
    ) {
      return;
    }

    const handleVisibility =
      () => {
        if (document.hidden) {
          reportViolation(
            "TAB_SWITCH"
          );
        }
      };

    const handleBlur = () => {
      reportViolation(
        "WINDOW_BLUR"
      );
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, [
    gameStarted,
    eliminated,
    completed,
    team,
  ]);

  // ==========================================
  // FULLSCREEN EXIT
  // ==========================================

  useEffect(() => {
    if (
      !gameStarted ||
      eliminated ||
      completed
    ) {
      return;
    }

    const handleFullscreen =
      () => {
        if (
          !document.fullscreenElement
        ) {
          reportViolation(
            "FULLSCREEN_EXIT"
          );
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, [
    gameStarted,
    eliminated,
    completed,
    team,
  ]);

  // ==========================================
  // COPY / PASTE / RIGHT CLICK
  // ==========================================

  useEffect(() => {
    if (
      !gameStarted ||
      eliminated ||
      completed
    ) {
      return;
    }

    const blockContextMenu = (
      event
    ) => {
      event.preventDefault();

      reportViolation(
        "RIGHT_CLICK"
      );
    };

    const blockCopy = (event) => {
      event.preventDefault();

      reportViolation(
        "COPY_ATTEMPT"
      );
    };

    const blockPaste = (event) => {
      event.preventDefault();

      reportViolation(
        "PASTE_ATTEMPT"
      );
    };

    const blockCut = (event) => {
      event.preventDefault();

      reportViolation(
        "CUT_ATTEMPT"
      );
    };

    document.addEventListener(
      "contextmenu",
      blockContextMenu
    );

    document.addEventListener(
      "copy",
      blockCopy
    );

    document.addEventListener(
      "paste",
      blockPaste
    );

    document.addEventListener(
      "cut",
      blockCut
    );

    return () => {
      document.removeEventListener(
        "contextmenu",
        blockContextMenu
      );

      document.removeEventListener(
        "copy",
        blockCopy
      );

      document.removeEventListener(
        "paste",
        blockPaste
      );

      document.removeEventListener(
        "cut",
        blockCut
      );
    };
  }, [
    gameStarted,
    eliminated,
    completed,
    team,
  ]);

  // ==========================================
  // KEYBOARD BLOCK
  // ==========================================

  useEffect(() => {
    if (
      !gameStarted ||
      eliminated ||
      completed
    ) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      const key =
        event.key.toLowerCase();

      const blocked =
        event.key === "F12" ||
        (event.ctrlKey &&
          ["c", "v", "x", "u", "s"].includes(
            key
          )) ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(
            key
          ));

      if (blocked) {
        event.preventDefault();

        reportViolation(
          "BLOCKED_KEYBOARD_SHORTCUT"
        );
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    gameStarted,
    eliminated,
    completed,
    team,
  ]);

  // ==========================================
  // TIMER
  // ==========================================

  useEffect(() => {
    if (
      !gameStarted ||
      !question ||
      eliminated ||
      completed
    ) {
      return;
    }

    if (timeLeft <= 0) {
      if (
        !timerSubmitted.current
      ) {
        timerSubmitted.current =
          true;

        handleSubmitAnswer(true);
      }

      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) =>
            previous - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    gameStarted,
    question,
    timeLeft,
    eliminated,
    completed,
  ]);

  // ==========================================
  // START ROUND
  // ==========================================

  const enterFullscreen = async () => {
    try {
      if (
        !document.fullscreenElement
      ) {
        await document.documentElement.requestFullscreen();
      }

      setGameStarted(true);
      setMessage("");
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );

      // Browser fullscreen unavailable
      // Game can still start
      setGameStarted(true);
    }
  };

  // ==========================================
  // SUBMIT ANSWER
  // ==========================================

  const handleSubmitAnswer = async (
    isTimeout = false
  ) => {
    if (
      submitting ||
      eliminated ||
      completed ||
      !question ||
      !team
    ) {
      return;
    }

    setSubmitting(true);

    const answer =
      isTimeout
        ? ""
        : selectedAnswer;

    try {
      const response =
        await fetch(
          `${API_URL}/api/game/answer`,
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

              answer,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to submit answer."
        );

        if (
          data.status ===
          "Eliminated"
        ) {
          setEliminated(true);
          setGameStarted(false);
        }

        return;
      }

      // ----------------------------------------
      // UPDATE TEAM DATA
      // ----------------------------------------

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
            0,

          status:
            data.status ??
            previous?.status,

          round:
            data.round ??
            previous?.round,
        })
      );

      // ----------------------------------------
      // ELIMINATED
      // ----------------------------------------

      if (
        data.status ===
        "Eliminated"
      ) {
        setEliminated(true);

        setGameStarted(false);

        setMessage(
          "❌ You have been eliminated."
        );

        return;
      }

      // ----------------------------------------
      // COMPLETED
      // ----------------------------------------

      if (data.completed) {
        setCompleted(true);

        setGameStarted(false);

        setMessage(
          "🏆 Congratulations! You completed all 10 rounds."
        );

        return;
      }

      // ----------------------------------------
      // NEXT ROUND
      // ----------------------------------------

      if (data.nextRound) {
        await loadRound(
          team.teamId
        );

        return;
      }

      // ----------------------------------------
      // IF BACKEND DOES NOT SEND nextRound
      // ----------------------------------------

      if (
        data.round &&
        data.round !== team.round
      ) {
        await loadRound(
          team.teamId
        );
      }

    } catch (error) {
      console.error(
        "SUBMIT ERROR:",
        error
      );

      setMessage(
        "Server error while submitting answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "codingHuntTeam"
    );

    window.location.href = "/";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="student-game-loading">
        <div>
          <ShieldAlert size={42} />

          <h2>
            CODING HUNT
          </h2>

          <p>
            Loading your challenge...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ELIMINATED
  // ==========================================

  if (eliminated) {
    return (
      <div className="student-game-screen">

        <div className="game-result-card eliminated-card">

          <AlertTriangle
            size={64}
          />

          <p className="result-label">
            CODING HUNT
          </p>

          <h1>
            TEAM ELIMINATED
          </h1>

          <p>
            {message ||
              "Your team has been eliminated."}
          </p>

          <div className="result-team">
            {team?.teamName ||
              "Team"}
          </div>

          <button
            onClick={
              handleLogout
            }
          >
            <LogOut size={17} />

            EXIT GAME
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // COMPLETED
  // ==========================================

  if (completed) {
    return (
      <div className="student-game-screen">

        <div className="game-result-card completed-card">

          <Trophy size={64} />

          <p className="result-label">
            CODING HUNT
          </p>

          <h1>
            GAME COMPLETED
          </h1>

          <p>
            Congratulations! You completed
            all 10 rounds.
          </p>

          <div className="final-score">

            <small>
              FINAL SCORE
            </small>

            <strong>
              {team?.score || 0}
            </strong>

          </div>

          <button
            onClick={
              handleLogout
            }
          >
            EXIT GAME
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN GAME
  // ==========================================

  return (
    <div className="student-game-screen">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="student-game-header">

        <div className="game-brand">

          <ShieldAlert
            size={28}
          />

          <div>

            <strong>
              CODING HUNT
            </strong>

            <small>
              LIVE CHALLENGE
            </small>

          </div>

        </div>

        <div className="game-team-info">

          <div>

            <small>
              TEAM
            </small>

            <strong>
              {team?.teamName}
            </strong>

          </div>

          <div>

            <small>
              SET
            </small>

            <strong>
              {team?.set}
            </strong>

          </div>

          <div>

            <small>
              ROUND
            </small>

            <strong>
              {team?.round}/10
            </strong>

          </div>

        </div>

      </header>


      {/* ======================================
          GAME CONTENT
      ====================================== */}

      <main className="student-game-content">

        {/* ====================================
            SCORE / LIVES / TIMER
        ==================================== */}

        <div className="game-stats">

          {/* SCORE */}

          <div className="game-stat">

            <Trophy size={20} />

            <div>

              <small>
                SCORE
              </small>

              <strong>
                {team?.score || 0}
              </strong>

            </div>

          </div>


          {/* LIVES */}

          <div className="game-stat">

            <Heart size={20} />

            <div>

              <small>
                LIVES
              </small>

              <strong>
                {"❤️".repeat(
                  team?.lives || 0
                )}
              </strong>

            </div>

          </div>


          {/* TIMER */}

          <div className="game-stat timer-stat">

            <Clock size={20} />

            <div>

              <small>
                TIME
              </small>

              <strong>
                {timeLeft}s
              </strong>

            </div>

          </div>

        </div>


        {/* ====================================
            QUESTION
        ==================================== */}

        {question ? (

          <section className="student-question-card">

            {/* QUESTION HEADER */}

            <div className="question-top">

              <span>
                ROUND {team?.round}
              </span>

              <span>
                {question.marks} POINTS
              </span>

            </div>


            {/* QUESTION */}

            <h1>
              {question.question}
            </h1>


            {/* =================================
                OPTIONS
            ================================= */}

            <div className="student-options">

              {[
                "A",
                "B",
                "C",
                "D",
              ].map(
                (option) => {

                  const selected =
                    selectedAnswer ===
                    option;

                  return (
                    <button
                      key={option}
                      className={
                        selected
                          ? "student-option selected"
                          : "student-option"
                      }
                      onClick={() =>
                        setSelectedAnswer(
                          option
                        )
                      }
                      disabled={
                        submitting ||
                        !gameStarted
                      }
                    >

                      <span className="option-letter">
                        {option}
                      </span>

                      <span>
                        {
                          question
                            .options?.[
                              option
                            ]
                        }
                      </span>

                    </button>
                  );
                }
              )}

            </div>


            {/* =================================
                CLUE + LOCATION + CODE
            ================================= */}

            <div className="game-hints-section">

              {/* ===============================
                  CLUE
              =============================== */}

              <div className="game-hint-card">

                <div className="hint-card-header">

                  <div className="hint-title">

                    <Lightbulb
                      size={18}
                    />

                    <div>

                      <strong>
                        CLUE
                      </strong>

                      <small>
                        Need a hint?
                      </small>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="hint-action-btn"
                    onClick={() =>
                      setShowClue(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={
                      !gameStarted
                    }
                  >
                    {showClue
                      ? "HIDE"
                      : "SHOW CLUE"}
                  </button>

                </div>


                {showClue && (

                  <div className="hint-content">

                    {question.clue ? (

                      <p>
                        {question.clue}
                      </p>

                    ) : (

                      <p>
                        No clue available
                        for this round.
                      </p>

                    )}

                  </div>

                )}

              </div>


              {/* ===============================
                  LOCATION
              =============================== */}

              <div className="game-hint-card">

                <div className="hint-card-header">

                  <div className="hint-title">

                    <MapPin
                      size={18}
                    />

                    <div>

                      <strong>
                        LOCATION
                      </strong>

                      <small>
                        Find the next location
                      </small>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="hint-action-btn"
                    onClick={() =>
                      setShowLocation(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={
                      !gameStarted
                    }
                  >
                    {showLocation
                      ? "HIDE"
                      : "SHOW LOCATION"}
                  </button>

                </div>


                {showLocation && (

                  <div className="location-content">

                    {question.locationName && (

                      <div className="location-row">

                        <strong>
                          📍 Location
                        </strong>

                        <span>
                          {
                            question.locationName
                          }
                        </span>

                      </div>

                    )}


                    {question.locationHint && (

                      <div className="location-row">

                        <strong>
                          💡 Hint
                        </strong>

                        <span>
                          {
                            question.locationHint
                          }
                        </span>

                      </div>

                    )}


                    {question.locationCode && (

                      <div className="location-code">

                        <KeyRound
                          size={16}
                        />

                        <span>
                          CODE:{" "}
                          {
                            question.locationCode
                          }
                        </span>

                      </div>

                    )}


                    {!question.locationName &&
                      !question.locationHint &&
                      !question.locationCode && (

                        <p>
                          No location information
                          available.
                        </p>

                    )}

                  </div>

                )}

              </div>


              {/* ===============================
                  HALF CODE
              =============================== */}

              {question.halfCode && (

                <div className="game-hint-card">

                  <div className="hint-card-header">

                    <div className="hint-title">

                      <KeyRound
                        size={18}
                      />

                      <div>

                        <strong>
                          CODE FRAGMENT
                        </strong>

                        <small>
                          Unlocked during
                          this round
                        </small>

                      </div>

                    </div>


                    <button
                      type="button"
                      className="hint-action-btn"
                      onClick={() =>
                        setShowHalfCode(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={
                        !gameStarted
                      }
                    >
                      {showHalfCode
                        ? "HIDE"
                        : "VIEW"}
                    </button>

                  </div>


                  {showHalfCode && (

                    <div className="half-code-content">

                      <Lock
                        size={16}
                      />

                      <code>
                        {
                          question.halfCode
                        }
                      </code>

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* =================================
                START / SUBMIT
            ================================= */}

            {!gameStarted ? (

              <button
                className="start-game-btn"
                onClick={
                  enterFullscreen
                }
              >

                <ShieldAlert
                  size={18}
                />

                START ROUND

              </button>

            ) : (

              <button
                className="submit-answer-btn"
                disabled={
                  submitting ||
                  !selectedAnswer
                }
                onClick={() =>
                  handleSubmitAnswer(
                    false
                  )
                }
              >

                {submitting
                  ? "SUBMITTING..."
                  : "SUBMIT ANSWER"}

              </button>

            )}

          </section>

        ) : (

          <div className="empty-questions">

            <AlertTriangle
              size={42}
            />

            <h3>
              No question available
            </h3>

            <p>
              Please contact the admin.
            </p>

          </div>

        )}


        {/* ====================================
            MESSAGE
        ==================================== */}

        {message && (

          <div className="game-message">
            {message}
          </div>

        )}


        {/* ====================================
            ANTI-CHEAT NOTICE
        ==================================== */}

        <div className="anti-cheat-notice">

          <ShieldAlert
            size={17}
          />

          <span>
            Anti-cheat protection is active.
            Do not switch tabs, exit fullscreen,
            copy/paste or use blocked shortcuts.
          </span>

        </div>

      </main>

    </div>
  );
}

export default StudentGame;