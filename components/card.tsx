import { ReactNode } from "react";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {title && <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>}
      {children}
    </div>
  );
}