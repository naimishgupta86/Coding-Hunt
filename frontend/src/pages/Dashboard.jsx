import { useEffect, useState } from "react";
import {
  ShieldCheck,
  LogOut,
  Radio,
  Heart,
  Trophy,
  Target,
  Clock,
  Lock,
  MapPin,
  KeyRound,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const teamId = localStorage.getItem("teamId") || "CH-001";

  const [time, setTime] = useState(600);
  const [currentRound] = useState(1);
  const [score] = useState(0);
  const [lives] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("teamId");
    localStorage.removeItem("gameStarted");

    navigate("/");
  };

  const handleStartRound = () => {
    alert("Round 1 will open here.");
  };

  const progress = ((currentRound - 1) / 10) * 100;

  return (
    <div className="dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="nav-logo">

          <div className="nav-logo-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h2>
              CODING <span>HUNT</span>
            </h2>

            <p>COLLEGE TREASURE HUNT</p>
          </div>

        </div>


        <div className="nav-right">

          <div className="event-live">
            <Radio size={14} />
            LIVE
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </nav>


      {/* ================= TEAM HEADER ================= */}

      <section className="team-header">

        <div>

          <p className="section-label">
            YOUR TEAM
          </p>

          <h1>
            CODE WARRIORS
          </h1>

          <p className="team-id">
            Team ID: <strong>{teamId}</strong>
          </p>

        </div>


        <div className="hunt-status">
          <span></span>
          HUNT ACTIVE
        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="stats-grid">

        {/* LIVES */}

        <div className="stat-card">

          <div className="stat-icon lives-icon">
            <Heart size={23} />
          </div>

          <div>

            <p>LIVES</p>

            <h2>{lives}</h2>

            <div className="life-hearts">
              {Array.from({ length: 3 }).map((_, index) => (
                <span key={index}>
                  {index < lives ? "❤️" : "🖤"}
                </span>
              ))}
            </div>

          </div>

        </div>


        {/* SCORE */}

        <div className="stat-card">

          <div className="stat-icon">
            <Trophy size={23} />
          </div>

          <div>

            <p>SCORE</p>

            <h2>{score}</h2>

            <small>POINTS</small>

          </div>

        </div>


        {/* ROUND */}

        <div className="stat-card">

          <div className="stat-icon">
            <Target size={23} />
          </div>

          <div>

            <p>CURRENT ROUND</p>

            <h2>
              {currentRound}
              <span> / 10</span>
            </h2>

            <small>IN PROGRESS</small>

          </div>

        </div>


        {/* TIMER */}

        <div className="stat-card">

          <div className="stat-icon timer-icon">
            <Clock size={23} />
          </div>

          <div>

            <p>TIME REMAINING</p>

            <h2 className={time <= 60 ? "danger-time" : ""}>
              {formatTime()}
            </h2>

            <small>ROUND TIMER</small>

          </div>

        </div>

      </section>


      {/* ================= MAIN GAME ================= */}

      <section className="main-game-grid">

        {/* CURRENT CHALLENGE */}

        <div className="challenge-card">

          <div className="challenge-top">

            <div>

              <p className="section-label">
                CURRENT CHALLENGE
              </p>

              <h2>
                ROUND {currentRound}
              </h2>

              <p className="challenge-description">
                Solve the challenge correctly to unlock
                your next clue.
              </p>

            </div>


            <div className="round-number">
              {String(currentRound).padStart(2, "0")}
            </div>

          </div>


          <div className="challenge-preview">

            <div className="challenge-symbol">
              <Zap size={25} />
            </div>

            <div>

              <p>CHALLENGE 01</p>

              <h3>
                Your first challenge is waiting.
              </h3>

              <span>
                Complete this challenge to continue
                the hunt.
              </span>

            </div>

          </div>


          <button
            className="start-round-btn"
            onClick={handleStartRound}
          >
            START ROUND {currentRound}
            <span>→</span>
          </button>

        </div>


        {/* MISSION */}

        <div className="mission-card">

          <div>

            <p className="section-label">
              MISSION STATUS
            </p>

            <h2>
              Your Mission
            </h2>

          </div>


          <div className="mission-list">

            <div className="mission-item active-mission">

              <Target size={20} />

              <div>
                <strong>
                  Round {currentRound} Challenge
                </strong>

                <small>
                  Ready to start
                </small>
              </div>

            </div>


            <div className="mission-item">

              <Lock size={20} />

              <div>
                <strong>
                  Clue
                </strong>

                <small>
                  Locked
                </small>
              </div>

            </div>


            <div className="mission-item">

              <MapPin size={20} />

              <div>
                <strong>
                  Location
                </strong>

                <small>
                  Locked
                </small>
              </div>

            </div>


            <div className="mission-item">

              <KeyRound size={20} />

              <div>
                <strong>
                  Final Code
                </strong>

                <small>
                  Locked
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= PROGRESS ================= */}

      <section className="progress-card">

        <div className="progress-heading">

          <div>

            <p className="section-label">
              GAME PROGRESS
            </p>

            <h2>
              10 Round Hunt
            </h2>

          </div>


          <strong>
            {Math.round(progress)}%
          </strong>

        </div>


        <div className="progress-bar">

          <div
            style={{
              width: `${progress}%`,
            }}
          />

        </div>


        <div className="round-grid">

          {Array.from({ length: 10 }, (_, index) => {

            const round = index + 1;

            const completed = round < currentRound;
            const active = round === currentRound;

            return (
              <div
                key={round}
                className={`round-box
                  ${completed ? "completed-round" : ""}
                  ${active ? "active-round" : ""}
                `}
              >

                <div className="round-circle">

                  {completed ? (
                    <CheckCircle size={17} />
                  ) : (
                    round
                  )}

                </div>

                <small>
                  {completed
                    ? "DONE"
                    : active
                    ? "CURRENT"
                    : `ROUND ${round}`}
                </small>

              </div>
            );

          })}

        </div>

      </section>


      {/* ================= RULES ================= */}

      <section className="rules-card">

        <div className="rules-icon">
          <ShieldCheck size={22} />
        </div>

        <div>

          <h3>
            Hunt Rules
          </h3>

          <p>
            Solve challenges, unlock clues, verify
            locations and discover the final code.
            You have {lives} lives remaining.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;