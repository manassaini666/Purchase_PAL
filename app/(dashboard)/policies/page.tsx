'use client';
import { useState, useEffect } from "react";

export default function PoliciesPage() {
  const [maxSpend, setMaxSpend] = useState<string>("");
  const [manualApproval, setManualApproval] = useState<string>("");
  const [dailyBudget, setDailyBudget] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");
  const [allowedMerchants, setAllowedMerchants] = useState<string>("");
  const [blockedCategories, setBlockedCategories] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [telegramChatId, setTelegramChatId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("purchase_pal_user_id") : "";

  useEffect(() => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    fetch(`/api/policies?user_id=${userId}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.config) {
          setMaxSpend(data.config.max_spend_per_tx?.toString() || "");
          setManualApproval(data.config.manual_approval_above?.toString() || "");
          setDailyBudget(data.config.daily_budget?.toString() || "");
          setMonthlyBudget(data.config.monthly_budget?.toString() || "");
          setAllowedMerchants(data.config.allowed_merchants || "");
          setBlockedCategories(data.config.blocked_categories || "");
          setStartTime(data.config.allowed_start_time || "");
          setEndTime(data.config.allowed_end_time || "");
          setTelegramChatId(data.config.telegram_chat_id || "");
        }
      });
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          max_spend_per_tx: Number(maxSpend),
          manual_approval_above: Number(manualApproval),
          daily_budget: Number(dailyBudget),
          monthly_budget: Number(monthlyBudget),
          allowed_merchants: allowedMerchants,
          blocked_categories: blockedCategories,
          allowed_start_time: startTime,
          allowed_end_time: endTime,
          telegram_chat_id: telegramChatId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Policies & Telegram settings saved successfully!");
      } else {
        setMessage(data.error || "Failed to save policies");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-xl font-bold text-purple-400">Purchase Pal - Policy Manager</h1>
          <a
            href="https://t.me/PurchasePalAlerts_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 transition"
          >
            🤖 Open Telegram Bot
          </a>
        </div>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
            <label className="block text-xs font-medium text-purple-300">
              Telegram Chat ID (Required for Alerts)
            </label>
            <p className="text-[11px] text-zinc-400">
  Send <span className="text-purple-400 font-mono">/start</span> to the bot and enter your Chat ID here.
</p>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="Enter your Telegram Chat ID"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Max Spend Per Tx ($)</label>
              <input
                type="number"
                value={maxSpend}
                onChange={(e) => setMaxSpend(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Manual Approval Above ($)</label>
              <input
                type="number"
                value={manualApproval}
                onChange={(e) => setManualApproval(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Daily Budget Limit ($)</label>
              <input
                type="number"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Monthly Budget Limit ($)</label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Allowed Merchants (comma separated)</label>
            <input
              type="text"
              value={allowedMerchants}
              onChange={(e) => setAllowedMerchants(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Blocked Categories</label>
            <input
              type="text"
              value={blockedCategories}
              onChange={(e) => setBlockedCategories(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 font-medium py-3 rounded-lg text-sm transition shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            Save Policies & Telegram Settings
          </button>
        </form>
      </div>
    </div>
  );
}