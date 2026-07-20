import { Link } from "../../components/Link";

const PROMPT_IDEAS: { category: string; prompts: string[] }[] = [
  {
    category: "Banker leaderboards",
    prompts: [
      "Banker leaderboard: total fees generated this year, ranked descending",
      "Coverage team performance: total deal value and average fee by coverage_team",
      "Bankers with the most active (non-closed, non-dead) deals right now",
    ],
  },
  {
    category: "Client & sector insights",
    prompts: [
      "Total deal value by sector, top 10 sectors",
      "Which countries generate the highest average deal value",
      "Clients with more than 3 deals, showing total value and most recent deal date",
      "Sector breakdown of fees as a percentage of deal value (fee rate) by sector",
    ],
  },
  {
    category: "Trends over time",
    prompts: [
      "Monthly closed deal count and total value for the last 12 months",
      "Quarter-over-quarter growth in total deal value",
      "Deals closed by month, broken out by deal_type",
    ],
  },
  {
    category: "Fee economics",
    prompts: [
      "Average fee rate (fee / deal_value) by deal_type",
      "Top 10 highest fee-rate deals, with client and banker",
    ],
  },
  {
    category: 'Cross-cuts (good "wow" demo widgets)',
    prompts: [
      "Banker × sector matrix: total deal value each banker has closed per sector",
      "Deals stuck in pipeline longest: stage, days since created_date, for non-closed deals",
      "Client concentration risk: percentage of total fees coming from each client's top 5 by fee",
    ],
  },
];

export default function Page() {
  return (
    <>
      <ul>
        <li>
          <Link href="/admin">Admin</Link> — create, manage, and curate widgets
        </li>
        <li>
          <Link href="/demo">Demo</Link> — the page judges see
        </li>
      </ul>

      <h2 style={{ marginTop: 32 }}>Widget prompt ideas</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Copy any of these into the Admin page's "New widget" prompt field. Generated SQL is capped at 15 rows.
      </p>
      {PROMPT_IDEAS.map((group) => (
        <div key={group.category} style={{ marginBottom: 20 }}>
          <h3 style={{ color: "var(--accent-gold)", fontSize: "1em", marginBottom: 8 }}>{group.category}</h3>
          <ul className="mono" style={{ color: "var(--text-muted)", fontSize: "0.9em" }}>
            {group.prompts.map((prompt) => (
              <li key={prompt} style={{ marginBottom: 4 }}>
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
