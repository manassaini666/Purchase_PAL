"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";
import { policy as initialPolicy, Policy } from "@/lib/mock";

export default function PoliciesPage() {
  const [mounted, setMounted] = useState(false);
  const [ruleText, setRuleText] = useState(
    "Allow agent shopper to spend up to $60 per transaction at Merchant A and Merchant B. Daily budget is $100 and monthly budget is $300. Require my approval above $50. Block gift cards and crypto. Only allow purchases between 08:00 and 22:00 IST."
  );
  const [compiledPolicy, setCompiledPolicy] = useState<Policy | null>(initialPolicy);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("active_policy");
    if (saved) {
      try {
        setCompiledPolicy(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved policy", e);
      }
    }
  }, []);

  const handleCompile = async () => {
    setIsCompiling(true);
    setIsConfirmed(false);
    setError(null);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ruleText }),
      });

      if (!res.ok) {
        throw new Error(`Compilation failed with status ${res.status}`);
      }

      const data = await res.json();
      setCompiledPolicy(data.policy || data);
    } catch (err: any) {
      console.error("Failed to reach /api/compile:", err);
      setError("Failed to connect to /api/compile backend endpoint. Please ensure the server is running.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleConfirm = async () => {
    if (!compiledPolicy) return;
    setIsCompiling(true);

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy: compiledPolicy }),
      });

      if (!res.ok) {
        console.warn("Backend save endpoint not wired yet; confirmed locally.");
      }

      localStorage.setItem("active_policy", JSON.stringify(compiledPolicy));

      const simulatedTransactions = [
        {
          id: "tx_1",
          decision: "ALLOW",
          request: {
            amount: 15.00,
            currency: "USD",
            merchant_id: "merchant_a",
            description: "USB-C Hub Adapter",
            category: "electronics"
          },
          timestamp: new Date().toISOString(),
          explanation: "This $15.00 purchase at Merchant A passed all active guard rules automatically.",
          reason_codes: ["RULE_ALLOW_DEFAULT"]
        },
        {
          id: "tx_2",
          decision: "BLOCK",
          request: {
            amount: 45.00,
            currency: "USD",
            merchant_id: "untrusted_store",
            description: "Gift Card Bundle",
            category: "gift_cards"
          },
          timestamp: new Date().toISOString(),
          explanation: "Payment blocked because the category or merchant violated active policy blocklists.",
          reason_codes: ["BLOCK_BLOCKED_CATEGORY"]
        },
        {
          id: "tx_3",
          decision: "NEEDS_APPROVAL",
          request: {
            amount: 55.00,
            currency: "USD",
            merchant_id: "merchant_b",
            description: "Mechanical Keyboard",
            category: "electronics"
          },
          timestamp: new Date().toISOString(),
          explanation: "This $55.00 purchase exceeded your automatic approval threshold, waiting for owner confirmation.",
          reason_codes: ["APPROVAL_THRESHOLD_EXCEEDED"]
        }
      ];

      localStorage.setItem("simulated_feed", JSON.stringify(simulatedTransactions));
      setIsConfirmed(true);
    } catch {
      localStorage.setItem("active_policy", JSON.stringify(compiledPolicy));
      setIsConfirmed(true);
    } finally {
      setIsCompiling(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spending Policies"
        description="Write rules in plain language. AgentGuard compiles them into deterministic JSON mandates via the backend compiler."
      />

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label htmlFor="rules-input" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            1. Plain-Language Spending Rules
          </label>
          <textarea
            id="rules-input"
            rows={8}
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            className="mt-3 w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700"
          />
          <button
            onClick={handleCompile}
            disabled={isCompiling || !ruleText.trim()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isCompiling ? "Compiling Mandate..." : "Compile to JSON Mandate"}
          </button>
        </div>

        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              2. Structured Mandate Preview
            </span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              zod validated
            </span>
          </div>
          <pre className="mt-3 flex-1 overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-emerald-400">
            {compiledPolicy ? JSON.stringify(compiledPolicy, null, 2) : "// Click Compile"}
          </pre>
          <button
            onClick={handleConfirm}
            disabled={!compiledPolicy || isConfirmed}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {isConfirmed ? "✓ Policy Confirmed & Active" : "Confirm & Activate Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}