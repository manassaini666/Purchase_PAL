"use client";

import { useState } from "react";
import { PageHeader } from "@/components/pageheader";
import { policy as initialPolicy, Policy } from "@/lib/mock";

export default function PoliciesPage() {
  const [ruleText, setRuleText] = useState(
  "Allow Shopper Agent to spend up to $50 per transaction at Merchant A and Merchant B. Daily budget is $100 and monthly budget is $300. Require my approval above $20. Block gift cards and crypto. Only allow purchases between 08:00 and 22:00 IST."
);
  const [compiledPolicy, setCompiledPolicy] = useState<Policy | null>(initialPolicy);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCompile = async () => {
    setIsCompiling(true);
    setIsConfirmed(false);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: ruleText }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompiledPolicy(data.policy);
      } else {
        setCompiledPolicy(initialPolicy);
      }
    } catch {
      setCompiledPolicy(initialPolicy);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spending Policies"
        description="Write rules in plain language. Purchase Pal compiles them into deterministic JSON mandates."
      />
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
            onClick={() => setIsConfirmed(true)}
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