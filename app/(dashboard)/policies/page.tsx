"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";
import { policy as initialPolicy, Policy } from "@/lib/mock";

export default function PoliciesPage() {
  const [ruleText, setRuleText] = useState(
    "Allow Shopper Agent to spend up to $50 per transaction at Merchant A and Merchant B. Daily budget is $100 and monthly budget is $300. Require my approval above $100. Block gift cards and crypto. Only allow purchases between 08:00 and 22:00 IST."
  );
  const [compiledPolicy, setCompiledPolicy] = useState<Policy | null>(initialPolicy);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved rule text and active policy on mount
  useEffect(() => {
    const savedRule = localStorage.getItem("ruleText");
    const savedPolicy = localStorage.getItem("activePolicy");
    if (savedRule) {
      setRuleText(savedRule);
    }
    if (savedPolicy) {
      try {
        const parsed = JSON.parse(savedPolicy);
        setCompiledPolicy(parsed);
        setIsConfirmed(true);
      } catch (e) {
        console.error("Failed to parse saved policy", e);
      }
    }
  }, []);

  const handleCompile = async () => {
    setIsCompiling(true);
    setIsConfirmed(false);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ruleText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.policy) {
          setCompiledPolicy(data.policy);
        } else {
          setCompiledPolicy(initialPolicy);
        }
      } else {
        setCompiledPolicy(initialPolicy);
      }
    } catch (err) {
      console.error("Compilation error:", err);
      setCompiledPolicy(initialPolicy);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleActivate = async () => {
    if (!compiledPolicy) return;
    setIsSaving(true);
    try {
      let mandateObj = compiledPolicy;
      if ((compiledPolicy as any).choices && (compiledPolicy as any).choices[0]) {
        mandateObj = JSON.parse((compiledPolicy as any).choices[0].message.content);
      }
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: mandateObj.policy_id || "pol_001",
          agentId: mandateObj.agent_id || "agent_shopper",
          rawPrompt: ruleText,
          mandateJson: mandateObj,
          expiresAt: mandateObj.expires_at || "2026-11-30T00:00:00Z",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsConfirmed(true);
        localStorage.setItem("activePolicy", JSON.stringify(mandateObj));
        localStorage.setItem("ruleText", ruleText);
      } else {
        alert("Failed to save policy: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving policy:", err);
      alert("Network or parsing error while saving policy.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Spending Policies"
        description="Write rules in plain language. Purchase Pal compiles them into deterministic JSON mandates."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <label htmlFor="rules-input" className="text-sm font-semibold text-zinc-800">
            1. Plain-Language Spending Rules
          </label>
          <textarea
            id="rules-input"
            rows={8}
            value={ruleText}
            onChange={(e) => {
              const val = e.target.value;
              setRuleText(val);
              localStorage.setItem("ruleText", val);
              setIsConfirmed(false);
            }}
            className="mt-3 w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleCompile}
            disabled={isCompiling || !ruleText.trim()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
          >
            {isCompiling ? "Compiling Mandate..." : "Compile to JSON Mandate"}
          </button>
        </div>

        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-800">2. Structured Mandate Preview</span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600">zod validated</span>
          </div>
          <pre className="mt-3 flex-1 overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-200">
            {compiledPolicy ? JSON.stringify(compiledPolicy, null, 2) : "// Click Compile to preview mandate"}
          </pre>
          <button
            onClick={handleActivate}
            disabled={!compiledPolicy || isSaving}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isConfirmed ? "✓ Policy Confirmed & Active" : "Confirm & Activate Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}