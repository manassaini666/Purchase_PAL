"use client";

import { useEffect, useState } from "react";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/disputes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDisputes(data.disputes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load disputes", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">⚖️ AI Judge & Dispute Arbitration</h1>
        <p className="text-gray-400 mb-6">Review automated agent verdicts and active transaction disputes.</p>

        {loading ? (
          <p className="text-gray-500">Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg text-gray-400">
            No active disputes found. Trigger a test dispute via your API to see it here!
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div key={d.id} className="p-5 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs uppercase px-2 py-1 bg-blue-900 text-blue-300 rounded font-semibold mr-2">
                      {d.status}
                    </span>
                    <span className="text-sm text-gray-400">Tx ID: {d.transactionId}</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">${d.amount.toFixed(2)}</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{d.merchantName} ({d.freelancerName})</h3>
                <p className="text-sm text-gray-300 mb-3"><strong className="text-gray-400">Reason:</strong> {d.disputeReason}</p>
                <div className="p-3 bg-black/50 border border-gray-800 rounded text-sm text-purple-300">
                  <strong>AI Verdict:</strong> {d.aiVerdict || "Pending review..."}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}