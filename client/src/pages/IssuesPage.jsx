import { useSearchParams } from "react-router";
import { useApi } from "../hooks/useApi.js";
import IssueRow from "../components/issues/IssueRow.jsx";

const filters = [
  {
    value: "unlinked",
    label: "Unlinked",
    query: "?linked=false",
    noun: "unlinked issues",
  },
  {
    value: "linked",
    label: "Linked",
    query: "?linked=true",
    noun: "linked issues",
  },
  { value: "all", label: "All issues", query: "", noun: "issues" },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ticketsThisWeek = (issue) =>
  issue.occurrences.filter((date) => Date.now() - new Date(date) < WEEK_MS)
    .length;

const IssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const show = filters.some((f) => f.value === searchParams.get("show"))
    ? searchParams.get("show")
    : "all";
  const activeFilter = filters.find((f) => f.value === show);

  const issues = useApi(`/issues${activeFilter.query}`);
  const documents = useApi("/documents?sort=title");

  // Busiest this week first, then most tickets overall
  const sortedIssues = [...(issues.data ?? [])].sort(
    (a, b) =>
      ticketsThisWeek(b) - ticketsThisWeek(a) || b.ticketCount - a.ticketCount,
  );

  return (
    <section className="rounded-card border border-line bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket issues</h1>
          <p className="text-muted">
            Recurring problems from support. Link each one to the document
            behind it.
          </p>
        </div>

        <div
          role="group"
          aria-label="Show issues"
          className="flex gap-1 rounded-tile border border-alice bg-sky p-1"
        >
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={show === value}
              onClick={() =>
                setSearchParams(value === "all" ? {} : { show: value }, {
                  replace: true,
                })
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                show === value
                  ? "bg-white shadow-sm"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {issues.loading && !issues.data && (
        <p className="mt-6 text-muted">Loading issues…</p>
      )}
      {issues.error && (
        <p className="mt-6 text-muted">{issues.error.message}</p>
      )}

      {issues.data && (
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted">
          {issues.data.length} {activeFilter.noun}
        </p>
      )}

      {issues.data?.length === 0 && (
        <p className="mt-4 rounded-tile bg-ghost p-5 text-muted">
          {show === "unlinked"
            ? "Every issue is linked to a document. Nice work."
            : "No issues to show."}
        </p>
      )}

      <ul className="divide-y divide-line">
        {sortedIssues.map((issue) => (
          <IssueRow
            key={issue._id}
            issue={issue}
            documents={documents.data}
            onChanged={issues.reload}
          />
        ))}
      </ul>
    </section>
  );
};

export default IssuesPage;
