import { useApi } from "../../hooks/useApi.js";
import { formatShortDate } from "../../lib/format.js";

// 90 days of daily bars is too thin to read, so long ranges are grouped by week (newest week last)
const groupByWeek = (daily) => {
  const weeks = [];
  for (let end = daily.length; end > 0; end -= 7) {
    const days = daily.slice(Math.max(0, end - 7), end);
    weeks.unshift({
      key: days[0].daysAgo,
      label: formatShortDate(days[0].date),
      title: `Week of ${formatShortDate(days[0].date)}`,
      count: days.reduce((sum, day) => sum + day.count, 0),
      isLatest: end === daily.length,
    });
  }
  return weeks;
};

const toDailyBars = (daily, days) =>
  daily.map((day) => {
    const isToday = day.daysAgo === 0;
    const weekday = new Date(day.date).toLocaleDateString("en-US", {
      weekday: days <= 7 ? "short" : "narrow",
    });
    const showLabel = days <= 14 || day.daysAgo % 5 === 0;
    return {
      key: day.daysAgo,
      label: isToday
        ? "Today"
        : showLabel
          ? days <= 14
            ? weekday
            : formatShortDate(day.date)
          : "",
      title: formatShortDate(day.date),
      count: day.count,
      isLatest: isToday,
    };
  });

const TicketVolumeChart = ({ days }) => {
  const { data, loading, error } = useApi(
    `/analytics/tickets-trend?days=${days}`,
  );

  if (loading && !data)
    return <p className="text-muted">Loading ticket volume…</p>;
  if (error) return <p className="text-muted">{error.message}</p>;

  const weekly = days > 30;
  const bars = weekly ? groupByWeek(data.daily) : toDailyBars(data.daily, days);
  const total = data.daily.reduce((sum, day) => sum + day.count, 0);
  const busiest = Math.max(...bars.map((bar) => bar.count), 1);
  const perDay = (total / days).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-3 gap-4">
        <div>
          <dt className="text-sm text-muted">Tickets</dt>
          <dd className="text-3xl font-bold tracking-tight">{total}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Per day</dt>
          <dd className="text-3xl font-bold tracking-tight">{perDay}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Docs fixed</dt>
          <dd className="text-3xl font-bold tracking-tight">
            {data.docsFixed}
          </dd>
        </div>
      </dl>

      <div
        role="img"
        aria-label={`Bar chart of ${total} tickets over the last ${days} days, shown ${weekly ? "by week" : "by day"}.`}
        className={`flex h-48 items-end ${bars.length > 20 ? "gap-1" : "gap-2"}`}
      >
        {bars.map((bar) => (
          <div
            key={bar.key}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              title={`${bar.title}: ${bar.count} tickets`}
              className={`w-full max-w-12 rounded-md ${bar.isLatest ? "bg-ink" : "bg-sky ring-1 ring-alice"}`}
              style={{ height: `${Math.max((bar.count / busiest) * 100, 3)}%` }}
            />
            <span
              className={`h-4 whitespace-nowrap text-[11px] ${bar.isLatest ? "font-bold" : "text-muted"}`}
            >
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketVolumeChart;
