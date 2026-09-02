import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Terminal,
  Zap,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Temporary testing credentials
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="admin-login-page">

      {/* BACKGROUND EFFECTS */}
      <div className="admin-grid-bg"></div>

      <div className="admin-glow admin-glow-one"></div>
      <div className="admin-glow admin-glow-two"></div>

      {/* TOP BAR */}
      <div className="admin-top-bar">

        <div className="admin-system-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>

        <div className="admin-top-code">
          <Terminal size={14} />
          ADMIN_ACCESS // SECURE
        </div>

      </div>

      {/* LOGIN CONTAINER */}
      <div className="admin-login-wrapper">

        <div className="admin-login-card">

          {/* CARD HEADER */}
          <div className="admin-brand">

            <div className="admin-brand-icon">
              <ShieldCheck size={34} />
            </div>

            <div className="admin-brand-name">
              <h1>
                CODING <span>HUNT</span>
              </h1>

              <p>
                ADMIN CONTROL CENTER
              </p>
            </div>

          </div>

          {/* SECURITY BADGE */}
          <div className="admin-secure-badge">
            <Lock size={13} />
            SECURE ADMIN ACCESS
          </div>

          {/* TITLE */}
          <div className="admin-login-title">

            <p className="admin-eyebrow">
              AUTHENTICATION REQUIRED
            </p>

            <h2>
              Welcome Back,
              <br />
              <span>Administrator.</span>
            </h2>

            <p className="admin-subtitle">
              Sign in to control the Coding Hunt
              competition.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="admin-error">

              <div className="admin-error-icon">
                !
              </div>

              <div>
                <strong>
                  ACCESS DENIED
                </strong>

                <p>
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin}>

            {/* USERNAME */}
            <div className="admin-form-group">

              <label>
                ADMIN USERNAME
              </label>

              <div className="admin-input">

                <User size={18} />

                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  autoComplete="username"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="admin-form-group">

              <label>
                PASSWORD
              </label>

              <div className="admin-input">

                <Lock size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="admin-login-btn"
            >

              <span>
                LOGIN TO ADMIN PANEL
              </span>

              <ArrowRight size={18} />

            </button>

          </form>

          {/* SECURITY INFO */}
          <div className="admin-security-info">

            <div className="security-icon">
              <Zap size={15} />
            </div>

            <div>
              <strong>
                Protected Environment
              </strong>

              <p>
                Unauthorized access is monitored
                and logged.
              </p>
            </div>

          </div>

          {/* BACK */}
          <button
            className="back-student-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <div className="admin-footer">

        <span>
          CODING HUNT
        </span>

        <span className="footer-separator">
          •
        </span>

        <span>
          ADMIN PANEL
        </span>

        <span className="footer-separator">
          •
        </span>

        <span>
          SECURE SESSION
        </span>

      </div>

    </div>
  );
}

export default AdminLogin;