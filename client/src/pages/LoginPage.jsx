
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { saveToken } from "../lib/auth";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setStatus({ type: "error", message: "Please enter email and password" });
      return;
    }

    try {
      setStatus({ type: "loading", message: "" });

      const res = await apiPost("/auth/login", {
        email,
        password,
      });

      saveToken(res.token);

      if (res.user && res.user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Login failed",
      });
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1>Login</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              placeholder="name@gmail.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="login-button"
          >
            {status.type === "loading" ? "Logging in..." : "Login"}
          </button>

          {status.type === "error" && (
            <p className="error-message">{status.message}</p>
          )}

          <p className="login-footer">
            Don’t have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}