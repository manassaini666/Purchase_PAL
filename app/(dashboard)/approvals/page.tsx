"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";
import { decisions as initialDecisions, DecisionRecord } from "@/lib/mock";

export default function ApprovalsPage() {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<DecisionRecord[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const savedFeed = localStorage.getItem("simulated_feed");
      if (savedFeed) {
        const parsed = JSON.parse(savedFeed);
        if (Array.isArray(parsed)) {
          const pending = parsed.filter(
            (d) =>
              d.decision === "NEEDS_APPROVAL" ||
              d.status === "NEEDS_APPROVAL" ||
              d.decision === "APPROVAL"
          );
          setQueue(pending);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load queue from storage", e);
    }

    const defaultPending = initialDecisions.filter(
      (d) => d.decision === "NEEDS_APPROVAL"
    );
    setQueue(defaultPending);
  }, []);

  // Helper to format merchant names nicely (replaces underscores with spaces & capitalizes)
  const formatMerchant = (str: string) => {
    if (!str) return "Merchant";
    return str
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleDecision = async (id: string, action: "APPROVE" | "DENY") => {
    if (processingId) return;
    setProcessingId(id);
    setError(null);

    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) {
        console.warn("Approval endpoint not wired yet; updating local queue.");
      }

      const updatedQueue = queue.filter(
        (item) => (item.id || item.timestamp) !== id
      );
      setQueue(updatedQueue);

      const savedFeed = localStorage.getItem("simulated_feed");
      if (savedFeed) {
        const parsed = JSON.parse(savedFeed);
        const updatedFeed = parsed.map((item: any) => {
          if ((item.id || item.timestamp) === id) {
            return {
              ...item,
              decision: action === "APPROVE" ? "ALLOW" : "BLOCK",
            };
          }
          return item;
        });
        localStorage.setItem("simulated_feed", JSON.stringify(updatedFeed));
      }
    } catch {
      setError("Could not reach approval server. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals Queue"
        description="Purchases exceeding your automatic approval threshold wait here and on Telegram for your authorization."
      />

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {queue.length > 0 ? (
        <ul className="space-y-4">
          {queue.map((item) => {
            const key = item.id || item.timestamp;
            const isBusy = processingId === key;
            const amount = (item as any).request?.amount ?? (item as any).amount ?? 0;
            const currency = (item as any).request?.currency ?? (item as any).currency ?? "USD";
            const rawMerchant = (item as any).request?.merchant_id ?? (item as any).merchant ?? "Merchant";
            const merchant = formatMerchant(rawMerchant);

            return (
              <li
                key={key}
                className="rounded-xl border border-amber-500/30 bg-white p-5 shadow-sm dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      NEEDS APPROVAL
                    </span>
                    <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
                      ${Number(amount).toFixed(2)} {currency}
                    </span>
                    <span className="text-sm text-zinc-500">
                      at{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">
                        {merchant}
                      </strong>
                    </span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {item.explanation}
                </p>

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
          No pending approvals in the queue. You are all caught up!
        </div>
      )}
    </div>
  );
}