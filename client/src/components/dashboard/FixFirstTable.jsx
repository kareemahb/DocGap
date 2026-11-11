import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useApi } from "../../hooks/useApi.js";
import { currentUser } from "../../lib/currentUser.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import { scoreBadgeStyles } from "../../lib/severity.js";
import { formatReviewAge } from "../../lib/format.js";
import { ArrowRightIcon } from "../icons.jsx";

const sortTabs = [
  { value: "debt", label: "Debt Score" },
  { value: "tickets", label: "Ticket volume" },
  { value: "review", label: "Review age" },
];

// The short "what's wrong" line under each title
const describeProblem = (doc) =>
  doc.note ??
  doc.debt.reasons.find((reason) => !reason.includes("support tickets")) ??
  "";

const FixFirstTable = ({ totalDocuments }) => {
  const [sort, setSort] = useState("debt");
  const [searchParams] = useSearchParams();
  const onlyMine = searchParams.get("view") === "mine";

  const params = new URLSearchParams({ sort, limit: "5" });
  if (onlyMine) params.set("owner", currentUser.name);

  const {
    data: documents,
    loading,
    error,
    reload,
  } = useApi(`/documents?${params}`);

  return (
    <section className="overflow-hidden rounded-card border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fix first</h2>
          {onlyMine && <p className="text-sm text-muted">Documents you own</p>}
        </div>
        <div
          role="group"
          aria-label="Sort documents by"
          className="flex flex-wrap gap-1"
        >
          {sortTabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              onClick={() => setSort(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                sort === value
                  ? "bg-ink text-ghost"
                  : "text-ink/80 hover:bg-ghost"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && !documents && (
        <p className="px-5 pb-5 text-muted">Loading documents…</p>
      )}

      {error && (
        <div className="flex flex-wrap items-center gap-3 px-5 pb-5">
          <p className="text-muted">{error.message}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ghost"
          >
            Try again
          </button>
        </div>
      )}

      {documents?.length === 0 && (
        <p className="px-5 pb-5 text-muted">No documents to show.</p>
      )}

      {documents?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="border-y border-line bg-ghost text-xs font-semibold uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Document
                </th>
                <th scope="col" className="px-3 py-3">
                  Tickets
                </th>
                <th scope="col" className="px-3 py-3">
                  Last reviewed
                </th>
                <th scope="col" className="px-5 py-3">
                  Debt score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {documents.map((doc) => (
                <tr
                  key={doc._id}
                  className={`hover:bg-ghost ${loading ? "opacity-60" : ""}`}
                >
                  <td className="px-5 py-3">
                    <Link
                      to={`/documents/${doc._id}`}
                      className="font-semibold hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                      <span
                        className={`size-2 rounded-sm ${knowledgeBaseDot[doc.knowledgeBase?.color] ?? "bg-ink"}`}
                      />
                      {doc.knowledgeBase?.name ?? "No knowledge base"}
                      {describeProblem(doc) && ` · ${describeProblem(doc)}`}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {doc.recentTicketCount}
                  </td>
                  <td className="px-3 py-3 text-ink/80">
                    {formatReviewAge(doc.lastReviewedAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex min-w-10 justify-center rounded-lg px-2 py-1 text-sm font-bold ${scoreBadgeStyles[doc.debt.severity]}`}
                    >
                      {doc.debt.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end border-t border-line px-5 py-4">
        <Link
          to="/documents"
          className="flex items-center gap-1.5 font-semibold hover:underline"
        >
          View all {totalDocuments} documents
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </section>
  );
};

export default FixFirstTable;
