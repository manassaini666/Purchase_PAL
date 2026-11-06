export interface Policy {
  policy_id: string;
  agent_id: string;
  currency: string;
  per_transaction_max: number;
  daily_budget: number;
  monthly_budget: number;
  approval_required_above: number;
  allowed_merchants: string[];
  blocked_categories: string[];
  allowed_hours: { start: string; end: string; tz: string };
  expires_at: string;
}

export type DecisionType = "ALLOW" | "BLOCK" | "NEEDS_APPROVAL";

export interface DecisionRecord {
  id?: string;
  decision: DecisionType;
  reason_codes: string[];
  policy_id: string;
  request: {
    merchant_id: string;
    item_id?: string;
    amount: number;
    currency: string;
    category?: string;
  };
  explanation: string;
  timestamp: string;
}

export const policy: Policy = {
  policy_id: "pol_001",
  agent_id: "agent_shopper",
  currency: "USD",
  per_transaction_max: 50,
  daily_budget: 100,
  monthly_budget: 300,
  approval_required_above: 20,
  allowed_merchants: ["merchant_a", "merchant_b"],
  blocked_categories: ["gift_cards", "crypto"],
  allowed_hours: { start: "08:00", end: "22:00", tz: "Asia/Kolkata" },
  expires_at: "2026-11-30T00:00:00Z",
};

export const spend = {
  daily: { spent: 32, budget: 100 },
  monthly: { spent: 140, budget: 300 },
};

export const decisions: DecisionRecord[] = [
  {
    id: "dec_1",
    decision: "ALLOW",
    reason_codes: ["ALLOWED"],
    policy_id: "pol_001",
    request: { merchant_id: "merchant_a", item_id: "item_usb_hub", amount: 12.0, currency: "USD", category: "electronics" },
    explanation: "This $12.00 purchase at merchant_a passed all guard rules and was completed automatically via PayPal sandbox.",
    timestamp: "2026-11-05T14:32:00Z",
  },
  {
    id: "dec_2",
    decision: "BLOCK",
    reason_codes: ["MERCHANT_NOT_ALLOWED"],
    policy_id: "pol_001",
    request: { merchant_id: "untrusted_store", item_id: "item_gift_card", amount: 45.0, currency: "USD", category: "gift_cards" },
    explanation: "Payment was blocked because untrusted_store is not on your allowed merchant list.",
    timestamp: "2026-11-05T15:10:00Z",
  },
  {
    id: "dec_3",
    decision: "NEEDS_APPROVAL",
    reason_codes: ["NEEDS_APPROVAL"],
    policy_id: "pol_001",
    request: { merchant_id: "merchant_b", item_id: "item_keyboard", amount: 28.5, currency: "USD", category: "electronics" },
    explanation: "This $28.50 purchase exceeds your $20.00 automatic approval threshold. Waiting for your confirmation.",
    timestamp: "2026-11-05T16:05:00Z",
  },
];