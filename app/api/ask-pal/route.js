import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { userId, question } = await request.json();

    // 1. Fetch user policy configuration from Supabase database
    const { data: policy } = await supabase
      .from("policy_config")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const lowerQ = question.toLowerCase();
    const maxSpend = policy?.max_spend_per_tx ?? 63;
    const manualApproval = policy?.manual_approval_above ?? 15;
    const dailyBudget = policy?.daily_budget ?? 150;
    const monthlyBudget = policy?.monthly_budget ?? 300;
    const allowedMerchants = policy?.allowed_merchants || "Merchant A, Merchant B";
    const blockedCategories = policy?.blocked_categories || "Gift Cards, Crypto";
    const startTime = policy?.allowed_start_time || "08:00";
    const endTime = policy?.allowed_end_time || "22:00";

    let answer = "";

    // 2. Advanced Conversational Intelligence Engine
    if (lowerQ.includes("time") || lowerQ.includes("timing") || lowerQ.includes("hour") || lowerQ.includes("schedule") || lowerQ.includes("when")) {
      answer = `Your active operational spending hours are set from ${startTime} to ${endTime}. Transactions attempted outside these hours will require review.`;
    } 
    else if (lowerQ.includes("budget") || lowerQ.includes("daily") || lowerQ.includes("monthly") || lowerQ.includes("limit")) {
      answer = `Here are your current active budget limits: $${dailyBudget} per day and $${monthlyBudget} per month.`;
    } 
    else if (lowerQ.includes("transaction") || lowerQ.includes("spend") || lowerQ.includes("per tx")) {
      answer = `Your policy permits a maximum spend of $${maxSpend} per single transaction. Any amount above $${manualApproval} requires manual approval.`;
    } 
    else if (lowerQ.includes("merchant") || lowerQ.includes("store") || lowerQ.includes("shop") || lowerQ.includes("where")) {
      answer = `Your approved and whitelisted merchants are: ${allowedMerchants}.`;
    } 
    else if (lowerQ.includes("block") || lowerQ.includes("category") || lowerQ.includes("ban") || lowerQ.includes("restricted")) {
      answer = `Your currently blocked or restricted categories are: ${blockedCategories}.`;
    } 
    else if (lowerQ.includes("buy") || lowerQ.includes("afford") || lowerQ.includes("purchase") || lowerQ.includes("keyboard") || lowerQ.includes("mac") || lowerQ.includes("laptop") || lowerQ.includes("can i")) {
      answer = `Based on your rules, you can spend up to $${maxSpend} per transaction without manual review. Purchases above $${manualApproval} need approval, and make sure you're shopping within your allowed hours (${startTime} to ${endTime})!`;
    } 
    else {
      answer = `Hello! I'm your Purchase Pal assistant. I've reviewed your active policies: your max spend per transaction is $${maxSpend}, daily budget is $${dailyBudget}, and allowed hours are ${startTime} to ${endTime}. Feel free to ask me about your budget, transaction limits, approved merchants, or timings!`;
    }

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}