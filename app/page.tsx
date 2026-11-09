"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGuestContinue = () => {
    // Agar pehle se guest ID nahi hai, toh ek random guest ID generate karke save kar lo
    let userId = localStorage.getItem("purchase_pal_user_id");
    if (!userId || userId.startsWith("user_") === false && !userId.includes("@")) {
      userId = "user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("purchase_pal_user_id", userId);
    }
    // Policies dashboard par bhej do
    router.push("/policies");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-2 text-purple-400">Purchase Pal</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          AI-powered smart spending mandate and policy manager. Choose how you'd like to proceed:
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition shadow-lg shadow-purple-900/30"
          >
            Sign In / Sign Up (Cloud Sync)
          </button>

          <button
            onClick={handleGuestContinue}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-3 rounded-lg border border-zinc-700 transition"
          >
            Continue as Guest (Local Mode)
          </button>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Cloud sync allows you to access your policies across multiple devices seamlessly.
        </p>
      </div>
    </div>
  );
}