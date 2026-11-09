import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    if (action === "signup") {
      const { data: existing } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
      if (existing) {
        return NextResponse.json({ success: false, error: "User already exists! Please login." }, { status: 400 });
      }

      const { error: insertError } = await supabase.from("users").insert([{ email, password }]);
      if (insertError) throw insertError;

      // Insert default policy for new user
      await supabase.from("policy_config").upsert([{
        user_id: email,
        max_spend_per_tx: 63,
        manual_approval_above: 15,
        daily_budget: 150,
        monthly_budget: 300,
        allowed_merchants: "Merchant A, Merchant B",
        blocked_categories: "Gift Cards, Crypto",
        allowed_start_time: "08:00",
        allowed_end_time: "22:00"
      }]);

      return NextResponse.json({ success: true, message: "Signup successful!", email });
    } 
    
    if (action === "login") {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (error || !user) {
        return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Login successful!", email });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}