"use client";

import { useState, useEffect } from "react";

export function TelegramStatusBadge() {
  const [isDark, setIsDark] = useState(true);
  const [status, setStatus] = useState<"active" | "connecting" | "error">("active");
  const botHandle = "@PurchasePalAlerts_Bot";

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("theme");
      setIsDark(saved ? saved === "dark" : true);
    };
    checkTheme();

    window.addEventListener("storage", checkTheme);
    window.addEventListener("themeChange", checkTheme);

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("themeChange", checkTheme);
    };
  }, []);

  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-colors shadow-sm ${
      isDark 
        ? "bg-zinc-900/80 border-emerald-500/30 text-zinc-300" 
        : "bg-white border-emerald-200 text-zinc-700"
    }`}>
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          status === "active" ? "bg-emerald-400" : "bg-amber-400"
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          status === "active" ? "bg-emerald-500" : "bg-amber-500"
        }`}></span>
      </span>

      <span className="font-semibold">Telegram Webhook:</span>
      <span className="text-emerald-500 dark:text-emerald-400 font-bold">{botHandle}</span>
    </div>
  );
}