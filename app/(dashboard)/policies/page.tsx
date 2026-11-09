"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AskPalWidget from "@/components/AskPalWidget";

export default function PoliciesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [policy, setPolicy] = useState({
    max_spend_per_tx: 63,
    manual_approval_above: 15,
    daily_budget: 150,
    monthly_budget: 300,
    allowed_merchants: "Merchant A, Merchant B",
    blocked_categories: "Gift Cards, Crypto",
    allowed_start_time: "08:00",
    allowed_end_time: "22:00",
  });

  useEffect(() => {
    const userId = localStorage.getItem("purchase_pal_user_id");
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      setMessage("Policies updated successfully!");
    } catch (err: any) {
      setMessage("Failed to save policies.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header & Logout */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-bold text-purple-400">
            Purchase Pal - Policy Manager
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("purchase_pal_user_id");
              router.push("/login");
            }}
            className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded text-sm hover:bg-red-600 hover:text-white transition"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="bg-purple-600/10 border border-purple-500 text-purple-300 p-3 rounded text-sm">
            {message}
          </div>
        )}

        {/* Policy Configuration Form */}
        <form
          onSubmit={handleSave}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-zinc-200 mb-4">
            Spending Mandates & Policies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Max Spend Per Transaction (₹)
              </label>
              <input
                type="number"
                value={policy.max_spend_per_tx}
                onChange={(e) =>
                  setPolicy({ ...policy, max_spend_per_tx: Number(e.target.value) })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Manual Approval Above (₹)
              </label>
              <input
                type="number"
                value={policy.manual_approval_above}
                onChange={(e) =>
                  setPolicy({ ...policy, manual_approval_above: Number(e.target.value) })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Daily Budget Limit (₹)
              </label>
              <input
                type="number"
                value={policy.daily_budget}
                onChange={(e) =>
                  setPolicy({ ...policy, daily_budget: Number(e.target.value) })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Monthly Budget Limit (₹)
              </label>
              <input
                type="number"
                value={policy.monthly_budget}
                onChange={(e) =>
                  setPolicy({ ...policy, monthly_budget: Number(e.target.value) })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Allowed Merchants (comma separated)
            </label>
            <input
              type="text"
              value={policy.allowed_merchants}
              onChange={(e) =>
                setPolicy({ ...policy, allowed_merchants: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Blocked Categories (comma separated)
            </label>
            <input
              type="text"
              value={policy.blocked_categories}
              onChange={(e) =>
                setPolicy({ ...policy, blocked_categories: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={policy.allowed_start_time}
                onChange={(e) =>
                  setPolicy({ ...policy, allowed_start_time: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={policy.allowed_end_time}
                onChange={(e) =>
                  setPolicy({ ...policy, allowed_end_time: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded transition disabled:opacity-50"
          >
            {saving ? "Saving Policies..." : "Save Policies"}
          </button>
        </form>

        {/* 🤖 Ask Pal AI Assistant Widget Integration */}
        <AskPalWidget />

      </div>
    </div>
  );
}