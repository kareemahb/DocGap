import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useApi } from "../hooks/useApi.js";
import { useDataVersion } from "../context/dataVersion.js";
import { OPEN_STATUSES } from "../lib/gaps.js";
import GapRow from "../components/impact/GapRow.jsx";
import FixReportCard from "../components/impact/FixReportCard.jsx";
import NewGapForm from "../components/impact/NewGapForm.jsx";
import { PlusIcon } from "../components/icons.jsx";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const WINDOW_DAYS = 14;

const SectionHeading = ({ title, count, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-2xl font-bold tracking-tight">
      {title} <span className="text-muted">{count}</span>
    </h2>
    {children}
  </div>
);

const ImpactPage = () => {
  const [searchParams] = useSearchParams();
  const highlightedGap = searchParams.get("gap");
  const [showNewGap, setShowNewGap] = useState(false);

  const gaps = useApi("/gaps");
  const fixes = useApi(`/analytics/fixes?days=${WINDOW_DAYS}`);
  const documents = useApi("/documents?sort=title");

  // Saving anything here refreshes every list on screen, including the sidebar and dashboard counts
  const { refresh: reloadAll } = useDataVersion();

  const openGaps = (gaps.data ?? [])
    .filter((gap) => OPEN_STATUSES.includes(gap.status))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const toVerify = (fixes.data ?? []).filter((fix) => !fix.verifiedAt);
  const verified = (fixes.data ?? []).filter((fix) => fix.verifiedAt);

  // "View report" links here with ?gap=<id>: scroll that fix into view once it has loaded
  useEffect(() => {
    if (!highlightedGap || !fixes.data) return;
    document
      .getElementById(`fix-${highlightedGap}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightedGap, fixes.data]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Impact</h1>
        <p className="mt-1 text-lg text-ink/80">
          Fix the gaps, then prove the fix worked: DocGap compares related
          tickets {WINDOW_DAYS} days before and after each fix.
        </p>
      </header>

      {/* Open gaps: the work */}
      <section className="flex flex-col gap-4 rounded-card border border-line bg-white p-6">
        <SectionHeading
          title="Open gaps"
          count={gaps.data ? openGaps.length : ""}
        >
          {!showNewGap && (
            <button
              type="button"
              onClick={() => setShowNewGap(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-ghost hover:brightness-125"
            >
              <PlusIcon size={16} />
              New gap
            </button>
          )}
        </SectionHeading>

        {showNewGap && (
          <NewGapForm
            documents={documents.data}
            onCancel={() => setShowNewGap(false)}
            onCreated={() => {
              setShowNewGap(false);
              reloadAll();
            }}
          />
        )}

        {gaps.loading && !gaps.data && (
          <p className="text-muted">Loading gaps…</p>
        )}
        {gaps.error && <p className="text-muted">{gaps.error.message}</p>}
        {gaps.data && openGaps.length === 0 && (
          <p className="text-muted">No open gaps. Everything's been fixed.</p>
        )}

        <ul className="divide-y divide-line">
          {openGaps.map((gap) => (
            <GapRow key={gap._id} gap={gap} onChanged={reloadAll} />
          ))}
        </ul>
      </section>

      {/* Fixes to verify: the proof */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Fixes to verify"
          count={fixes.data ? toVerify.length : ""}
        />
        {fixes.loading && !fixes.data && (
          <p className="text-muted">Loading fixes…</p>
        )}
        {fixes.error && <p className="text-muted">{fixes.error.message}</p>}
        {fixes.data && toVerify.length === 0 && (
          <p className="rounded-card border border-line bg-white p-6 text-muted">
            Every fix has been verified.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {toVerify.map((fix) => (
            <FixReportCard
              key={fix.gapId}
              fix={fix}
              highlighted={fix.gapId === highlightedGap}
              onChanged={reloadAll}
            />
          ))}
        </div>
      </section>

      {/* Verified fixes: the history */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Verified fixes"
          count={fixes.data ? verified.length : ""}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {verified.map((fix) => (
            <FixReportCard
              key={fix.gapId}
              fix={fix}
              highlighted={fix.gapId === highlightedGap}
              onChanged={reloadAll}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ImpactPage;
