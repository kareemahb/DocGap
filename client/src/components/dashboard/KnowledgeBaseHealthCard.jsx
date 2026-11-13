import { useState } from "react";
import { useApi } from "../../hooks/useApi.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";

const statusBadges = {
  healthy: { label: "Healthy", className: "bg-mint ring-1 ring-sage" },
  needs_review: {
    label: "Needs review",
    className: "bg-sky ring-1 ring-cornflower",
  },
  at_risk: { label: "At risk", className: "bg-vanilla ring-1 ring-gold" },
  empty: { label: "No docs yet", className: "bg-ghost ring-1 ring-line" },
};

// `visibleByDefault`: how many to show before "View all" (the dashboard shows 3, Reports shows them all)
const KnowledgeBaseHealthCard = ({
  visibleByDefault = 3,
  title = "Knowledge base health",
}) => {
  const { data, loading, error } = useApi("/analytics/knowledge-bases");
  const [showAll, setShowAll] = useState(false);

  const knowledgeBases = data?.knowledgeBases ?? [];
  const visible = showAll
    ? knowledgeBases
    : knowledgeBases.slice(0, visibleByDefault);
  const hasMore = knowledgeBases.length > visibleByDefault;

  return (
    <section className="rounded-card border border-line bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold leading-tight tracking-tight">
          {title}
        </h2>
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="shrink-0 text-sm font-semibold text-muted hover:text-ink"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>

      {loading && !data && <p className="text-muted">Loading…</p>}
      {error && <p className="text-muted">{error.message}</p>}

      <ul className="flex flex-col gap-5">
        {visible.map((kb) => {
          const badge = statusBadges[kb.status];
          return (
            <li key={kb.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold">
                  <span
                    className={`size-2.5 rounded-sm ${knowledgeBaseDot[kb.color] ?? "bg-ink"}`}
                  />
                  {kb.name}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${kb.percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold">
                  {kb.percent}%
                </span>
              </div>

              <p className="mt-1 text-sm text-muted">
                {kb.reviewedRecently} of {kb.totalDocuments} docs reviewed in
                the last {data.windowDays} days
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default KnowledgeBaseHealthCard;
