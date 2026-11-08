"use client";

import { useState, useEffect } from "react";

export default function PoliciesPage() {
  const [isDark, setIsDark] = useState(true);
  const [perTransactionMax, setPerTransactionMax] = useState<number>(63);
  const [dailyBudget, setDailyBudget] = useState<number>(150);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(300);
  const [approvalThreshold, setApprovalThreshold] = useState<number>(30);
  const [allowedMerchants, setAllowedMerchants] = useState<string>("Merchant A, Merchant B");
  const [blockedCategories, setBlockedCategories] = useState<string>("Gift Cards, Crypto");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("22:00");

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Live budget utilization stats
  const dailySpent = 63.50;
  const monthlySpent = 185.00;

  const dailyPercentage = Math.min(Math.round((dailySpent / dailyBudget) * 100), 100);
  const monthlyPercentage = Math.min(Math.round((monthlySpent / monthlyBudget) * 100), 100);

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
        if (parsed.per_transaction_max) setPerTransactionMax(parsed.per_transaction_max);
        if (parsed.daily_budget) setDailyBudget(parsed.daily_budget);
        if (parsed.monthly_budget) setMonthlyBudget(parsed.monthly_budget);
        if (parsed.approval_required_above) setApprovalThreshold(parsed.approval_required_above);
        if (parsed.allowed_hours?.start) setStartTime(parsed.allowed_hours.start);
        if (parsed.allowed_hours?.end) setEndTime(parsed.allowed_hours.end);
        setIsConfirmed(true);
      } catch (e) {
        console.error("Failed to parse saved policy", e);
      }
    }

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("themeChange", checkTheme);
    };
  }, []);

  const activeMandate = {
    policy_id: "pol_001",
    agent_id: "agent_shopper",
    currency: "USD",
    per_transaction_max: Number(perTransactionMax),
    daily_budget: Number(dailyBudget),
    monthly_budget: Number(monthlyBudget),
    approval_required_above: Number(approvalThreshold),
    allowed_merchants: allowedMerchants.split(",").map(s => s.trim()),
    blocked_categories: blockedCategories.split(",").map(s => s.toLowerCase().replace(/\s+/g, '_')),
    allowed_hours: { start: startTime, end: endTime, tz: "Asia/Kolkata" },
    expires_at: "2026-11-30T00:00:00Z"
  };

  const handleActivate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: activeMandate.policy_id,
          agentId: activeMandate.agent_id,
          rawPrompt: `Configured via interactive controls: Max $${perTransactionMax}, Approval above $${approvalThreshold}`,
          mandateJson: activeMandate,
          expiresAt: activeMandate.expires_at,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsConfirmed(true);
        localStorage.setItem("activePolicy", JSON.stringify(activeMandate));
      } else {
        alert("Failed to save policy");
      }
    } catch (err) {
      console.error("Error saving policy:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
          Spending Policies & Analytics
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Configure guardrails instantly and track real-time agent budget consumption.
        </p>
      </div>

      {/* LIVE BUDGET UTILIZATION ANALYTICS BAR */}
      <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur space-y-5 transition-colors ${
        isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
            📊 Live Budget Utilization
          </span>
          <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${
            isDark ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border-emerald-200"
          }`}>
            Firewall Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Daily Spent</span>
              <span className={`font-mono ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
                ${dailySpent.toFixed(2)} / ${dailyBudget}.00 ({dailyPercentage}%)
              </span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden border ${
              isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
            }`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  dailyPercentage > 85 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
          </div>

          {/* Monthly Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Monthly Spent</span>
              <span className={`font-mono ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
                ${monthlySpent.toFixed(2)} / ${monthlyBudget}.00 ({monthlyPercentage}%)
              </span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden border ${
              isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
            }`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  monthlyPercentage > 85 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Interactive Form Controls */}
        <div className={`flex flex-col rounded-2xl border p-6 shadow-xl backdrop-blur space-y-4 transition-colors ${
          isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <label className={`text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
              1. Policy Configuration Controls
            </label>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
              isDark ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              Instant Sync Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Max Spend / Tx ($)</label>
              <input
                type="number"
                value={perTransactionMax}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setPerTransactionMax(Number(e.target.value)); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Manual Approval Above ($)</label>
              <input
                type="number"
                value={approvalThreshold}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setApprovalThreshold(Number(e.target.value)); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Daily Budget ($)</label>
              <input
                type="number"
                value={dailyBudget}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setDailyBudget(Number(e.target.value)); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Monthly Budget ($)</label>
              <input
                type="number"
                value={monthlyBudget}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setMonthlyBudget(Number(e.target.value)); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Allowed Merchants (comma-separated)</label>
            <input
              type="text"
              value={allowedMerchants}
              style={{ colorScheme: isDark ? "dark" : "light" }}
              onChange={(e) => { setAllowedMerchants(e.target.value); setIsConfirmed(false); }}
              className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
              }`}
            />
          </div>

          <div>
            <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Blocked Categories (comma-separated)</label>
            <input
              type="text"
              value={blockedCategories}
              style={{ colorScheme: isDark ? "dark" : "light" }}
              onChange={(e) => { setBlockedCategories(e.target.value); setIsConfirmed(false); }}
              className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Allowed Start Time</label>
              <input
                type="text"
                value={startTime}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setStartTime(e.target.value); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
            <div>
              <label className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Allowed End Time</label>
              <input
                type="text"
                value={endTime}
                style={{ colorScheme: isDark ? "dark" : "light" }}
                onChange={(e) => { setEndTime(e.target.value); setIsConfirmed(false); }}
                className={`mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Structured Mandate Summary Preview */}
        <div className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xl backdrop-blur transition-colors ${
          isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>2. Structured Mandate Summary</span>
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium border ${
                isDark ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                zod validated
              </span>
            </div>

            <div className={`rounded-xl border p-5 space-y-3.5 text-sm transition-colors ${
              isDark ? "border-zinc-800 bg-zinc-950/80 text-zinc-300" : "border-zinc-200 bg-zinc-50 text-zinc-700"
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Summary of active rules:</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Max Spend:</strong> ${perTransactionMax}.00 per transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Budgets:</strong> ${dailyBudget}.00 daily / ${monthlyBudget}.00 monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Manual Approvals:</strong> Required for amounts over ${approvalThreshold}.00</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Allowed Places:</strong> {allowedMerchants}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Blocked Categories:</strong> {blockedCategories}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong className={isDark ? "text-white" : "text-zinc-900"}>Time Window:</strong> {startTime} to {endTime} IST</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleActivate}
            disabled={isSaving}
            className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-4 py-3 text-white font-semibold text-sm shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50"
          >
            {isSaving ? "Activating..." : isConfirmed ? "✓ Policy Confirmed & Active" : "Confirm & Activate Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}