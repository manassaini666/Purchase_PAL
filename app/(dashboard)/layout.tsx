"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("theme");
      setIsDark(saved ? saved === "dark" : true);
    };
    checkTheme();

    window.addEventListener("storage", checkTheme);
    const interval = setInterval(checkTheme, 200);

    return () => {
      window.removeEventListener("storage", checkTheme);
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}>
      <header className={`border-b px-6 py-4 flex items-center justify-between backdrop-blur transition-colors ${
        isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white/80"
      }`}>
        <div className="flex items-center gap-6">
          <Link href="/policies" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            Purchase Pal
          </Link>
          <nav className={`flex items-center gap-4 text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            <Link href="/policies" className={isDark ? "hover:text-zinc-100" : "hover:text-zinc-900"}>Policies</Link>
            <Link href="/feed" className={isDark ? "hover:text-zinc-100" : "hover:text-zinc-900"}>Live Feed</Link>
            <Link href="/approvals" className={isDark ? "hover:text-zinc-100" : "hover:text-zinc-900"}>Approvals</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
              isDark 
                ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800" 
                : "border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
            }`}
          >
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </button>
          
          <span className={`rounded-full px-3 py-1 font-mono text-xs border ${
            isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-300"
          }`}>
            PayPal Sandbox
          </span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}