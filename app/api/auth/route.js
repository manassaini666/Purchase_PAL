import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { action, email, password } = await request.json();

    // 1. Signup Action
    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

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

      return NextResponse.json({ success: true, message: "Signup successful!" });
    }

    // 2. Login Action
    if (action === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 401 });
      }

      return NextResponse.json({ success: true, message: "Login successful!", session: data.session });
    }

    // 3. Forgot Password Action
    if (action === "forgot-password") {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${request.headers.get("origin")}/login`,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Password reset link sent successfully!" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}