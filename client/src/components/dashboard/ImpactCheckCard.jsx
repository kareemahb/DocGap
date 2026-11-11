import { useState } from "react";
import { Link } from "react-router";
import { useApi } from "../../hooks/useApi.js";
import { formatDaysAgo, formatPercent } from "../../lib/format.js";
import { ArrowRightIcon } from "../icons.jsx";

const verdictBadges = {
  worked: { label: "Fix worked", className: "bg-honeydew text-ink" },
  partial: { label: "Partly worked", className: "bg-vanilla text-ink" },
  no_improvement: { label: "No improvement", className: "bg-white text-ink" },
  not_enough_data: {
    label: "Not enough data",
    className: "bg-white/15 text-ghost",
  },
  too_early: { label: "Too early", className: "bg-white/15 text-ghost" },
};

const WINDOW_DAYS = 14;

const ImpactCheckCard = () => {
  const {
    data: fixes,
    loading,
    error,
  } = useApi(`/analytics/fixes?days=${WINDOW_DAYS}&toVerify=true`);
  const [position, setPosition] = useState(0);

  const shell = (children) => (
    <section className="flex flex-col gap-4 rounded-card bg-ink p-5 text-ghost">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ghost/80">
        Impact check
      </h2>
      {children}
    </section>
  );

  if (loading && !fixes)
    return shell(<p className="text-ghost/80">Loading fixes…</p>);
  if (error) return shell(<p className="text-ghost/80">{error.message}</p>);
  if (!fixes?.length)
    return shell(
      <p className="text-ghost/80">No fixes waiting to be verified.</p>,
    );

  const fix = fixes[position % fixes.length];
  const badge = verdictBadges[fix.verdict];
  const showNext = () => setPosition((current) => (current + 1) % fixes.length);

  return (
    <section className="flex flex-col gap-4 rounded-card bg-ink p-5 text-ghost">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ghost/80">
          Impact check
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold leading-tight tracking-tight">
          {fix.document.title}
        </p>
        <p className="mt-1 text-sm text-ghost/80">
          Updated {formatDaysAgo(fix.resolvedAt)}
          {fix.document.knowledgeBase &&
            ` · ${fix.document.knowledgeBase.name}`}
        </p>
      </div>

      {fix.verdict === "too_early" ? (
        <p className="rounded-tile bg-white/10 p-4 text-sm text-ghost/90">
          This fix is only {fix.daysObserved}{" "}
          {fix.daysObserved === 1 ? "day" : "days"} old. Check back after a week
          of tickets.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-tile bg-white/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ghost/70">
                Before
              </p>
              <p className="text-3xl font-bold">{fix.ticketsBefore}</p>
            </div>
            <ArrowRightIcon className="text-vanilla" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ghost/70">
                After
              </p>
              <p className="text-3xl font-bold">{fix.ticketsAfter}</p>
            </div>
            <p className="ml-auto text-2xl font-bold text-vanilla">
              {formatPercent(fix.changePercent)}
            </p>
          </div>
          <p className="text-sm text-ghost/80">
            Tickets per {fix.daysObserved} days, before vs. after the update
          </p>
        </>
      )}

      <div className="flex gap-2">
        <Link
          to={`/impact?gap=${fix.gapId}`}
          className="flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 font-semibold text-ink hover:bg-ghost"
        >
          View report
        </Link>
        <button
          type="button"
          onClick={showNext}
          disabled={fixes.length < 2}
          className="rounded-xl border border-white/30 px-4 py-3 font-semibold hover:bg-white/10 disabled:opacity-40"
        >
          Next fix
        </button>
      </div>

      {fixes.length > 1 && (
        <p className="text-center text-xs text-ghost/60">
          {(position % fixes.length) + 1} of {fixes.length} fixes to verify
        </p>
      )}
    </section>
  );
};

export default ImpactCheckCard;
