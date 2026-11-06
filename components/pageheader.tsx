export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
      {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
    </div>
  );
}