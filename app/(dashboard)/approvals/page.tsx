"use client";

import { useState } from "react";
import { PageHeader } from "@/components/pageheader";
import { decisions as initialDecisions, DecisionRecord } from "@/lib/mock";

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<DecisionRecord[]>(
    initialDecisions.filter((d) => d.decision === "NEEDS_APPROVAL")
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDecision = async (id: string, action: "APPROVE" | "DENY") => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
    } catch {
      // Fallback for static demo
    } finally {
      setQueue((prev) => prev.filter((item) => (item.id || item.timestamp) !== id));
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals Queue"
        description="Purchases above your automatic threshold ($20.00) wait here and on Telegram for your authorization."
      />
      {queue.length > 0 ? (
        <ul className="space-y-4">
          {queue.map((item) => {
            const key = item.id || item.timestamp;
            const isBusy = processingId === key;
            return (
              <li key={key} className="rounded-xl border border-amber-500/30 bg-white p-5 shadow-sm dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      NEEDS APPROVAL
                    </span>
                    <span className="font-mono text-base font-bold">
                      ${item.request.amount.toFixed(2)} {item.request.currency}
                    </span>
                    <span className="text-sm text-zinc-500">
                      at <strong>{item.request.merchant_id
                                   .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}</strong>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{item.explanation}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleDecision(key, "APPROVE")}
                    disabled={isBusy}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isBusy ? "Processing..." : "Approve & Capture Payment"}
                  </button>
                  <button
                    onClick={() => handleDecision(key, "DENY")}
                    disabled={isBusy}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Deny
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No pending approvals in the queue.
        </div>
      )}
    </div>
  );
}