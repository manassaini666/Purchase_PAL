import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { action, email, password } = await request.json();

    if (action === "signup") {
      // Check karo ki user pehle se to nahi hai
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists. Please sign in." }, { status: 400 });
      }

      // New user insert karo
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ email, password }]);

      if (insertError) throw insertError;

      // Default policy config insert/upsert kar do
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

      return NextResponse.json({ success: true, message: "Signup successful!" });
    } 
    
    if (action === "login") {
      // Database me email aur password match karo
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (error || !user) {
        return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Login successful!" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}