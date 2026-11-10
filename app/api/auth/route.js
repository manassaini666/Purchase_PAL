import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { action, email, password } = await request.json();

    if (action === "signup") {
      // Use Supabase Auth signup to handle email verification and token generation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      // Default policy config insert/upsert kar do
      await supabase.from("policy_config").upsert([{
        user_id: data.user?.id || email,
        max_spend_per_tx: 63,
        manual_approval_above: 15,
        daily_budget: 150,
        monthly_budget: 300,
        allowed_merchants: "Merchant A, Merchant B",
        blocked_categories: "Gift Cards, Crypto",
        allowed_start_time: "08:00",
        allowed_end_time: "22:00"
      }]);

      return NextResponse.json({ success: true, message: "Signup successful! Please check your email for verification." });
    }

    if (action === "login") {
      // Use Supabase Auth signInWithPassword to enforce email verification and sessions
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Login successful!", session: data.session });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}