
import { Link } from "react-router-dom";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSignup = async () => {
    try {
      setStatus({ type: "loading", message: "Creating account..." });

      await apiPost("/api/auth/signup", { fullName, email, password });

      setStatus({
        type: "ok",
        message: "✅ נשלח מייל אימות! תבדקי את האימייל ותלחצי על הקישור.",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Signup failed" });
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Create Account</h1>
        <p className="text-sm text-white/60">Sign up for a new account</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/60">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            placeholder="you@gmail.com"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            placeholder="At least 6 chars"
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={status.type === "loading"}
          className="w-full mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-slate-900 font-semibold py-3 transition"
        >
          {status.type === "loading" ? "Creating..." : "Create Account"}
        </button>

        {status.message && (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-red-300" : "text-emerald-200"
            }`}
          >
            {status.message}
          </p>
        )}

        <p className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/" className="text-cyan-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
