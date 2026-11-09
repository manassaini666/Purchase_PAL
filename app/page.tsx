"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check karo ki user logged in hai ya nahi
    const userId = localStorage.getItem("purchase_pal_user_id");
    
    if (!userId) {
      // Agar login nahi hai toh login page par bhej do
      router.push("/login");
    } else {
      // Agar login hai toh seedha policies dashboard par bhej do
      router.push("/policies");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-zinc-400 animate-pulse">Loading Purchase Pal...</p>
    </div>
  );
}