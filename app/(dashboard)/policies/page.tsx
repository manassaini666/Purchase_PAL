"use client";

import { useEffect, useState } from "react";

export default function PoliciesPage() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Instant Sync Active");

  const [policy, setPolicy] = useState({
    maxSpendPerTx: 63,
    manualApprovalAbove: -13,
    dailyBudget: 150,
    monthlyBudget: 300,
    allowedMerchants: "Merchant A, Merchant B",
    blockedCategories: "Gift Cards, Crypto",
    allowedStartTime: "08:00",
    allowedEndTime: "22:00",
  });

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlHasDark = document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
      setIsDark(htmlHasDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Fetch initial policies
  useEffect(() => {
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.policy) {
          setPolicy(data.policy);
        }
      })
      .catch((err) => console.error("Failed to load policies", err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-save handler on every change (Instant Background Sync)
  const handleFieldChange = async (field: string, value: any) => {
    const updated = { ...policy, [field]: value };
    setPolicy(updated);
    setSyncStatus("Syncing...");

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus("Instant Sync Active");
      } else {
        setSyncStatus("Sync Failed");
      }
    } catch (err) {
      console.error("Auto-sync error", err);
      setSyncStatus("Sync Failed");
    }
  };

  if (loading) {
    return (
      <div className={`p-12 text-center ${isDark ? "text-zinc-400 bg-zinc-950" : "text-zinc-600 bg-zinc-50"} min-h-screen`}>
        Loading autonomous policy guardrails...
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 md:p-10 ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border rounded-xl shadow-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 opacity-80">
              <span>Daily Spent</span>
              <span>${policy.dailyBudget > 0 ? (policy.dailyBudget * 0.42).toFixed(2) : "0.00"} / ${policy.dailyBudget} (42%)</span>
            </div>
            <div className="w-full bg-zinc-700/20 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full w-[42%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 opacity-80">
              <span>Monthly Spent</span>
              <span>${policy.monthlyBudget > 0 ? (policy.monthlyBudget * 0.62).toFixed(2) : "0.00"} / ${policy.monthlyBudget} (62%)</span>
            </div>
            <div className="w-full bg-zinc-700/20 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[62%]"></div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Form Controls */}
          <div className={`lg:col-span-2 p-6 border rounded-xl shadow-sm space-y-6 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
            <div className="flex justify-between items-center pb-4 border-b border-zinc-700/20">
              <div>
                <h2 className="text-lg font-bold">1. Policy Configuration Controls</h2>
                <p className="text-xs opacity-60">Changes are automatically saved and synced with the AI agent in real-time.</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {syncStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-75 block mb-1">Max Spend / Tx ($)</label>
                <input
                  type="number"
                  value={policy.maxSpendPerTx}
                  onChange={(e) => handleFieldChange("maxSpendPerTx", parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
              <div>
                <label className="text-xs opacity-75 block mb-1">Manual Approval Above ($)</label>
                <input
                  type="number"
                  value={policy.manualApprovalAbove}
                  onChange={(e) => handleFieldChange("manualApprovalAbove", parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
              <div>
                <label className="text-xs opacity-75 block mb-1">Daily Budget ($)</label>
                <input
                  type="number"
                  value={policy.dailyBudget}
                  onChange={(e) => handleFieldChange("dailyBudget", parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
              <div>
                <label className="text-xs opacity-75 block mb-1">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={policy.monthlyBudget}
                  onChange={(e) => handleFieldChange("monthlyBudget", parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs opacity-75 block mb-1">Allowed Merchants (comma-separated)</label>
              <input
                type="text"
                value={policy.allowedMerchants}
                onChange={(e) => handleFieldChange("allowedMerchants", e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
              />
            </div>

            <div>
              <label className="text-xs opacity-75 block mb-1">Blocked Categories (comma-separated)</label>
              <input
                type="text"
                value={policy.blockedCategories}
                onChange={(e) => handleFieldChange("blockedCategories", e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-75 block mb-1">Allowed Start Time</label>
                <input
                  type="text"
                  value={policy.allowedStartTime}
                  onChange={(e) => handleFieldChange("allowedStartTime", e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
              <div>
                <label className="text-xs opacity-75 block mb-1">Allowed End Time</label>
                <input
                  type="text"
                  value={policy.allowedEndTime}
                  onChange={(e) => handleFieldChange("allowedEndTime", e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-sm ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-black"}`}
                />
              </div>
            </div>
          </div>

          {/* Right Col: Live Summary Card */}
          <div className={`p-6 border rounded-xl shadow-sm flex flex-col justify-between ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-700/20">
                <h2 className="text-lg font-bold">2. Structured Mandate</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">zod validated</span>
              </div>

              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Max Spend:</strong> ${policy.maxSpendPerTx} per transaction
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Budgets:</strong> ${policy.dailyBudget} daily / ${policy.monthlyBudget} monthly
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Manual Approvals:</strong> Required for amounts over ${policy.manualApprovalAbove}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Allowed Places:</strong> {policy.allowedMerchants}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Blocked Categories:</strong> {policy.blockedCategories}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <strong>Time Window:</strong> {policy.allowedStartTime} to {policy.allowedEndTime}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-700/20">
              <div className="w-full py-3 px-4 rounded-xl font-semibold text-center text-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center gap-2 shadow-sm">
                <span>✓</span> Fully Autonomous & Active
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}