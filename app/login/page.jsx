'use client';
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isSignUp ? "signup" : "login",
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Authentication failed");
        return;
      }

      localStorage.setItem("purchase_pal_user_id", email);
      setMessage(isSignUp ? "Account created successfully! Redirecting..." : "Signed in successfully! Redirecting...");

      setTimeout(() => {
        window.location.href = "/policies";
      }, 1000);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleBypass = () => {
    localStorage.setItem("purchase_pal_user_id", "manassaini666@gmail.com");
    window.location.href = "/policies";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-purple-400">Purchase Pal</h1>
          <p className="text-xs text-zinc-400">
            {isSignUp ? "Create your account to start syncing policies" : "Sign in to sync your policies across devices"}
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 font-medium py-3 rounded-lg text-sm transition shadow-lg shadow-purple-600/20"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4 text-center space-y-3">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-purple-400 hover:underline cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          
          <button
            type="button"
            onClick={handleBypass}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-medium py-2.5 rounded-lg text-xs transition"
          >
            🚀 Skip & Enter App Instantly
          </button>
        </div>
      </div>
    </div>
  );
}