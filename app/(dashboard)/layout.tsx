import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-6">
            <Link href="/policies" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              <span>Purchase Pal</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="/policies" className="hover:text-zinc-900 dark:hover:text-zinc-100">Policies</Link>
              <Link href="/feed" className="hover:text-zinc-900 dark:hover:text-zinc-100">Live Feed</Link>
              <Link href="/approvals" className="hover:text-zinc-900 dark:hover:text-zinc-100">Approvals</Link>
              <Link href="/agent/agent_shopper" className="hover:text-zinc-900 dark:hover:text-zinc-100">Shopper Agent</Link>
            </nav>
          </div>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            PayPal Sandbox
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}