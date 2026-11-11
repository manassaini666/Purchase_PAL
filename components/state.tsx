import type { ReactNode } from "react";

type BaseStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function LoadingState({
  title = "Loading",
  message = "Please wait a moment.",
  icon = "↻",
}: BaseStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
        <span className="animate-spin" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not complete that action.",
  actionLabel = "Retry",
  onAction,
  icon = "!",
}: BaseStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left shadow-sm dark:border-rose-900/70 dark:bg-rose-950/30">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">{title}</h3>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{message}</p>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/50"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title = "No items yet",
  message = "Nothing to show right now.",
  actionLabel,
  onAction,
  icon = "—",
}: BaseStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
