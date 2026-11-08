"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/pageheader";

export default function FeedPage() {
  const [approvalThreshold, setApprovalThreshold] = useState<number>(20);

  useEffect(() => {
    const saved = localStorage.getItem("activePolicy");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Support both flat and nested threshold structures
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

  const transactions = [
    {
      id: "tx_1",
      amount: 12.00,
      merchant: "Merchant A",
      time: "20:02:00",
      type: "ALLOW",
      item: "item_usb_hub",
      category: "electronics",
      description: "This $12.00 purchase at Merchant A passed all guard rules and was completed automatically via PayPal sandbox.",
      status: "ALLOWED"
    },
    {
      id: "tx_2",
      amount: 45.00,
      merchant: "Untrusted Store",
      time: "20:40:00",
      type: "BLOCK",
      item: "item_gift_card",
      category: "gift_cards",
      description: "Payment was blocked because Untrusted Store is not on your allowed merchant list.",
      status: "MERCHANT_NOT_ALLOWED"
    },
    {
      id: "tx_3",
      amount: 28.50,
      merchant: "Merchant B",
      time: "21:35:00",
      type: isExceeded ? "APPROVAL" : "ALLOW",
      item: "item_keyboard",
      category: "electronics",
      status: isExceeded ? "NEEDS_APPROVAL" : "ALLOWED",
      description: isExceeded
        ? `This $28.50 purchase exceeds your $${approvalThreshold}.00 automatic approval threshold. Waiting for your confirmation.`
        : `This $28.50 purchase is within your $${approvalThreshold}.00 threshold and passed automatically.`
    }
  ];

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Live Decision Feed"
        description="Real-time deterministic guard evaluations and plain-language explanations."
      />

      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg">ALL</span>
        </div>
        <p className="text-xs text-zinc-600 font-medium">
          Active Approval Threshold: <span className="font-bold text-black">${approvalThreshold}.00</span>
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  tx.type === 'ALLOW' ? 'bg-green-100 text-green-700' :
                  tx.type === 'BLOCK' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {tx.type}
                </span>
                <span className="font-bold text-zinc-900">${tx.amount.toFixed(2)} USD</span>
                <span className="text-zinc-500">@ {tx.merchant}</span>
              </div>
              <span className="text-xs text-zinc-400">{tx.time}</span>
            </div>
            <p className="text-sm text-zinc-600">{tx.description}</p>
            <div className="text-xs text-zinc-500 font-mono">
              Item: {tx.item} • Category: {tx.category} <span className="float-right font-bold text-zinc-700">{tx.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}