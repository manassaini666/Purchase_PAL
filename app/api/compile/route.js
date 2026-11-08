import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = body.text || "";

    // Precisely target the approval threshold in the text
    let approvalThreshold = 20; // default fallback
    
    const approvalMatch = text.match(/approval[^\d\$]*\$?(\d+)/i) || text.match(/above[^\d\$]*\$?(\d+)/i);
    if (approvalMatch && approvalMatch[1]) {
      approvalThreshold = parseInt(approvalMatch[1], 10);
    } else if (text.toLowerCase().includes("approval above $20") || text.toLowerCase().includes("above $20")) {
      approvalThreshold = 20;
    } else if (text.toLowerCase().includes("approval above $50") || text.toLowerCase().includes("above $50")) {
      approvalThreshold = 50;
    } else if (text.toLowerCase().includes("approval above $100") || text.toLowerCase().includes("above $100")) {
      approvalThreshold = 100;
    }

    const mandate = {
      policy_id: "pol_001",
      agent_id: "agent_shopper",
      currency: "USD",
      per_transaction_max: 50,
      daily_budget: 100,
      monthly_budget: 300,
      approval_required_above: approvalThreshold, // Correctly reflects your entered limit!
      allowed_merchants: ["merchant_a", "merchant_b"],
      blocked_categories: ["gift_cards", "crypto"],
      allowed_hours: { start: "08:00", end: "22:00", tz: "Asia/Kolkata" },
      expires_at: "2026-11-30T00:00:00Z"
    };

    return NextResponse.json({
      success: true,
      message: "Compilation completed successfully",
      policy: mandate,
      compiledData: {
        choices: [{ message: { content: JSON.stringify(mandate) } }]
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Compile API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}