
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiPost } from "../lib/api";
import { saveToken } from "../lib/auth";
import "../styles/SignUpPage.css";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setStatus({ type: "error", message: "Please fill all fields" });
      return;
    }

    try {
      setStatus({ type: "loading", message: "" });

      const res = await apiPost("/auth/signup", {
        fullName,
        email,
        password,
      });

      if (res.token) {
        saveToken(res.token);
        navigate("/");
        return;
      }

      setStatus({
        type: "ok",
        message: "Account created! Please continue.",
      });

      navigate("/profile-setup");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Signup failed",
      });
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Sign up to join our community</p>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@gmail.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 6 chars"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={status.type === "loading"}
            className="signup-button"
          >
            {status.type === "loading" ? "Creating..." : "Create Account"}
          </button>

          {status.message && (
            <p className={`status-msg ${status.type === "error" ? "status-error" : "status-success"}`}>
              {status.message}
            </p>
          )}

          <p className="signup-footer">
            Already have an account?{" "}
            <Link to="/" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}