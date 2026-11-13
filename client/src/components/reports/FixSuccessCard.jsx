import { useApi } from "../../hooks/useApi.js";
import { verdictBadges } from "../../lib/gaps.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MEASURED = ["worked", "partial", "no_improvement"];
const VERDICT_ORDER = [
  "worked",
  "partial",
  "no_improvement",
  "not_enough_data",
  "too_early",
];

const FixSuccessCard = ({ days }) => {
  const { data: fixes, loading, error } = useApi("/analytics/fixes?days=14");

  if (loading && !fixes) return <p className="text-muted">Loading fixes…</p>;
  if (error) return <p className="text-muted">{error.message}</p>;

  const cutoff = Date.now() - days * DAY_MS;
  const inRange = fixes.filter(
    (fix) => new Date(fix.resolvedAt).getTime() >= cutoff,
  );
  const counts = Object.fromEntries(
    VERDICT_ORDER.map((verdict) => [verdict, 0]),
  );
  for (const fix of inRange) counts[fix.verdict] += 1;

  const measured = MEASURED.reduce((sum, verdict) => sum + counts[verdict], 0);
  const successRate = measured
    ? Math.round((counts.worked / measured) * 100)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {successRate === null ? (
        <p className="text-ink/80">
          <span className="block text-3xl font-bold tracking-tight text-ink">
            —
          </span>
          {inRange.length
            ? "None of these fixes have enough data to judge yet."
            : "No fixes in this period."}
        </p>
      ) : (
        <p className="text-ink/80">
          <span className="block text-5xl font-bold tracking-tight text-ink">
            {successRate}%
          </span>
          {counts.worked} of {measured} measured{" "}
          {measured === 1 ? "fix" : "fixes"} cut related tickets by 25% or more
        </p>
      )}

      <ul className="flex flex-col divide-y divide-line">
        {VERDICT_ORDER.filter((verdict) => counts[verdict] > 0).map(
          (verdict) => (
            <li
              key={verdict}
              className="flex items-center justify-between py-2"
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${verdictBadges[verdict].className}`}
              >
                {verdictBadges[verdict].label}
              </span>
              <span className="font-semibold">{counts[verdict]}</span>
            </li>
          ),
        )}
      </ul>

      <p className="text-xs text-muted">
        Fixes resolved in the last {days} days, measured over 14 days before vs.
        after.
      </p>
    </div>
  );
};

export default FixSuccessCard;
