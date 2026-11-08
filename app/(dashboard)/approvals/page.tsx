"use client";

import { useState, useEffect } from "react";

export default function ApprovalsPage() {
  const [isDark, setIsDark] = useState(true);
  const [threshold, setThreshold] = useState(68);
  
  // Mock test purchase amount
  const purchaseAmount = 28.50;
  const requiresApproval = purchaseAmount > threshold;

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("theme");
      setIsDark(saved ? saved === "dark" : true);
    };
    checkTheme();

    window.addEventListener("storage", checkTheme);
    window.addEventListener("themeChange", checkTheme);

    const savedPolicy = localStorage.getItem("activePolicy");
    if (savedPolicy) {
      try {
        const parsed = JSON.parse(savedPolicy);
        if (parsed.approval_required_above) {
          setThreshold(parsed.approval_required_above);
        }
      } catch (e) {
        console.error("Failed to parse policy", e);
      }
    }

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("themeChange", checkTheme);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
          Approvals Queue
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Purchases above your automatic threshold (${threshold}.00) wait here and on Telegram for your authorization.
        </p>
      </div>

      <div className={`flex flex-col items-center justify-center rounded-2xl border p-12 shadow-xl backdrop-blur transition-colors text-center ${
        isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
      }`}>
        {requiresApproval ? (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-lg font-bold ${
              isDark ? "bg-amber-950/80 text-amber-400 border border-amber-800/50" : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}>
              !
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
              Pending Approval Required
            </h2>
            <p className={`text-sm mt-1 max-w-md ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Your ${purchaseAmount.toFixed(2)} purchase exceeds your ${threshold}.00 threshold and requires manual authorization.
            </p>
          </>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-lg font-bold ${
              isDark ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}>
              ✓
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
              No pending approvals!
            </h2>
            <p className={`text-sm mt-1 max-w-md ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Your ${purchaseAmount.toFixed(2)} purchase passed automatically under your ${threshold}.00 threshold.
            </p>
          </>
        )}
      </div>
    </div>
  );
}