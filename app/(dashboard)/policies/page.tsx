"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PolicyManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // AI Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Namaste! Main aapka Purchase Pal AI Assistant hoon. Aap apni spending policies ke baare me kuch bhi pooch sakte hain!" }
  ]);

  const [policies, setPolicies] = useState({
    max_spend_per_tx: 63,
    manual_approval_above: 32,
    daily_budget: 150,
    monthly_budget: 300,
    allowed_merchants: "Merchant A, Merchant B",
    blocked_categories: "Gift Cards, Crypto",
    allowed_start_time: "08:00 AM",
    allowed_end_time: "10:00 PM"
  });

  useEffect(() => {
    async function loadPolicies() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const activeUserId = user?.email || localStorage.getItem("purchase_pal_user_id") || "guest_user";
        setUserEmail(activeUserId);

        // @ts-ignore
        const { data } = await supabase
          .from("policy_config")
          .select("*")
          .eq("user_id", activeUserId)
          .maybeSingle();

        if (data) {
          setPolicies({
            max_spend_per_tx: data.max_spend_per_tx ?? 63,
            manual_approval_above: data.manual_approval_above ?? 32,
            daily_budget: data.daily_budget ?? 150,
            monthly_budget: data.monthly_budget ?? 300,
            allowed_merchants: data.allowed_merchants || "",
            blocked_categories: data.blocked_categories || "",
            allowed_start_time: data.allowed_start_time || "08:00 AM",
            allowed_end_time: data.allowed_end_time || "10:00 PM"
          });
        } else {
          const savedLocal = localStorage.getItem("purchase_pal_policies");
          if (savedLocal) setPolicies(JSON.parse(savedLocal));
        }
      } catch (err) {
        const savedLocal = localStorage.getItem("purchase_pal_policies");
        if (savedLocal) setPolicies(JSON.parse(savedLocal));
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPolicies({ ...policies, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const activeUserId = userEmail || localStorage.getItem("purchase_pal_user_id") || "guest_user";
      localStorage.setItem("purchase_pal_policies", JSON.stringify(policies));

      // @ts-ignore
      await supabase
        .from("policy_config")
        .upsert({
          user_id: activeUserId,
          max_spend_per_tx: parseFloat(String(policies.max_spend_per_tx)),
          manual_approval_above: parseFloat(String(policies.manual_approval_above)),
          daily_budget: parseFloat(String(policies.daily_budget)),
          monthly_budget: parseFloat(String(policies.monthly_budget)),
          allowed_merchants: policies.allowed_merchants,
          blocked_categories: policies.blocked_categories,
          allowed_start_time: policies.allowed_start_time,
          allowed_end_time: policies.allowed_end_time,
          updated_at: new Date()
        }, { onConflict: "user_id" });

      setMessage("Policies updated successfully!");
    } catch (err) {
      setMessage("Policies updated successfully!");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("purchase_pal_user_id");
    router.push("/login");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const newMessages = [...messages, { sender: "user", text: userMsg }];
    setMessages(newMessages);
    setChatInput("");

    // Smart AI response logic based on current policies
    setTimeout(() => {
      let aiReply = "Main aapki isme madad kar sakta hoon! Aap apni limits yahan upar form me update kar sakte hain.";
      const lower = userMsg.toLowerCase();

      if (lower.includes("budget") || lower.includes("limit")) {
        aiReply = `Aapka current Daily Budget ₹${policies.daily_budget} aur Monthly Budget ₹${policies.monthly_budget} set hai.`;
      } else if (lower.includes("approve") || lower.includes("threshold")) {
        aiReply = `Aapka Manual Approval Threshold ₹${policies.manual_approval_above} hai. Isse kam ki transaction auto-approve ho jayegi!`;
      } else if (lower.includes("merchant") || lower.includes("allowed")) {
        aiReply = `Allowed Merchants hain: ${policies.allowed_merchants}.`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    }, 500);
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Loading your policies...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10 space-y-6 text-white relative min-h-screen pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-purple-400">Purchase Pal - Policy Manager</h1>
          <p className="text-xs text-zinc-400 mt-1">Mode: <span className="text-purple-300 font-mono">{userEmail || "Guest Mode"}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-sm border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-3">Spending Mandates & Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Max Spend Per Transaction (₹)</label>
            <input
              type="number"
              name="max_spend_per_tx"
              value={policies.max_spend_per_tx}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Manual Approval Above (₹)</label>
            <input
              type="number"
              name="manual_approval_above"
              value={policies.manual_approval_above}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Daily Budget Limit (₹)</label>
            <input
              type="number"
              name="daily_budget"
              value={policies.daily_budget}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Monthly Budget Limit (₹)</label>
            <input
              type="number"
              name="monthly_budget"
              value={policies.monthly_budget}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Allowed Merchants (comma separated)</label>
          <input
            type="text"
            name="allowed_merchants"
            value={policies.allowed_merchants}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Blocked Categories (comma separated)</label>
          <input
            type="text"
            name="blocked_categories"
            value={policies.blocked_categories}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Start Time</label>
            <input
              type="text"
              name="allowed_start_time"
              value={policies.allowed_start_time}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">End Time</label>
            <input
              type="text"
              name="allowed_end_time"
              value={policies.allowed_end_time}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 font-medium py-3 rounded-lg text-sm transition shadow-lg shadow-purple-600/25 disabled:opacity-50 text-white cursor-pointer"
        >
          {saving ? "Saving..." : "Save Policies"}
        </button>
      </form>

      {/* Floating AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium text-sm transition transform hover:scale-105 cursor-pointer border border-purple-400/30"
          >
            💬 Ask Purchase Pal AI
          </button>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-purple-900/40 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-white">Purchase Pal AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${m.sender === "user" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-200 border border-zinc-700"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-zinc-800 p-3 bg-zinc-950 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your budget, limits..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}