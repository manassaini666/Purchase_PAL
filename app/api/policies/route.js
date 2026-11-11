import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || "default-user";

    let { data: policy } = await supabase.from("policy_config").select("*").eq("user_id", userId).maybeSingle();

    if (!policy) {
      await supabase.from("policy_config").insert([{
        user_id: userId,
        max_spend_per_tx: 63,
        manual_approval_above: 15,
        daily_budget: 150,
        monthly_budget: 300,
        allowed_merchants: "Merchant A, Merchant B",
        blocked_categories: "Gift Cards, Crypto",
        allowed_start_time: "08:00",
        allowed_end_time: "22:00"
      }]);

      const res = await supabase.from("policy_config").select("*").eq("user_id", userId).single();
      policy = res.data;
    }

    // Map database snake_case to frontend camelCase
    const formattedPolicy = {
      maxSpendPerTx: policy.max_spend_per_tx,
      manualApprovalAbove: policy.manual_approval_above,
      dailyBudget: policy.daily_budget,
      monthlyBudget: policy.monthly_budget,
      allowedMerchants: policy.allowed_merchants,
      blockedCategories: policy.blocked_categories,
      allowedStartTime: policy.allowed_start_time,
      allowedEndTime: policy.allowed_end_time,
    };

    return NextResponse.json({ success: true, policy: formattedPolicy });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...fields } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const dbFields = { user_id: userId, updated_at: new Date() };
    if (fields.maxSpendPerTx !== undefined) dbFields.max_spend_per_tx = fields.maxSpendPerTx;
    if (fields.manualApprovalAbove !== undefined) dbFields.manual_approval_above = fields.manualApprovalAbove;
    if (fields.dailyBudget !== undefined) dbFields.daily_budget = fields.dailyBudget;
    if (fields.monthlyBudget !== undefined) dbFields.monthly_budget = fields.monthlyBudget;
    if (fields.allowedMerchants !== undefined) dbFields.allowed_merchants = fields.allowedMerchants;
    if (fields.blockedCategories !== undefined) dbFields.blocked_categories = fields.blockedCategories;
    if (fields.allowedStartTime !== undefined) dbFields.allowed_start_time = fields.allowedStartTime;
    if (fields.allowedEndTime !== undefined) dbFields.allowed_end_time = fields.allowedEndTime;

    const { error } = await supabase.from("policy_config").upsert(dbFields, { onConflict: "user_id" });
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Cloud-synced with Supabase successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}