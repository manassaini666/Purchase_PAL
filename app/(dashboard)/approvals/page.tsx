"use client";

import { useEffect, useState } from "react";

export default function ApprovalsPage() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [manualApprovalAbove, setManualApprovalAbove] = useState(15);
  const [pendingAmount] = useState(28.50); // Example pending transaction amount

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlHasDark = document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
      setIsDark(htmlHasDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Fetch the user's actual saved policy threshold dynamically
  useEffect(() => {
    const uid = localStorage.getItem("purchase_pal_user_id") || "default-user";
    
    fetch(`/api/policies?userId=${uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.policy) {
          setManualApprovalAbove(data.policy.manualApprovalAbove);
        }
      })
      .catch((err) => console.error("Failed to load policy threshold", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`p-12 text-center ${isDark ? "text-zinc-400 bg-zinc-950" : "text-zinc-600 bg-zinc-50"} min-h-screen`}>
        Loading approvals queue...
      </div>
    );
  }

  // Correct logic: Only require approval if amount is GREATER than threshold
  const needsApproval = pendingAmount > manualApprovalAbove;

  return (
    <div className={`min-h-screen p-6 md:p-10 ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold">Approvals Queue</h1>
          <p className="text-xs opacity-60 mt-1">
            Purchases above your automatic threshold (${manualApprovalAbove}) wait here and on Telegram for your authorization.
          </p>
        </div>

        {needsApproval ? (
          <div className={`p-8 border rounded-xl shadow-sm text-center space-y-4 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/20">
              !
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">Pending Approval Required</h3>
              <p className="text-sm opacity-75">
                Your ${pendingAmount.toFixed(2)} purchase exceeds your ${manualApprovalAbove} threshold and requires manual authorization.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button 
                onClick={() => alert("Transaction approved successfully!")}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-sm"
              >
                Approve Transaction
              </button>
              <button 
                onClick={() => alert("Transaction rejected!")}
                className="px-5 py-2.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 font-semibold text-sm transition"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-12 border rounded-xl shadow-sm text-center space-y-2 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl border border-emerald-500/20">
              ✓
            </div>
            <h3 className="text-lg font-bold">No Pending Approvals</h3>
            <p className="text-sm opacity-75">
              Your recent transactions are within your automatic threshold (${manualApprovalAbove}). All clear!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}