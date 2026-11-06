"use client";

import { DecisionRecord } from "@/lib/mock";
import { useEffect, useState } from "react";

const statusConfig = {
  ALLOW: { badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", text: "ALLOW" },
  BLOCK: { badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30", text: "BLOCK" },
  NEEDS_APPROVAL: { badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30", text: "APPROVAL" },
};

export function DecisionCard({ decision }: { decision: DecisionRecord }) {
  const [timeString, setTimeString] = useState("");
  const config = statusConfig[decision.decision] || statusConfig.BLOCK;

  useEffect(() => {
    setTimeString(
      new Date(decision.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, [decision.timestamp]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.badge}`}>
            {config.text}
          </span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            ${decision.request.amount.toFixed(2)} {decision.request.currency}
          </span>
          <span className="text-xs text-zinc-500">
            @ <strong className="text-zinc-700 dark:text-zinc-300">{decision.request.merchant_id}</strong>
          </span>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {timeString || "Loading..."}
        </span>
      </div>
      <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-300">{decision.explanation}</p>
      {decision.reason_codes && decision.reason_codes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {decision.reason_codes.map((code) => (
            <span key={code} className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {code}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}