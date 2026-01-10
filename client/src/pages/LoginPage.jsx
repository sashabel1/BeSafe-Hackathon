
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { saveToken } from "../lib/auth";

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

      if (res.user?.profileCompleted) {
        navigate("/");
      } else {
        navigate("/profile-setup");
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Login failed",
      });
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Login</h1>
        <p className="text-sm text-white/60 mt-1">Sign in to continue</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs text-white/60">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            placeholder="name@gmail.com"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400/50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs text-white/60">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400/50"
          />
        </div>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-semibold py-3 transition"
        >
          {status.type === "loading" ? "Logging in..." : "Login"}
        </button>

        {status.type === "error" && (
          <p className="text-sm text-red-300 text-center">{status.message}</p>
        )}

        <p className="text-center text-sm text-white/60">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-cyan-300 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
