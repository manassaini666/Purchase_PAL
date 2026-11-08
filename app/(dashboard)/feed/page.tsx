"use client";

import { useState, useEffect } from "react";

export default function LiveFeedPage() {
  const [isDark, setIsDark] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [threshold, setThreshold] = useState(68);

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("theme");
      setIsDark(saved ? saved === "dark" : true);
    };
    checkTheme();
    window.addEventListener("storage", checkTheme);
    const interval = setInterval(checkTheme, 200);

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
      clearInterval(interval);
    };
  }, []);

  const feedItems = [
    {
      id: 1,
      type: "ALLOW",
      amount: 12.00,
      currency: "USD",
      merchant: "Merchant A",
      time: "20:02:00",
      desc: "This $12.00 purchase at Merchant A passed all guard rules and was completed automatically via PayPal sandbox.",
      item: "item_usb_hub",
      category: "electronics",
      status: "ALLOWED"
    },
    {
      id: 2,
      type: "BLOCK",
      amount: 45.00,
      currency: "USD",
      merchant: "Untrusted Store",
      time: "20:40:00",
      desc: "Payment was blocked because Untrusted Store is not on your allowed merchant list.",
      item: "item_gift_card",
      category: "gift_cards",
      status: "MERCHANT_NOT_ALLOWED"
    },
    {
      id: 3,
      type: "ALLOW",
      amount: 28.50,
      currency: "USD",
      merchant: "Merchant B",
      time: "21:35:00",
      desc: `This $28.50 purchase is within your $${threshold}.00 threshold and passed automatically.`,
      item: "item_keyboard",
      category: "electronics",
      status: "ALLOWED"
    }
  ];

  const filteredItems = feedItems.filter(item => {
    if (filter === "ALL") return true;
    return item.type === filter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
          Live Decision Feed
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Real-time deterministic guard evaluations and plain-language explanations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-lg backdrop-blur transition-colors ${
        isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"
      }`}>
        <div className="flex gap-2">
          {["ALL", "ALLOW", "BLOCK"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab
                  ? "bg-emerald-600 text-white shadow"
                  : isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className={`text-xs font-mono px-3 py-1 rounded-lg border ${
          isDark ? "bg-zinc-950/80 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
        }`}>
          Active Approval Threshold: <strong className="text-emerald-500">${threshold}.00</strong>
        </span>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col rounded-2xl border p-5 shadow-xl backdrop-blur transition-colors space-y-3 ${
              isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                  item.type === "ALLOW"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}>
                  {item.type}
                </span>
                <span className={`text-base font-bold font-mono ${isDark ? "text-white" : "text-zinc-900"}`}>
                  ${item.amount.toFixed(2)} {item.currency}
                </span>
                <span className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  @ {item.merchant}
                </span>
              </div>
              <span className={`text-xs font-mono ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                {item.time}
              </span>
            </div>

            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              {item.desc}
            </p>

            <div className={`flex items-center justify-between pt-2 border-t text-xs font-mono ${
              isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-100 text-zinc-500"
            }`}>
              <span>Item: {item.item} • Category: {item.category}</span>
              <span className={`font-bold ${item.status === "ALLOWED" ? "text-emerald-500" : "text-rose-500"}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}