"use client";

import { useEffect, useState } from "react";

export default function UserDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Form states for raising a dispute
  const [showForm, setShowForm] = useState(false);
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("50");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: txId || `tx_${Math.floor(Math.random() * 10000)}`,
          amount: parseFloat(amount) || 50.00,
          merchantName: "Sample Merchant",
          disputeReason: reason
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTxId("");
        setReason("");
        setShowForm(false);
        fetchDisputes(); // Refresh list to trigger AI Judge automatically
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header & Raise Dispute Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
            ⚖️ AI Judge & Dispute Status
          </h1>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Track live escrow resolution status and automated AI Judge verdicts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow"
          >
            {showForm ? "Cancel" : "+ Raise Dispute"}
          </button>
          <a 
            href="/admin/disputes" 
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              isDark ? "bg-zinc-900 border-zinc-700 text-purple-400 hover:bg-zinc-800" : "bg-white border-zinc-200 text-purple-600 hover:bg-zinc-50 shadow-sm"
            }`}
          >
            🔒 Admin Portal
          </a>
        </div>
      </div>

      {/* Raise Dispute Modal Form */}
      {showForm && (
        <form onSubmit={handleRaiseDispute} className={`p-6 mb-6 border rounded-xl shadow-lg space-y-4 ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <h3 className="text-lg font-bold">⚠️ Raise New Transaction Dispute</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs opacity-80 block mb-1">Transaction ID</label>
              <input 
                type="text" 
                placeholder="e.g. tx_abc123" 
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className={`w-full p-2 rounded border text-sm ${isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-300"}`}
              />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">Escrow Amount ($)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full p-2 rounded border text-sm ${isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-300"}`}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">Dispute Reason / Details</label>
            <textarea 
              placeholder="Explain why you are raising this dispute..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full p-2 rounded border text-sm h-20 ${isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-300"}`}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold text-sm transition-colors text-white disabled:opacity-50"
          >
            {submitting ? "Submitting & AI Analyzing..." : "Submit to AI Judge"}
          </button>
        </form>
      )}

      {loading ? (
        <div className={`p-12 text-center border rounded-xl shadow-sm ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-500"}`}>
          <p>Loading dispute status...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className={`p-12 text-center border rounded-xl shadow-sm ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center font-bold text-xl ${isDark ? "bg-emerald-950 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>✓</div>
          <h3 className="text-lg font-semibold">No Active Disputes</h3>
          <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>All your transactions are clear and verified.</p>
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
                      ? isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-200' 
                      : isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
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

              <div className={`p-4 border rounded-lg ${
                isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
              }`}>
                <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                  AI Judge Autonomous Verdict
                </span>
                <p className="text-sm font-medium">
                  {d.aiVerdict || "Pending automated evaluation..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}