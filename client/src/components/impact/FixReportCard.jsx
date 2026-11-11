import { useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import { verdictBadges } from "../../lib/gaps.js";
import {
  formatDaysAgo,
  formatPercent,
  formatShortDate,
} from "../../lib/format.js";

const BeforeAfterBar = ({ label, range, count, max, dark = false }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm">
      <span>
        <span className="font-semibold">{label}</span>{" "}
        <span className="text-muted">· {range}</span>
      </span>
      <span className="font-bold">{count}</span>
    </div>
    <div
      className="h-3 overflow-hidden rounded-full bg-ghost"
      aria-hidden="true"
    >
      <div
        className={`h-full rounded-full ${dark ? "bg-ink" : "bg-alice"}`}
        style={{ width: `${max ? Math.max((count / max) * 100, 2) : 0}%` }}
      />
    </div>
  </div>
);

const FixReportCard = ({ fix, highlighted, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const badge = verdictBadges[fix.verdict];
  const max = Math.max(fix.ticketsBefore, fix.ticketsAfter);
  const { before, after } = fix.windows;

  const markVerified = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/gaps/${fix.gapId}/verify`);
      await onChanged();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      id={`fix-${fix.gapId}`}
      className={`flex scroll-mt-24 flex-col gap-4 rounded-card border bg-white p-5 ${
        highlighted ? "border-ink ring-2 ring-ink" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/documents/${fix.document.id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:underline"
          >
            <span
              className={`size-2 rounded-sm ${knowledgeBaseDot[fix.document.knowledgeBase?.color] ?? "bg-ink"}`}
            />
            {fix.document.knowledgeBase?.name}
          </Link>
          <h3 className="mt-1 text-xl font-bold leading-tight tracking-tight">
            {fix.document.title}
          </h3>
          <p className="text-sm text-muted">
            {fix.gapTitle} · Fixed {formatDaysAgo(fix.resolvedAt)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {fix.verdict === "too_early" ? (
        <p className="rounded-tile bg-sky p-4 text-sm">
          Fixed {fix.daysObserved} {fix.daysObserved === 1 ? "day" : "days"}{" "}
          ago. DocGap needs at least a week of tickets after a fix before it can
          judge it.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <BeforeAfterBar
            label="Before"
            range={`${formatShortDate(before.from)} – ${formatShortDate(before.to)}`}
            count={fix.ticketsBefore}
            max={max}
          />
          <BeforeAfterBar
            label="After"
            range={`${formatShortDate(after.from)} – ${formatShortDate(after.to)}`}
            count={fix.ticketsAfter}
            max={max}
            dark
          />
          <p className="flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">
              Related tickets, {fix.daysObserved} days before vs. after
            </span>
            <span className="text-2xl font-bold">
              {formatPercent(fix.changePercent)}
            </span>
          </p>
        </div>
      )}

      {fix.verifiedAt ? (
        <p className="text-sm font-semibold text-forest">
          Verified {formatDaysAgo(fix.verifiedAt)}
        </p>
      ) : (
        <button
          type="button"
          onClick={markVerified}
          disabled={busy || fix.verdict === "too_early"}
          className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-ghost hover:brightness-125 disabled:opacity-40"
        >
          {busy ? "Saving…" : "Mark verified"}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </article>
  );
};

export default FixReportCard;
