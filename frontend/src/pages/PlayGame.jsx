import { useEffect, useState } from "react";
import {
  Shield,
  KeyRound,
  Users,
  Play,
  LogOut,
  Clock,
  Heart,
  Trophy,
  CheckCircle,
  XCircle,
  MapPin,
  Lock,
  Unlock,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function PlayGame() {
  // =====================================================
  // TEAM
  // =====================================================

  const [team, setTeam] = useState(null);

  const [teamId, setTeamId] = useState("");
  const [startCode, setStartCode] = useState("");

  // =====================================================
  // QUESTION
  // =====================================================

  const [question, setQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  // =====================================================
  // GAME STATE
  // =====================================================

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [timeLeft, setTimeLeft] = useState(60);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [answered, setAnswered] =
    useState(false);

  const [answerCorrect, setAnswerCorrect] =
    useState(false);

  // =====================================================
  // CLUE STATE
  // =====================================================

  const [showClue, setShowClue] =
    useState(false);

  const [clue, setClue] = useState("");

  const [locationHint, setLocationHint] =
    useState("");

  // =====================================================
  // HALF CODE
  // =====================================================

  const [halfCode, setHalfCode] =
    useState("");

  const [codeVerified, setCodeVerified] =
    useState(false);

  const [verifyingCode, setVerifyingCode] =
    useState(false);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [loadingClue, setLoadingClue] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SAVED TEAM
  // =====================================================

  useEffect(() => {
    const savedTeam = localStorage.getItem(
      "codingHuntCurrentTeam"
    );

    if (!savedTeam) {
      return;
    }

    try {
      const parsedTeam =
        JSON.parse(savedTeam);

      if (!parsedTeam?.teamId) {
        localStorage.removeItem(
          "codingHuntCurrentTeam"
        );
        return;
      }

      setTeam(parsedTeam);

      setTeamId(
        parsedTeam.teamId || ""
      );

      setStartCode(
        parsedTeam.startCode || ""
      );

      setScore(
        Number(parsedTeam.score || 0)
      );

      setLives(
        Number(parsedTeam.lives ?? 3)
      );

      // Automatically load current round
      loadCurrentRound(
        parsedTeam.teamId
      );
    } catch (error) {
      console.error(
        "TEAM STORAGE ERROR:",
        error
      );

      localStorage.removeItem(
        "codingHuntCurrentTeam"
      );
    }
  }, []);

  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {
    if (
      !gameStarted ||
      answered ||
      showClue ||
      gameFinished
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    gameStarted,
    answered,
    showClue,
    gameFinished,
    timeLeft,
  ]);

  // =====================================================
  // TEAM LOGIN
  // =====================================================

  const startGame = async () => {
    setError("");

    if (!teamId.trim()) {
      setError(
        "Please enter Team ID."
      );
      return;
    }

    if (!startCode.trim()) {
      setError(
        "Please enter Start Code."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/teams/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            teamId:
              teamId
                .trim()
                .toUpperCase(),

            startCode:
              startCode
                .trim()
                .toUpperCase(),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "TEAM VERIFY RESPONSE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Team ID or Start Code."
        );
        return;
      }

      if (
        !data.success ||
        !data.team
      ) {
        setError(
          "Invalid response from server."
        );
        return;
      }

      const foundTeam =
        data.team;

      if (
        foundTeam.status !==
        "Active"
      ) {
        setError(
          "This team is not active."
        );
        return;
      }

      setTeam(foundTeam);

      setTeamId(
        foundTeam.teamId
      );

      setStartCode(
        foundTeam.startCode || ""
      );

      setScore(
        Number(foundTeam.score || 0)
      );

      setLives(
        Number(foundTeam.lives ?? 3)
      );

      localStorage.setItem(
        "codingHuntCurrentTeam",
        JSON.stringify(
          foundTeam
        )
      );

      await loadCurrentRound(
        foundTeam.teamId
      );
    } catch (error) {
      console.error(
        "TEAM LOGIN ERROR:",
        error
      );

      setError(
        "Unable to connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CURRENT ROUND
  // =====================================================

  const loadCurrentRound = async (
    currentTeamId
  ) => {
    try {
      setError("");

      const response =
        await fetch(
          `${API_URL}/game/round/${currentTeamId}`
        );

      const data =
        await response.json();

      console.log(
        "CURRENT ROUND RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load question."
        );
      }

      if (
        !data.success ||
        !data.question
      ) {
        throw new Error(
          "Question not available."
        );
      }

      // Update team
      if (data.team) {
        setTeam(data.team);

        setScore(
          Number(data.team.score || 0)
        );

        setLives(
          Number(
            data.team.lives ?? 3
          )
        );

        localStorage.setItem(
          "codingHuntCurrentTeam",
          JSON.stringify(
            data.team
          )
        );
      }

      // Set question
      setQuestion(
        data.question
      );

      setSelectedAnswer("");

      setAnswered(false);

      setAnswerCorrect(false);

      setShowClue(false);

      setClue("");

      setLocationHint("");

      setHalfCode("");

      setCodeVerified(false);

      setTimeLeft(
        Number(
          data.question.time || 60
        )
      );

      setGameStarted(true);

      setGameFinished(false);
    } catch (error) {
      console.error(
        "LOAD CURRENT ROUND ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load questions."
      );

      setGameStarted(false);
    }
  };

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  const handleAnswer = async (
    answer
  ) => {
    if (
      answered ||
      !question ||
      !team
    ) {
      return;
    }

    try {
      setLoading(true);

      setSelectedAnswer(
        answer || "TIMEOUT"
      );

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
                answer || "",
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "ANSWER RESPONSE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to submit answer."
        );

        return;
      }

      // Update score/lives
      setScore(
        Number(data.score || 0)
      );

      setLives(
        Number(data.lives ?? 3)
      );

      // Update team
      const updatedTeam = {
        ...team,

        score:
          Number(data.score || 0),

        lives:
          Number(data.lives ?? 3),

        status:
          data.status ||
          team.status,
      };

      setTeam(updatedTeam);

      localStorage.setItem(
        "codingHuntCurrentTeam",
        JSON.stringify(
          updatedTeam
        )
      );

      // Team eliminated
      if (
        data.status ===
        "Eliminated"
      ) {
        setAnswered(true);
        setAnswerCorrect(false);
        setGameStarted(false);
        return;
      }

      setAnswerCorrect(
        Boolean(data.correct)
      );

      setAnswered(true);

      // =================================================
      // IMPORTANT:
      // CORRECT ANSWER KE BAAD DIRECT ROUND CHANGE NAHI
      // HOGA.
      //
      // NEXT CLICK PAR CLUE LOAD HOGA.
      // =================================================
    } catch (error) {
      console.error(
        "ANSWER ERROR:",
        error
      );

      setError(
        "Unable to submit answer."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NEXT BUTTON
  // =====================================================

  const handleNext = async () => {
    if (
      !answered ||
      !question ||
      !team
    ) {
      return;
    }

    // Wrong answer
    // Team can try next only if still alive
    if (!answerCorrect) {
      setError(
        "Answer is incorrect. Solve the question correctly to unlock the clue."
      );
      return;
    }

    // Correct answer
    // Now load clue
    await loadClue();
  };

  // =====================================================
  // LOAD CLUE
  // =====================================================

  const loadClue = async () => {
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

      console.log(
        "CLUE RESPONSE:",
        data
      );

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

      setShowClue(true);

      setGameStarted(false);
    } catch (error) {
      console.error(
        "LOAD CLUE ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load clue."
      );
    } finally {
      setLoadingClue(false);
    }
  };

  // =====================================================
  // VERIFY HALF CODE
  // =====================================================

  const verifyCode = async () => {
    if (!halfCode.trim()) {
      setError(
        "Please enter the half code."
      );
      return;
    }

    if (!team || !question) {
      return;
    }

    try {
      setVerifyingCode(true);

      setError("");

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

      console.log(
        "HALF CODE RESPONSE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Wrong half code."
        );

        setCodeVerified(false);

        return;
      }

      if (
        !data.success ||
        !data.correct
      ) {
        setError(
          data.message ||
            "Wrong half code."
        );

        return;
      }

      // =================================================
      // HALF CODE CORRECT
      // =================================================

      setCodeVerified(true);

      // LAST ROUND
      if (data.completed) {
        setScore(
          Number(data.score || score)
        );

        setLives(
          Number(data.lives ?? lives)
        );

        const completedTeam = {
          ...team,

          status:
            "Completed",

          round: 10,

          score:
            Number(
              data.score || score
            ),

          lives:
            Number(
              data.lives ?? lives
            ),
        };

        setTeam(
          completedTeam
        );

        localStorage.setItem(
          "codingHuntCurrentTeam",
          JSON.stringify(
            completedTeam
          )
        );

        setShowClue(false);

        setGameFinished(true);

        setGameStarted(false);

        return;
      }

      // =================================================
      // NEXT ROUND UNLOCKED
      // =================================================

      const nextRound =
        Number(
          data.round
        );

      const updatedTeam = {
        ...team,

        round:
          nextRound,

        score:
          Number(
            data.score || score
          ),

        lives:
          Number(
            data.lives ?? lives
          ),
      };

      setTeam(
        updatedTeam
      );

      setScore(
        Number(
          data.score || score
        )
      );

      setLives(
        Number(
          data.lives ?? lives
        )
      );

      localStorage.setItem(
        "codingHuntCurrentTeam",
        JSON.stringify(
          updatedTeam
        )
      );

      // Load next round
      await loadCurrentRound(
        updatedTeam.teamId
      );
    } catch (error) {
      console.error(
        "VERIFY HALF CODE ERROR:",
        error
      );

      setError(
        "Unable to verify half code."
      );
    } finally {
      setVerifyingCode(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "codingHuntCurrentTeam"
    );

    setTeam(null);

    setTeamId("");

    setStartCode("");

    setQuestion(null);

    setGameStarted(false);

    setGameFinished(false);

    setAnswered(false);

    setSelectedAnswer("");

    setShowClue(false);

    setClue("");

    setLocationHint("");

    setHalfCode("");

    setCodeVerified(false);

    setScore(0);

    setLives(3);

    setError("");
  };

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (
    !team &&
    !gameStarted &&
    !gameFinished
  ) {
    return (
      <div className="student-game-page">
        <div className="student-login-card">

          <div className="student-logo">
            <Shield size={32} />
          </div>

          <p className="admin-label">
            CODING HUNT
          </p>

          <h1>
            Enter The Hunt
          </h1>

          <p className="student-login-subtitle">
            Enter your Team ID and Start
            Code provided by the admin.
          </p>

          <label>
            Team ID
          </label>

          <div className="student-input">
            <Users size={17} />

            <input
              type="text"
              placeholder="e.g. CH-123456"
              value={teamId}
              onChange={(e) =>
                setTeamId(
                  e.target.value
                )
              }
              autoComplete="off"
            />
          </div>

          <label>
            Start Code
          </label>

          <div className="student-input">
            <KeyRound size={17} />

            <input
              type="text"
              placeholder="Enter start code"
              value={startCode}
              onChange={(e) =>
                setStartCode(
                  e.target.value
                )
              }
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="game-error">
              {error}
            </div>
          )}

          <button
            className="start-game-btn"
            onClick={startGame}
            disabled={loading}
          >
            <Play size={17} />

            {loading
              ? "CONNECTING..."
              : "START HUNT"}
          </button>

          <p className="student-note">
            Your questions are loaded
            according to your assigned
            question set.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // GAME FINISHED
  // =====================================================

  if (gameFinished) {
    return (
      <div className="student-game-page">

        <div className="game-finished-card">

          <div className="finish-icon">
            <Trophy size={45} />
          </div>

          <p className="admin-label">
            CODING HUNT
          </p>

          <h1>
            Hunt Completed!
          </h1>

          <p>
            Congratulations,{" "}
            <strong>
              {team?.teamName}
            </strong>
          </p>

          <div className="final-score">
            <span>
              FINAL SCORE
            </span>

            <strong>
              {score}
            </strong>
          </div>

          <div className="final-stats">

            <div>
              <Heart size={18} />

              <strong>
                {lives}
              </strong>

              <small>
                Lives
              </small>
            </div>

            <div>
              <Trophy size={18} />

              <strong>
                10/10
              </strong>

              <small>
                Rounds
              </small>
            </div>

          </div>

          <button
            className="logout-game-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            EXIT
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // CLUE SCREEN
  // =====================================================

  if (showClue) {
    return (
      <div className="student-game-page">

        <nav className="student-game-navbar">

          <div className="student-game-brand">
            <Shield size={22} />

            <div>
              <strong>
                CODING HUNT
              </strong>

              <small>
                STUDENT ARENA
              </small>
            </div>
          </div>

          <div className="student-team-info">

            <span>
              {team?.teamName}
            </span>

            <b>
              {team?.teamId}
            </b>

            <span>
              SET {team?.set || "A"}
            </span>

          </div>

          <button
            onClick={logout}
            title="Exit game"
          >
            <LogOut size={17} />
          </button>

        </nav>

        <main className="game-question-area">

          <div className="game-question-card">

            <div className="question-top-line">

              <span>
                ROUND {team?.round}
              </span>

              <span>
                CLUE UNLOCKED
              </span>

              <span>
                <Unlock size={15} />
              </span>

            </div>

            <div
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              <Unlock
                size={50}
              />

              <h1>
                🔎 Your Next Clue
              </h1>

              <p>
                You solved the question
                correctly!
              </p>
            </div>

            {/* CLUE */}

            <div
              className="answer-result answer-result-correct"
              style={{
                marginBottom: "18px",
              }}
            >
              <CheckCircle
                size={22}
              />

              <div>
                <strong>
                  CLUE
                </strong>

                <p>
                  {clue ||
                    "No clue available."}
                </p>
              </div>
            </div>

            {/* LOCATION HINT */}

            {locationHint && (
              <div
                className="answer-result"
                style={{
                  marginBottom: "25px",
                }}
              >
                <MapPin
                  size={22}
                />

                <div>
                  <strong>
                    LOCATION HINT
                  </strong>

                  <p>
                    {locationHint}
                  </p>
                </div>
              </div>
            )}

            {/* NO LOCATION CODE */}

            <div
              style={{
                marginTop: "25px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  marginBottom:
                    "10px",
                }}
              >
                <Lock
                  size={18}
                />

                <strong>
                  ENTER HALF CODE
                </strong>
              </div>

              <input
                type="text"
                value={halfCode}
                onChange={(e) =>
                  setHalfCode(
                    e.target.value
                  )
                }
                placeholder="Enter half code"
                autoComplete="off"
                style={{
                  width: "100%",
                  padding:
                    "14px 16px",
                  fontSize: "18px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #ccc",
                  outline: "none",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "2px",
                }}
              />
            </div>

            {error && (
              <div className="game-error">
                {error}
              </div>
            )}

            <button
              className="next-question-btn"
              onClick={verifyCode}
              disabled={
                verifyingCode ||
                !halfCode.trim()
              }
              style={{
                marginTop: "20px",
              }}
            >
              {verifyingCode
                ? "VERIFYING..."
                : "VERIFY HALF CODE"}

              <Unlock size={16} />
            </button>

          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // NO QUESTION
  // =====================================================

  if (!question) {
    return (
      <div className="student-game-page">

        <div className="student-login-card">

          <Shield size={40} />

          <h2>
            Unable to Load Question
          </h2>

          <p>
            {error ||
              "Question not available."}
          </p>

          <button
            className="start-game-btn"
            onClick={() =>
              loadCurrentRound(
                team?.teamId
              )
            }
          >
            TRY AGAIN
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // GAME SCREEN
  // =====================================================

  return (
    <div className="student-game-page">

      {/* NAVBAR */}

      <nav className="student-game-navbar">

        <div className="student-game-brand">

          <Shield size={22} />

          <div>

            <strong>
              CODING HUNT
            </strong>

            <small>
              STUDENT ARENA
            </small>

          </div>

        </div>

        <div className="student-team-info">

          <span>
            {team?.teamName}
          </span>

          <b>
            {team?.teamId}
          </b>

          <span>
            SET {team?.set || "A"}
          </span>

        </div>

        <button
          onClick={logout}
          title="Exit game"
        >
          <LogOut size={17} />
        </button>

      </nav>

      {/* GAME HEADER */}

      <div className="game-header">

        <div>
          <small>
            ROUND
          </small>

          <strong>
            {team?.round}/10
          </strong>
        </div>

        <div>
          <small>
            SCORE
          </small>

          <strong>
            {score}
          </strong>
        </div>

        <div>
          <small>
            LIVES
          </small>

          <strong>
            {"❤️".repeat(
              lives
            )}
          </strong>
        </div>

        <div className="timer-box">

          <Clock size={17} />

          <strong>
            {String(
              Math.floor(
                timeLeft / 60
              )
            ).padStart(2, "0")}

            :

            {String(
              timeLeft % 60
            ).padStart(2, "0")}
          </strong>

        </div>

      </div>

      {/* QUESTION */}

      <main className="game-question-area">

        <div className="game-question-card">

          <div className="question-top-line">

            <span>
              SET{" "}
              {question.set || "A"}
            </span>

            <span>
              ROUND{" "}
              {question.round}
            </span>

            <span>
              {question.marks} POINTS
            </span>

          </div>

          <h1>
            {question.question}
          </h1>

          {/* OPTIONS */}

          <div className="game-options">

            {[
              "A",
              "B",
              "C",
              "D",
            ].map(
              (option) => {

                const isSelected =
                  selectedAnswer ===
                  option;

                const isCorrect =
                  option ===
                  question.answer;

                let className =
                  "game-option";

                if (
                  answered &&
                  isCorrect
                ) {
                  className +=
                    " game-option-correct";
                }

                if (
                  answered &&
                  isSelected &&
                  !isCorrect
                ) {
                  className +=
                    " game-option-wrong";
                }

                if (
                  !answered &&
                  isSelected
                ) {
                  className +=
                    " game-option-selected";
                }

                return (
                  <button
                    key={option}
                    className={
                      className
                    }
                    disabled={
                      answered ||
                      loading
                    }
                    onClick={() =>
                      handleAnswer(
                        option
                      )
                    }
                  >

                    <span className="game-option-letter">
                      {option}
                    </span>

                    <span className="game-option-text">
                      {
                        question
                          .options?.[
                          option
                        ]
                      }
                    </span>

                    {answered &&
                      isCorrect && (
                        <CheckCircle
                          size={18}
                        />
                      )}

                    {answered &&
                      isSelected &&
                      !isCorrect && (
                        <XCircle
                          size={18}
                        />
                      )}

                  </button>
                );
              }
            )}

          </div>

          {/* RESULT */}

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
                    size={20}
                  />

                  <div>

                    <strong>
                      Correct Answer!
                    </strong>

                    <p>
                      +
                      {
                        question.marks
                      }{" "}
                      points
                    </p>

                  </div>
                </>
              ) : (
                <>
                  <XCircle
                    size={20}
                  />

                  <div>

                    <strong>
                      Incorrect Answer
                    </strong>

                    <p>
                      You lost one
                      life.
                    </p>

                  </div>
                </>
              )}

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="game-error">
              {error}
            </div>
          )}

          {/* NEXT */}

          {answered &&
            answerCorrect && (
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
                  ? "LOADING CLUE..."
                  : "NEXT"}

                <Play size={16} />
              </button>
            )}

          {/* WRONG ANSWER MESSAGE */}

          {answered &&
            !answerCorrect &&
            lives > 0 && (
              <div
                style={{
                  marginTop:
                    "20px",
                  textAlign:
                    "center",
                  fontWeight:
                    "600",
                }}
              >
                You need the correct
                answer to unlock the
                clue.
              </div>
            )}

        </div>
      </main>

    </div>
  );
}

export default PlayGame;