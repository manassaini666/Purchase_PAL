"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TelegramStatusBadge } from "@/components/TelegramStatusBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("theme");
      const darkState = saved ? saved === "dark" : true;
      setIsDark(darkState);
      if (darkState) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    checkTheme();

    window.addEventListener("storage", checkTheme);
    window.addEventListener("themeChange", checkTheme);

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("themeChange", checkTheme);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event("themeChange"));
  };

  const navItems = [
    { name: "Policies", href: "/policies" },
    { name: "Live Feed", href: "/live-feed" },
    { name: "Approvals", href: "/approvals" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Top Navigation Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Nav Links */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-8">
            <div className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-lg">Purchase Pal</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? isDark
                          ? "bg-zinc-800 text-white"
                          : "bg-zinc-100 text-zinc-900"
                        : isDark
                          ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[10px] font-semibold leading-tight sm:px-2.5 sm:text-xs ${
              isDark
                ? "border-amber-800/70 bg-amber-950/60 text-amber-300"
                : "border-amber-300 bg-amber-50 text-amber-800"
            }`}>
              Sandbox · no real money
            </span>
          </div>

          {/* Right Action Bar: Telegram Badge, Theme Toggle & Sandbox Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <TelegramStatusBadge />
            </div>

            <button
              onClick={toggleTheme}
              className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] sm:px-3 sm:text-xs rounded-xl font-medium border transition-colors ${
                isDark 
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" 
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <span>{isDark ? "🌙 Dark" : "☀️ Light"}</span>
            </button>

            <span className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border ${
              isDark 
                ? "border-zinc-800 bg-zinc-900/50 text-zinc-300" 
                : "border-zinc-200 bg-zinc-100 text-zinc-700"
            }`}>
              PayPal Sandbox
            </span>
          </div>

        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}