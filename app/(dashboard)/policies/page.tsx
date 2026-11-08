"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";

export default function PoliciesPage() {
  // Form state fields instead of a paragraph
  const [perTransactionMax, setPerTransactionMax] = useState<number>(50);
  const [dailyBudget, setDailyBudget] = useState<number>(100);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(300);
  const [approvalThreshold, setApprovalThreshold] = useState<number>(25);
  const [allowedMerchants, setAllowedMerchants] = useState<string>("Merchant A, Merchant B");
  const [blockedCategories, setBlockedCategories] = useState<string>("Gift Cards, Crypto");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("22:00");

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Build the active mandate object dynamically from form inputs
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
        // Save to localStorage so Live Feed & Approvals instantly sync
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
    <div className="space-y-6 p-8 max-w-7xl mx-auto text-zinc-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Spending Policies</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure guardrails instantly using interactive controls. Purchase Pal generates deterministic JSON mandates in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Interactive Form Controls */}
        <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-zinc-200">
              1. Policy Configuration Controls
            </label>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
              Instant Sync Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 font-medium">Max Spend / Tx ($)</label>
              <input
                type="number"
                value={perTransactionMax}
                onChange={(e) => { setPerTransactionMax(Number(e.target.value)); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium">Manual Approval Above ($)</label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={(e) => { setApprovalThreshold(Number(e.target.value)); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 font-medium">Daily Budget ($)</label>
              <input
                type="number"
                value={dailyBudget}
                onChange={(e) => { setDailyBudget(Number(e.target.value)); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium">Monthly Budget ($)</label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => { setMonthlyBudget(Number(e.target.value)); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium">Allowed Merchants (comma-separated)</label>
            <input
              type="text"
              value={allowedMerchants}
              onChange={(e) => { setAllowedMerchants(e.target.value); setIsConfirmed(false); }}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium">Blocked Categories (comma-separated)</label>
            <input
              type="text"
              value={blockedCategories}
              onChange={(e) => { setBlockedCategories(e.target.value); setIsConfirmed(false); }}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 font-medium">Allowed Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium">Allowed End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setIsConfirmed(false); }}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Structured Mandate Summary Preview */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-zinc-200">2. Structured Mandate Summary</span>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400 font-medium">
                zod validated
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-5 space-y-3.5 text-sm text-zinc-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Summary of active rules:</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Max Spend:</strong> ${perTransactionMax}.00 per transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Budgets:</strong> ${dailyBudget}.00 daily / ${monthlyBudget}.00 monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Manual Approvals:</strong> Required for amounts over ${approvalThreshold}.00</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Allowed Places:</strong> {allowedMerchants}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Blocked Categories:</strong> {blockedCategories}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Time Window:</strong> {startTime} to {endTime} IST</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleActivate}
            disabled={isSaving}
            className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-4 py-3 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            {isSaving ? "Activating..." : isConfirmed ? "✓ Policy Confirmed & Active" : "Confirm & Activate Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}