import { useApi } from "./hooks/useApi.js";

const severityStyles = {
  critical: "bg-ink text-ghost",
  high: "bg-vanilla",
  medium: "bg-alice",
  healthy: "bg-honeydew",
};

const verdictLabels = {
  worked: "Worked",
  partial: "Partly worked",
  no_improvement: "No improvement",
  not_enough_data: "Not enough data",
  too_early: "Too early to tell",
};

const formatChange = (percent) => {
  if (percent === null) return "New";
  return percent < 0 ? `↘ ${Math.abs(percent)}%` : `↗ ${percent}%`;
};

const StatusMessage = ({ children }) => (
  <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-4">
    <div className="flex flex-col items-center gap-4 rounded-card bg-white p-8 text-center">
      {children}
    </div>
  </main>
);

const KpiTile = ({ label, value, note, highlight = false }) => (
  <div
    className={`flex flex-col gap-4 rounded-tile p-4 ${highlight ? "bg-vanilla" : "bg-white"}`}
  >
    <span className={`text-sm ${highlight ? "font-semibold" : "text-muted"}`}>
      {label}
    </span>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-4xl font-semibold tracking-tight">{value}</span>
      {note && <span className="text-sm font-semibold">{note}</span>}
    </div>
  </div>
);

const App = () => {
  const overview = useApi("/analytics/overview");
  const fixes = useApi("/analytics/fixes");

  if (overview.loading && !overview.data) {
    return (
      <StatusMessage>
        <p className="text-muted">Loading DocGap…</p>
      </StatusMessage>
    );
  }

  if (overview.error) {
    return (
      <StatusMessage>
        <p className="text-lg font-semibold">Couldn't load the dashboard</p>
        <p className="text-muted">{overview.error.message}</p>
        <button
          type="button"
          onClick={overview.reload}
          className="rounded-full bg-ink px-5 py-3 font-semibold text-ghost hover:brightness-125"
        >
          Try again
        </button>
      </StatusMessage>
    );
  }

  const {
    knowledgeHealth,
    severityCounts,
    topDocument,
    overdueReviews,
    gaps,
    tickets,
  } = overview.data;
  const latestFix = fixes.data?.[0];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xl font-bold">
          <span className="flex size-9 items-center justify-center gap-1 rounded-xl bg-ink">
            <span className="h-4 w-1.5 rounded-sm bg-ghost" />
            <span className="h-4 w-1.5 rounded-sm bg-vanilla" />
          </span>
          DocGap
        </div>
        <span className="rounded-full bg-honeydew px-4 py-1.5 text-sm font-semibold">
          ● Live from API
        </span>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiTile label="Knowledge health" value={knowledgeHealth} note="/100" />
        <KpiTile
          label="Critical docs"
          value={severityCounts.critical}
          note={
            topDocument?.severity === "critical"
              ? topDocument.title.split(" ")[0]
              : null
          }
        />
        <KpiTile
          label="Open gaps"
          value={gaps.open}
          note={`${gaps.unassigned} unassigned`}
        />
        <KpiTile
          label="Tickets · 30 days"
          value={tickets.last30}
          note={formatChange(tickets.changePercent)}
        />
        <KpiTile
          label="Overdue reviews"
          value={overdueReviews}
          note="90+ days"
        />
        <KpiTile
          label="Last fix impact"
          value={
            latestFix?.changePercent != null
              ? `${latestFix.changePercent}%`
              : "—"
          }
          note="tickets"
          highlight
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-card bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Documentation health</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(severityCounts).map(([severity, count]) => (
              <span
                key={severity}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${severityStyles[severity]}`}
              >
                {count} · {severity}
              </span>
            ))}
          </div>
          {topDocument && (
            <p className="mt-4 text-muted">
              Highest debt:{" "}
              <span className="font-semibold text-ink">
                {topDocument.title}
              </span>{" "}
              ({topDocument.score})
            </p>
          )}
        </section>

        <section className="rounded-card bg-honeydew p-6">
          <p className="text-sm font-semibold">Did the fix work?</p>
          {latestFix ? (
            <>
              <p className="mt-1 text-5xl font-bold tracking-tight">
                {latestFix.changePercent != null
                  ? `↓ ${Math.abs(latestFix.changePercent)}%`
                  : "—"}
              </p>
              <p className="mt-1">
                {latestFix.document.title} · {latestFix.ticketsBefore} →{" "}
                {latestFix.ticketsAfter} tickets
              </p>
              <span className="mt-3 inline-block rounded-full bg-ink px-3 py-1 text-sm font-semibold text-ghost">
                {verdictLabels[latestFix.verdict]}
              </span>
            </>
          ) : (
            <p className="mt-1 text-muted">No measured fixes yet.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
