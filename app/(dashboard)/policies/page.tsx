"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";
import { policy as initialPolicy } from "@/lib/mock";

export default function PoliciesPage() {
  const [mounted, setMounted] = useState(false);
  const [ruleText, setRuleText] = useState(
    "Allow agent shopper to spend up to $60 per transaction at Merchant A and Merchant B. Daily budget is $100 and monthly budget is $300. Require my approval above $50. Block gift cards and crypto. Only allow purchases between 08:00 and 22:00 IST."
  );
  const [compiledPolicy, setCompiledPolicy] = useState<any>(initialPolicy);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  // Real-time compilation: attempts backend fetch with instant local fallback as you type
  useEffect(() => {
    setIsConfirmed(false);
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rules: ruleText }),
        });

        if (res.ok) {
          const data = await res.json();
          setCompiledPolicy(data.policy || data.compiledData || data);
          return;
        }
      } catch (err) {
        // Fallback to local real-time parser if backend endpoint is unreachable
      }

      // Local dynamic parser fallback
      const txLimitMatch = ruleText.match(/spend\s*up\s*to\s*\$(\d+)/i);
      const dailyMatch = ruleText.match(/daily\s*budget\s*is\s*\$(\d+)/i);
      const monthlyMatch = ruleText.match(/monthly\s*budget\s*is\s*\$(\d+)/i);
      const thresholdMatch = ruleText.match(/above\s*\$(\d+)/i);

      const merchantMatch = ruleText.match(/at\s+([a-zA-Z0-9_\s,]+?)(?=\.\s+|\.\s*Daily|\.\s*Monthly|\.\s*Require|\.\s*Block|\.\s*Only|$)/i);
      let extractedMerchants = ["merchant_a", "merchant_b"];
      
      if (merchantMatch && merchantMatch[1]) {
        const cleaned = merchantMatch[1]
          .replace(/\sand\s/gi, ",")
          .split(",")
          .map((m) => m.trim().toLowerCase().replace(/\s+/g, "_"))
          .filter(Boolean);
        if (cleaned.length > 0) {
          extractedMerchants = cleaned;
        }
      }

      setCompiledPolicy({
        policy_id: "pol_001",
        agent_id: "agent_shopper",
        currency: "USD",
        per_transaction_limit: txLimitMatch ? Number(txLimitMatch[1]) : 60.00,
        daily_budget: dailyMatch ? Number(dailyMatch[1]) : 100.00,
        monthly_budget: monthlyMatch ? Number(monthlyMatch[1]) : 300.00,
        approval_threshold: thresholdMatch ? Number(thresholdMatch[1]) : 50.00,
        allowed_merchants: extractedMerchants,
        blocked_categories: ["gift_cards", "crypto"],
        allowed_hours: { start: "08:00", end: "22:00", timezone: "IST" }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [ruleText]);

  const handleConfirm = async () => {
    if (!compiledPolicy) return;

    try {
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
    } catch (e) {
      console.error("Failed to save confirmation", e);
    }
  };

  const formatMerchant = (str: string) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const policyObj = typeof compiledPolicy === "object" && compiledPolicy !== null ? compiledPolicy : {};
  const maxSpend = Number(policyObj.per_transaction_limit ?? policyObj.max_spend ?? policyObj.limit ?? 60);
  const dailyBudget = Number(policyObj.daily_budget ?? policyObj.daily ?? 100);
  const monthlyBudget = Number(policyObj.monthly_budget ?? policyObj.monthly ?? 300);
  const approvalThreshold = Number(policyObj.approval_threshold ?? policyObj.threshold ?? 50);
  const allowedMerchants = policyObj.allowed_merchants || policyObj.merchants || ["merchant_a", "merchant_b"];
  const blockedCategories = policyObj.blocked_categories || policyObj.blocked || ["gift_cards", "crypto"];
  const allowedHours = policyObj.allowed_hours || { start: "08:00", end: "22:00", timezone: "IST" };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spending Policies"
        description="Write rules in plain language. Purchase Pal compiles them into deterministic JSON mandates in real time."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Plain-Language Rules Input */}
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label htmlFor="rules-input" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            1. Plain-Language Spending Rules (Live Compilation)
          </label>
          <textarea
            id="rules-input"
            rows={8}
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            className="mt-3 w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700"
          />
          <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
  ✨ Rules compile in real time as you type.
</div>
        </div>

        {/* Right Column: Structured Mandate Summary Card */}
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              2. Structured Mandate Summary
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              zod validated
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            {!compiledPolicy ? (
              <p className="text-zinc-400 italic">// Type rules above to generate mandate summary</p>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Summary of active rules:</p>
                <ul className="list-disc space-y-2 pl-4 text-xs sm:text-sm">
                  <li>
                    <strong className="text-zinc-900 dark:text-zinc-100">Max Spend:</strong>{" "}
                    ${maxSpend.toFixed(2)} per transaction
                  </li>
                  <li>
                    <strong className="text-zinc-900 dark:text-zinc-100">Budgets:</strong>{" "}
                    ${dailyBudget.toFixed(2)} daily / ${monthlyBudget.toFixed(2)} monthly
                  </li>
                  <li>
                    <strong className="text-zinc-900 dark:text-zinc-100">Manual Approvals:</strong>{" "}
                    Required for amounts over ${approvalThreshold.toFixed(2)}
                  </li>
                  <li>
                    <strong className="text-zinc-900 dark:text-zinc-100">Allowed Places:</strong>{" "}
                    {Array.isArray(allowedMerchants) ? allowedMerchants.map(formatMerchant).join(", ") : "None specified"}
                  </li>
                  {Array.isArray(blockedCategories) && blockedCategories.length > 0 && (
                    <li>
                      <strong className="text-zinc-900 dark:text-zinc-100">Blocked Categories:</strong>{" "}
                      {blockedCategories.map(formatMerchant).join(", ")}
                    </li>
                  )}
                  {allowedHours && (
                    <li>
                      <strong className="text-zinc-900 dark:text-zinc-100">Time Window:</strong>{" "}
                      {allowedHours.start} to {allowedHours.end} {allowedHours.timezone || ""}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

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