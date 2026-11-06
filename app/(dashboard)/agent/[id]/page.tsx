import { Card } from "@/components/card";
import { DecisionCard } from "@/components/decisioncard";
import { PageHeader } from "@/components/pageheader";
import { SpendMeter } from "@/components/spendmeter";
import { decisions, policy, spend } from "@/lib/mock";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  const formattedTitle =
    id === policy.agent_id
      ? "Shopper Agent"
      : id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const dailyBudget = policy.daily_budget ?? spend.daily.budget;
  const monthlyBudget = policy.monthly_budget ?? spend.monthly.budget;
  const currency = policy.currency ?? "USD";

  return (
    <div className="space-y-6">
      <PageHeader title={formattedTitle} description={`Spending guardrails and budget meters for ${id}.`} />
      <div className="space-y-6">
        <Card title="Spending Limits & Meters">
          <div className="space-y-5">
            <SpendMeter label="Today (Daily Budget)" spent={spend.daily.spent} budget={dailyBudget} currency={currency} />
            <SpendMeter label="This Month (Monthly Budget)" spent={spend.monthly.spent} budget={monthlyBudget} currency={currency} />
          </div>
        </Card>
        <section aria-labelledby="recent-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Decisions
            </h2>
            <span className="text-xs text-zinc-500">Last 3 evaluations</span>
          </div>
          {decisions && decisions.length > 0 ? (
            <ul className="space-y-3">
              {decisions.slice(0, 3).map((decision, index) => (
                <li key={decision.id || decision.timestamp || index}>
                  <DecisionCard decision={decision} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              No recent payment decisions recorded for this agent.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}