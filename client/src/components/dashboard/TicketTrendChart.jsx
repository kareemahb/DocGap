import { useApi } from "../../hooks/useApi.js";
import { formatPercent } from "../../lib/format.js";

const CHART_DAYS = 14;

// "M", "T", "W"… from each bar's date; the last bar is always "Today"
const dayLabel = (day) =>
  day.daysAgo === 0
    ? "Today"
    : new Date(day.date).toLocaleDateString("en-US", { weekday: "narrow" });

const Stat = ({ label, children }) => (
  <div>
    <p className="text-sm text-muted">{label}</p>
    <p className="flex items-baseline gap-1.5 text-3xl font-bold tracking-tight">
      {children}
    </p>
  </div>
);

const TicketTrendChart = () => {
  const { data, loading, error } = useApi(
    `/analytics/tickets-trend?days=${CHART_DAYS}`,
  );

  if (loading && !data) {
    return (
      <section className="rounded-card border border-line bg-white p-5 text-muted">
        Loading ticket trend…
      </section>
    );
  }
  if (error) {
    return (
      <section className="rounded-card border border-line bg-white p-5 text-muted">
        {error.message}
      </section>
    );
  }

  const { daily, thisWeek, changePercent, docsFixed, avgFixDays } = data;
  const busiestDay = Math.max(...daily.map((day) => day.count), 1);
  const total = daily.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="rounded-card border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tickets caused by doc gaps
          </h2>
          <p className="text-muted">
            Last {CHART_DAYS} days · all knowledge bases
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <Stat label="This week">
            {thisWeek}
            {changePercent != null && (
              <span
                className={`text-sm font-semibold ${changePercent <= 0 ? "text-forest" : "text-ink"}`}
              >
                {formatPercent(changePercent)}
              </span>
            )}
          </Stat>
          <Stat label="Docs fixed">{docsFixed}</Stat>
          <Stat label="Avg. fix time">
            {avgFixDays == null ? "—" : `${avgFixDays} d`}
          </Stat>
        </div>
      </div>

      <div
        role="img"
        aria-label={`Bar chart: ${total} tickets over the last ${CHART_DAYS} days, ${thisWeek} of them this week.`}
        className="mt-8 flex h-48 items-end gap-2 sm:gap-3"
      >
        {daily.map((day) => {
          const isToday = day.daysAgo === 0;
          const height = `${Math.max((day.count / busiestDay) * 100, 4)}%`;
          return (
            <div
              key={day.daysAgo}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              {isToday && (
                <span className="text-sm font-bold">{day.count}</span>
              )}
              <div
                title={`${day.count} tickets`}
                className={`w-full max-w-12 rounded-lg ${isToday ? "bg-ink" : "bg-sky ring-1 ring-alice"}`}
                style={{ height }}
              />
              <span
                className={`text-xs ${isToday ? "font-bold" : "text-muted"}`}
              >
                {dayLabel(day)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TicketTrendChart;
