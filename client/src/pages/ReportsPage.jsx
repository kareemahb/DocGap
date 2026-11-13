import { useSearchParams } from "react-router";
import TicketVolumeChart from "../components/reports/TicketVolumeChart.jsx";
import RootCauseBreakdown from "../components/reports/RootCauseBreakdown.jsx";
import FixSuccessCard from "../components/reports/FixSuccessCard.jsx";
import KnowledgeBaseHealthCard from "../components/dashboard/KnowledgeBaseHealthCard.jsx";

const RANGES = [7, 30, 90];
const DEFAULT_RANGE = 30;

const ReportCard = ({ title, subtitle, className = "", children }) => (
  <section
    className={`flex flex-col gap-5 rounded-card border border-line bg-white p-5 ${className}`}
  >
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const ReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = Number(searchParams.get("days"));
  const days = RANGES.includes(requested) ? requested : DEFAULT_RANGE;

  const changeRange = (nextDays) =>
    setSearchParams(
      nextDays === DEFAULT_RANGE ? {} : { days: String(nextDays) },
      { replace: true },
    );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-lg text-ink/80">
            How documentation is affecting support, over time.
          </p>
        </div>

        <div
          role="group"
          aria-label="Time range"
          className="flex gap-1 rounded-tile border border-alice bg-sky p-1"
        >
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              onClick={() => changeRange(range)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                days === range
                  ? "bg-white shadow-sm"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              {range} days
            </button>
          ))}
        </div>
      </header>

      <ReportCard
        title="Ticket volume"
        subtitle={`All tickets, last ${days} days${days > 30 ? " · by week" : " · by day"}`}
      >
        <TicketVolumeChart days={days} />
      </ReportCard>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ReportCard
          title="Tickets by root cause"
          subtitle={`Last ${days} days`}
        >
          <RootCauseBreakdown days={days} />
        </ReportCard>

        <ReportCard
          title="Fix success rate"
          subtitle={`Fixes resolved in the last ${days} days`}
        >
          <FixSuccessCard days={days} />
        </ReportCard>
      </div>

      <KnowledgeBaseHealthCard
        visibleByDefault={20}
        title="Knowledge base health · all"
      />
    </div>
  );
};

export default ReportsPage;
