export function TelegramStatusBadge() {
  return (
    <div className="flex items-center gap-1.5 text-sm bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full">
      <span className="text-slate-400">Telegram Webhook:</span>
      <a 
        href="https://t.me/PurchasePalAlerts_Bot" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-semibold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
      >
        @PurchasePalAlerts_Bot
      </a>
    </div>
  );
}