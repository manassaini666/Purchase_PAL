"use client";

import { useEffect, useState } from "react";
import { DecisionRecord } from "@/lib/mock";

const badgeStyles: Record<DecisionRecord["decision"], string> = {
  ALLOW:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  BLOCK:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
  NEEDS_APPROVAL:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
};

const badgeLabels: Record<DecisionRecord["decision"], string> = {
  ALLOW: "ALLOW",
  BLOCK: "BLOCK",
  NEEDS_APPROVAL: "APPROVAL",
};

// Helper to clean up underscores in display explanations safely
function formatExplanation(text: string) {
  return text
    .replace(/merchant_a/gi, "Merchant A")
    .replace(/merchant_b/gi, "Merchant B")
    .replace(/agent_shopper/gi, "Shopper Agent")
    .replace(/untrusted_store/gi, "Untrusted Store")
    .replace(/gift_cards/gi, "gift cards");
}

export function DecisionCard({ decision }: { decision: DecisionRecord }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${
              badgeStyles[decision.decision]
            }`}
          >
            {badgeLabels[decision.decision]}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            ${decision.request?.amount?.toFixed(2) ?? "0.00"} {decision.request?.currency ?? "USD"}
          </span>
          <span className="text-xs text-zinc-500">
            @{" "}
            <strong className="text-zinc-700 dark:text-zinc-300">
              {decision.request.merchant_id
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </strong>
          </span>
        </div>
        <span className="font-mono text-xs text-zinc-400">
          {mounted ? new Date(decision.timestamp).toLocaleTimeString() : "--:--:--"}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {formatExplanation(decision.explanation)}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-2.5 text-xs text-zinc-500 dark:border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-zinc-400">Item:</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {decision.request.item_id}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-400">Category:</span>
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
            {decision.request.category}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {decision.reason_codes.map((code) => (
            <span
              key={code}
              className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {code}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}