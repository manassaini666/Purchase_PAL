"use client";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";

export default function ApprovalsPage() {
  const [threshold, setThreshold] = useState(32);
  const txAmount = 28.50; // Test transaction amount

  const requiresApproval = txAmount > threshold;
  const decisionStatus = requiresApproval ? "NEEDS_APPROVAL" : "ALLOW";

  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedPolicies = localStorage.getItem("purchase_pal_policies");
    if (savedPolicies) {
      try {
        const parsed = JSON.parse(savedPolicies);
        const limit = parseFloat(parsed.manual_approval_above) || 32;
        setThreshold(limit);

        if (txAmount <= limit) {
          setStatus("auto-approved");
          setMessage(`✅ Transaction of $${txAmount} is within your auto-approval threshold ($${limit}). Automatically approved!`);
        } else {
          setStatus("pending");
          setMessage("");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      if (txAmount <= threshold) {
        setStatus("auto-approved");
        setMessage(`✅ Transaction of $${txAmount} is within your threshold ($${threshold}). Automatically approved!`);
      }
    }
  }, []);

  const handleApprove = () => {
    setLoading(true);
    setStatus("approved");
    setMessage("✅ Transaction manually approved successfully! Telegram notification sent.");
    setLoading(false);
  };

  const handleReject = () => {
    setLoading(true);
    setStatus("rejected");
    setMessage("❌ Transaction rejected successfully.");
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10 text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-purple-400">Approvals Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">Current Manual Approval Threshold: <span className="text-purple-300 font-mono">${threshold}</span></p>
        </div>
        <button
          onClick={() => {
            setStatus("pending");
            setMessage("");
          }}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 text-purple-300 transition cursor-pointer"
        >
          Reset Test Queue
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 shadow-xl backdrop-blur transition-colors text-center">
        <div className="mb-4">
          <StatusBadge status={decisionStatus} />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm border ${status === "auto-approved" || status === "approved" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : status === "rejected" ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-amber-500/10 border-amber-500/25 text-amber-400"}`}>
            {message}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
          {status === "pending" ? (
            <>
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400 text-xl font-bold">
                !
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pending Approval Required</h3>
                <p className="text-sm text-zinc-400 mt-1">Your ${txAmount} purchase exceeds your threshold (${threshold}) and requires manual authorization.</p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 font-medium px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 disabled:opacity-50 text-white cursor-pointer"
                >
                  {loading ? "Processing..." : "Approve Transaction"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 font-medium px-6 py-3 rounded-xl text-sm transition text-red-400 disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </>
          ) : status === "auto-approved" || status === "approved" ? (
            <div className="py-8 space-y-2">
              <div className="text-emerald-400 text-3xl font-bold">✓ {status === "auto-approved" ? "Auto-Approved" : "Approved"}</div>
              <p className="text-sm text-zinc-400">This transaction successfully bypassed manual approval based on your policy settings.</p>
            </div>
          ) : (
            <div className="py-8 space-y-2">
              <div className="text-red-400 text-3xl font-bold">✕ Rejected</div>
              <p className="text-sm text-zinc-400">This transaction has been successfully blocked.</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        merchant_a and merchant_b are demo labels. All sandbox payments go to one sandbox merchant account.
      </p>
    </div>
  );
}
