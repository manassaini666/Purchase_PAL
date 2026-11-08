"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";

export default function ApprovalsPage() {
  const [approvalThreshold, setApprovalThreshold] = useState<number>(20);

  useEffect(() => {
    const saved = localStorage.getItem("activePolicy");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const threshold = parsed.approval_required_above ?? parsed.approval_required?.threshold;
        if (threshold !== undefined) {
          setApprovalThreshold(Number(threshold));
        }
      } catch (e) {
        console.error("Failed to load active policy threshold", e);
      }
    }
  }, []);

  const isExceeded = 28.50 > approvalThreshold;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Approvals Queue"
        description={`Purchases above your automatic threshold ($${approvalThreshold}.00) wait here and on Telegram for your authorization.`}
      />

      {isExceeded ? (
        <div className="p-6 border border-zinc-200 rounded-xl bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-700">
              NEEDS APPROVAL
            </span>
            <span className="font-bold text-zinc-900">$28.50 USD at Merchant B</span>
          </div>
          <p className="text-sm text-zinc-600">
            This $28.50 purchase exceeds your ${approvalThreshold}.00 automatic approval threshold. Waiting for your confirmation.
          </p>
          <div className="flex gap-3 pt-2">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Approve & Capture Payment
            </button>
            <button className="border border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded-lg text-sm font-medium">
              Deny
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-zinc-300 rounded-xl bg-zinc-50 text-zinc-500">
          No pending approvals! Your $28.50 purchase passed automatically under your ${approvalThreshold}.00 threshold.
        </div>
      )}
    </div>
  );
}