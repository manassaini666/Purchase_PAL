import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper function to send Telegram alert
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, transaction_id, status } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, error: "User ID missing" }, { status: 400 });
    }

    // 1. Fetch the exact telegram_chat_id for THIS specific user from Supabase database
    const { data: policyConfig, error: dbError } = await supabase
      .from("policy_config")
      .select("telegram_chat_id")
      .eq("user_id", user_id)
      .single();

    let notificationSent = false;

    // 2. Send notification ONLY to this user if chat ID exists
    if (policyConfig && policyConfig.telegram_chat_id) {
      const message = `🔔 *Purchase Pal Alert*\n\nYour transaction has been *${status || 'Approved'}*.\nTransaction ID: \`${transaction_id || 'N/A'}\``;
      await sendTelegramAlert(policyConfig.telegram_chat_id, message);
      notificationSent = true;
    }

    return NextResponse.json({
      success: true,
      message: notificationSent
        ? "Transaction processed & Telegram notification sent to user successfully."
        : "Transaction processed, but user has not configured their Telegram ID.",
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}