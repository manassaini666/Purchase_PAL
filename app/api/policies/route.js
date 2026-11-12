import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper function to send Telegram alert to specific user
async function sendTelegramAlert(chatId, text) {
  if (!chatId) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Failed to send telegram notification:", err);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("policy_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, config: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      user_id,
      max_spend_per_tx,
      manual_approval_above,
      daily_budget,
      monthly_budget,
      allowed_merchants,
      blocked_categories,
      allowed_start_time,
      allowed_end_time,
      telegram_chat_id,
    } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("policy_config")
      .upsert([
        {
          user_id,
          max_spend_per_tx,
          manual_approval_above,
          daily_budget,
          monthly_budget,
          allowed_merchants,
          blocked_categories,
          allowed_start_time,
          allowed_end_time,
          telegram_chat_id,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Optional: Send a test confirmation message to user's telegram once saved
    if (telegram_chat_id) {
      await sendTelegramAlert(
        telegram_chat_id,
        "🎉 *Purchase Pal Connected!*\nYour policies and Telegram alerts have been successfully activated."
      );
    }

    return NextResponse.json({ success: true, config: data[0] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}