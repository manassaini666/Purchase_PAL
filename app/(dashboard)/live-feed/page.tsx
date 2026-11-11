"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";

interface Transaction {
  id: string;
  timestamp: string;
  merchant: string;
  category: string;
  amount: number;
  status: "ALLOW" | "BLOCK" | "PENDING";
  reason: string;
}

export default function LiveFeedPage() {
  const [isDark, setIsDark] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ALLOW" | "BLOCK">("ALL");

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

  const transactions: Transaction[] = [
    {
      id: "tx_001",
      timestamp: "2026-11-08 16:45:22",
      merchant: "Merchant A",
      category: "electronics",
      amount: 45.00,
      status: "BLOCK",
      reason: "Exceeds manual approval threshold ($30.00) and triggered Telegram alert (@PurchasePalAlerts_Bot)."
    },
    {
      id: "tx_002",
      timestamp: "2026-11-08 14:20:10",
      merchant: "Merchant B",
      category: "office_supplies",
      amount: 18.50,
      status: "ALLOW",
      reason: "Passed all guardrails automatically (within budget & allowed merchant)."
    },
    {
      id: "tx_003",
      timestamp: "2026-11-08 11:05:50",
      merchant: "Crypto Exchange",
      category: "crypto",
      amount: 50.00,
      status: "BLOCK",
      reason: "Blocked by security policy: Category 'crypto' is explicitly blacklisted."
    },
    {
      id: "tx_004",
      timestamp: "2026-11-08 09:30:15",
      merchant: "Merchant A",
      category: "software",
      amount: 29.00,
      status: "ALLOW",
      reason: "Passed automatically under $30.00 approval threshold."
    }
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "ALLOW") return tx.status === "ALLOW";
    if (filter === "BLOCK") return tx.status === "BLOCK";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            Live Audit & Transaction Feed
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Real-time immutable log of autonomous AI agent purchasing attempts and firewall decisions.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${
          isDark ? "border-zinc-800 bg-zinc-900/80" : "border-zinc-200 bg-white"
        }`}>
          {(["ALL", "ALLOW", "BLOCK"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filter === tab
                  ? "bg-emerald-600 text-white shadow"
                  : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className={`rounded-2xl border shadow-xl backdrop-blur overflow-hidden transition-colors ${
        isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"
      }`}>
        <div className="divide-y divide-zinc-800/50">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
                      {tx.merchant}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200"
                    }`}>
                      {tx.category}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {tx.reason}
                  </p>
                  <span className={`text-[11px] font-mono ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {tx.timestamp} • ID: {tx.id}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                <span className={`text-base font-mono font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  ${tx.amount.toFixed(2)}
                </span>
                <StatusBadge status={tx.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
        merchant_a and merchant_b are demo labels. All sandbox payments go to one sandbox merchant account.
      </p>
    </div>
  );
}
