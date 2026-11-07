"use client";

import { useState, useEffect } from "react";
import { DecisionCard } from "@/components/decisioncard";
import { PageHeader } from "@/components/pageheader";
import { decisions as initialDecisions, DecisionType } from "@/lib/mock";

export default function LiveFeedPage() {
  const [filter, setFilter] = useState<DecisionType | "ALL">("ALL");
  const [feedItems, setFeedItems] = useState(initialDecisions);

  // Load any customized simulated feed from localStorage on mount
  useEffect(() => {
    const savedFeed = localStorage.getItem("simulated_feed");
    if (savedFeed) {
      try {
        const parsed = JSON.parse(savedFeed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeedItems(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved feed", e);
      }
    }
  }, []);

  // Filter decisions based on selected status badge
  const filteredDecisions =
    filter === "ALL"
      ? feedItems
      : feedItems.filter((d) => (d.decision || (d as any).status) === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Live Decision Feed"
          description="Real-time transaction evaluations reacting to your active policies."
        />
        <div className="flex items-center gap-2">
          {(["ALL", "ALLOW", "BLOCK", "NEEDS_APPROVAL"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === status
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {status === "NEEDS_APPROVAL" ? "APPROVAL" : status}
            </button>
          ))}
        </div>
      </div>

      {filteredDecisions.length > 0 ? (
        <ul className="space-y-3">
          {filteredDecisions.map((decision, idx) => (
            <li key={decision.id || decision.timestamp || idx}>
              <DecisionCard decision={decision} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No decisions matching this filter.
        </div>
      )}
    </div>
  );
}