"use client";

import { useEffect, useState } from "react";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Automatically detect dark mode state changes from the layout/header
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

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/disputes");
      const data = await res.json();
      if (data.success) setDisputes(data.disputes);
    } catch (err) {
      console.error("Failed to load disputes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, decision: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/disputes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDisputes();
      }
    } catch (err) {
      console.error("Failed to resolve dispute", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
          ⚖️ AI Judge & Dispute Arbitration
        </h1>
        <p className={`mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Review automated agent verdicts, analyze transaction evidence, and execute final arbitration.
        </p>
      </div>

      {loading ? (
        <div className={`p-12 text-center border rounded-xl shadow-sm ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-500"}`}>
          <p>Loading dispute arbitration queue...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className={`p-12 text-center border rounded-xl shadow-sm ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center font-bold text-xl ${isDark ? "bg-emerald-950 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>✓</div>
          <h3 className="text-lg font-semibold">No Active Disputes</h3>
          <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>All transaction disputes have been successfully resolved by the AI Judge.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div 
              key={d.id} 
              className={`p-6 border rounded-xl shadow-sm transition-all ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs uppercase px-2.5 py-1 rounded-full font-semibold border ${
                    d.status === 'PENDING_ARBITRATION' 
                      ? isDark 
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800' 
                        : 'bg-amber-100 text-amber-800 border-amber-200' 
                      : isDark 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {d.status}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>ID: {d.transactionId}</span>
                </div>
                <span className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>${d.amount.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                <h3 className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                  {d.merchantName} <span className={`text-sm font-normal ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>({d.freelancerName})</span>
                </h3>
                <p className={`text-sm mt-1 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                  <strong className={isDark ? "text-zinc-200" : "text-zinc-900"}>Dispute Reason:</strong> {d.disputeReason}
                </p>
              </div>

              {/* AI Verdict Inner Box with active dark/light state background */}
              <div className={`p-4 border rounded-lg mb-5 ${
                isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                    AI Judge Analysis
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {d.aiVerdict || "Analyzing milestone proof and communication logs..."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className={`flex flex-wrap items-center justify-end gap-3 pt-3 border-t ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                <button
                  disabled={processingId === d.id}
                  onClick={() => handleResolve(d.id, "REFUND_BUYER")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    isDark 
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100" 
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  }`}
                >
                  Refund Buyer
                </button>
                <button
                  disabled={processingId === d.id}
                  onClick={() => handleResolve(d.id, "RELEASE_MERCHANT")}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
                >
                  Release to Merchant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}