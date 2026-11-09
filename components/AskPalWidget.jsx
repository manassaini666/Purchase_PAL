"use client";
import { useState } from "react";

export default function AskPalWidget() {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: "ai", text: "Hi! Ask me anything about your budget and spending policies." }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userEmail = localStorage.getItem("purchase_pal_user_id") || "manassaini666@gmail.com";
    const newLog = [...chatLog, { sender: "user", text: question }];
    setChatLog(newLog);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask-pal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userEmail, question }),
      });
      const data = await res.json();

      if (data.success) {
        setChatLog([...newLog, { sender: "ai", text: data.answer }]);
      } else {
        setChatLog([...newLog, { sender: "ai", text: `❌ Error: ${data.error}` }]);
      }
    } catch (err) {
      setChatLog([...newLog, { sender: "ai", text: "❌ Network error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-lg mx-auto text-white mt-6 shadow-xl">
      <h3 className="text-lg font-bold text-purple-400 mb-3">🤖 Ask Pal (AI Financial Assistant)</h3>
      
      <div className="h-48 overflow-y-auto space-y-2 bg-zinc-950 p-3 rounded mb-3 text-sm border border-zinc-800">
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${msg.sender === "user" ? "bg-purple-600/20 text-purple-200 text-right" : "bg-zinc-800 text-zinc-200"}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div className="text-zinc-500 text-xs italic">Pal is thinking...</div>}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Can I buy a new keyboard?"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-purple-500"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium transition">
          Ask
        </button>
      </form>
    </div>
  );
}