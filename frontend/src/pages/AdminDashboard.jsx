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
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  };

  return (
    <div className="admin-dashboard">

      {/* NAVBAR */}

      <nav className="admin-navbar">

        <div className="admin-nav-brand">

          <div className="admin-nav-icon">
            <Target size={22} />
          </div>

          <div>
            <h2>
              CODING <span>HUNT</span>
            </h2>

            <p>ADMIN CONTROL CENTER</p>
          </div>

        </div>


        <div className="admin-nav-right">

          <div className="admin-live">
            <Activity size={14} />
            SYSTEM ONLINE
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


      {/* HEADER */}

      <section className="admin-header">

        <div>
          <p className="admin-label">
            ADMINISTRATION
          </p>

          <h1>
            Hunt Control Center
          </h1>

          <p>
            Manage teams, rounds, questions and the live game.
          </p>
        </div>


        <div className="game-control">

          <div>
            <span className="control-status"></span>
            GAME READY
          </div>

          <button>
            <Play size={15} />
            START GAME
          </button>

        </div>

      </section>


      {/* STATS */}

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
            <h2>4</h2>
            <small>ONLINE</small>
          </div>

        </div>

      </section>


      {/* MANAGEMENT */}

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
              <h3>Team Management</h3>

              <p>
                Create, edit, disable and manage all
                participating teams.
              </p>
            </div>

            <button onClick={() => navigate("/admin/teams")}>
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
              <h3>Question Management</h3>

              <p>
                Add, edit or delete questions for
                any of the 10 rounds.
              </p>
            </div>

           <button onClick={() => navigate("/admin/questions")}>
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
              <h3>Round Management</h3>

              <p>
                Configure all 10 rounds, timers,
                marks and unlock rules.
              </p>
            </div>

            <button>
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
              <h3>Results & Leaderboard</h3>

              <p>
                Monitor scores, progress and live
                rankings of all teams.
              </p>
            </div>

            <button>
              VIEW RESULTS
            </button>

          </div>

        </div>

      </section>


      {/* LIVE CONTROL */}

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
            4 / 4 SERVERS ONLINE
          </div>

        </div>


        <div className="operation-grid">

          <div className="operation">

            <Play size={20} />

            <div>
              <strong>Start Game</strong>
              <small>Launch the hunt</small>
            </div>

          </div>


          <div className="operation">

            <Pause size={20} />

            <div>
              <strong>Pause Game</strong>
              <small>Temporarily stop all teams</small>
            </div>

          </div>


          <div className="operation">

            <Clock size={20} />

            <div>
              <strong>Round Timer</strong>
              <small>Configure time limits</small>
            </div>

          </div>


          <div className="operation">

            <CheckCircle size={20} />

            <div>
              <strong>Game Status</strong>
              <small>Ready to start</small>
            </div>

          </div>

        </div>

      </section>


      {/* SERVER MONITOR */}

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

        </div>


        <div className="server-grid">

          {[1, 2, 3, 4].map((server) => (

            <div
              className="server-card"
              key={server}
            >

              <div className="server-top">

                <div>
                  <Server size={18} />
                  <strong>
                    SERVER {server}
                  </strong>
                </div>

                <span>
                  ONLINE
                </span>

              </div>


              <div className="server-load">

                <div>
                  <small>STATUS</small>
                  <strong>Healthy</strong>
                </div>

                <div>
                  <small>LOAD</small>
                  <strong>12%</strong>
                </div>

              </div>


              <div className="server-bar">
                <div style={{ width: "12%" }}></div>
              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;