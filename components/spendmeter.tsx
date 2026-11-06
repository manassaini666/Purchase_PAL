export function SpendMeter({ label, spent, budget, currency = "USD" }: { label: string; spent: number; budget: number; currency?: string }) {
  const percentage = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const isOver = spent > budget;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          ${spent.toFixed(2)} / ${budget.toFixed(2)} {currency} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}