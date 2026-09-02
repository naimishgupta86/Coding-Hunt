import { useNavigate } from "react-router-dom";
import {
  Shield,
  Code2,
  Users,
  LockKeyhole,
  ArrowRight,
  Zap,
  Trophy,
} from "lucide-react";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="coding-hunt-home">

      {/* Background effects */}
      <div className="home-grid"></div>
      <div className="home-glow home-glow-one"></div>
      <div className="home-glow home-glow-two"></div>

      {/* NAVBAR */}
      <nav className="home-navbar">

        <div className="home-logo">
          <div className="logo-icon">
            <Shield size={24} />
          </div>

          <div>
            <h2>CODING HUNT</h2>
            <span>ULTIMATE CHALLENGE</span>
          </div>
        </div>

        <div className="competition-badge">
          <span className="live-dot"></span>
          LIVE COMPETITION
        </div>

      </nav>


      {/* HERO */}
      <main className="home-main">

        <div className="hero-content">

          <div className="hero-tag">
            <Zap size={15} />
            WELCOME TO THE HUNT
          </div>

          <h1>
            CODE.
            <span> THINK.</span>
            <br />
            CONQUER.
          </h1>

          <p className="hero-description">
            Enter the ultimate coding challenge.
            Solve problems, crack clues, discover
            locations and make your way through
            <strong> 10 intense rounds.</strong>
          </p>

          {/* Stats */}
          <div className="hero-stats">

            <div className="hero-stat">
              <Code2 size={18} />
              <div>
                <strong>10</strong>
                <span>ROUNDS</span>
              </div>
            </div>

            <div className="hero-stat">
              <Trophy size={18} />
              <div>
                <strong>100+</strong>
                <span>POINTS</span>
              </div>
            </div>

            <div className="hero-stat">
              <Shield size={18} />
              <div>
                <strong>SECURE</strong>
                <span>ANTI-CHEAT</span>
              </div>
            </div>

          </div>

        </div>


        {/* LOGIN CARDS */}
        <div className="login-selection">

          <p className="selection-label">
            CHOOSE YOUR ACCESS
          </p>

          <div className="login-cards">

            {/* PLAYER */}
            <button
              className="access-card player-card"
              onClick={() => navigate("/Play")}
            >

              <div className="access-card-top">
                <div className="access-icon">
                  <Users size={27} />
                </div>

                <span className="access-number">
                  01
                </span>
              </div>

              <div className="access-content">

                <span className="access-label">
                  PARTICIPANT
                </span>

                <h2>PLAYER LOGIN</h2>

                <p>
                  Enter your team credentials
                  and start your coding hunt.
                </p>

              </div>

              <div className="access-action">
                <span>ENTER THE HUNT</span>
                <ArrowRight size={19} />
              </div>

            </button>


            {/* ADMIN */}
            <button
              className="access-card admin-card"
              onClick={() => navigate("/admin")}
            >

              <div className="access-card-top">
                <div className="access-icon">
                  <LockKeyhole size={27} />
                </div>

                <span className="access-number">
                  02
                </span>
              </div>

              <div className="access-content">

                <span className="access-label">
                  ORGANIZER
                </span>

                <h2>ADMIN LOGIN</h2>

                <p>
                  Manage teams, questions,
                  rounds and the live competition.
                </p>

              </div>

              <div className="access-action">
                <span>OPEN CONTROL PANEL</span>
                <ArrowRight size={19} />
              </div>

            </button>

          </div>

        </div>

      </main>


      {/* FOOTER */}
      <footer className="home-footer">

        <div>
          <span className="footer-dot"></span>
          SYSTEM READY
        </div>

        <span>
          CODING HUNT © 2026
        </span>

        <span>
          CODE • THINK • CONQUER
        </span>

      </footer>

    </div>
  );
}

export default Home;