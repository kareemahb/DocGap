import { useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import { rootCauseLabels, docRootCauses } from "../../lib/rootCauses.js";
import { formatDaysAgo } from "../../lib/format.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const IssueRow = ({ issue, documents, onChanged }) => {
  const [selectedDocument, setSelectedDocument] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const occurrences = issue.occurrences.map((date) => new Date(date));
  const lastReported = occurrences.length
    ? new Date(Math.max(...occurrences))
    : null;
  const thisWeek = occurrences.filter(
    (date) => Date.now() - date < WEEK_MS,
  ).length;
  const linkedDocument = issue.relatedDocument;
  const isDocProblem = docRootCauses.includes(issue.rootCause);

  // Runs one API action, then asks the page to reload the list
  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await onChanged();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  const linkDocument = (event) => {
    event.preventDefault();
    if (!selectedDocument) return;
    run(() =>
      api.put(`/issues/${issue._id}`, { relatedDocument: selectedDocument }),
    );
  };

  const unlinkDocument = () =>
    run(() => api.put(`/issues/${issue._id}`, { relatedDocument: null }));
  const logTicket = () =>
    run(() => api.post(`/issues/${issue._id}/occurrences`));

  return (
    <li className={`flex flex-col gap-3 py-4 ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{issue.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink ${
                isDocProblem ? "bg-vanilla" : "bg-ghost ring-1 ring-line"
              }`}
            >
              {rootCauseLabels[issue.rootCause]}
            </span>
            <span className="capitalize">{issue.status}</span>
            {lastReported && (
              <span>· Last reported {formatDaysAgo(lastReported)}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-right">
            <span className="block text-2xl font-bold leading-none">
              {issue.ticketCount}
            </span>
            <span className="text-xs text-muted">{thisWeek} this week</span>
          </p>
          <button
            type="button"
            onClick={logTicket}
            disabled={busy}
            aria-label={`Log another ticket for ${issue.title}`}
            className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold hover:bg-ghost disabled:opacity-50"
          >
            +1 ticket
          </button>
        </div>
      </div>

      {linkedDocument ? (
        <div className="flex flex-wrap items-center gap-3 rounded-tile bg-ghost px-3 py-2 text-sm">
          <span className="text-muted">Linked to</span>
          <Link
            to={`/documents/${linkedDocument._id}`}
            className="flex items-center gap-1.5 font-semibold hover:underline"
          >
            <span
              className={`size-2 rounded-sm ${knowledgeBaseDot[linkedDocument.knowledgeBase?.color] ?? "bg-ink"}`}
            />
            {linkedDocument.title}
          </Link>
          <button
            type="button"
            onClick={unlinkDocument}
            disabled={busy}
            className="ml-auto font-semibold text-muted hover:text-ink"
          >
            Unlink
          </button>
        </div>
      ) : (
        <form
          onSubmit={linkDocument}
          className="flex flex-wrap items-center gap-2"
        >
          <label htmlFor={`link-${issue._id}`} className="sr-only">
            Link {issue.title} to a document
          </label>
          <select
            id={`link-${issue._id}`}
            value={selectedDocument}
            onChange={(event) => setSelectedDocument(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
          >
            <option value="">
              {documents
                ? "Choose the document behind this issue…"
                : "Loading documents…"}
            </option>
            {documents?.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.title} · {doc.knowledgeBase?.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedDocument || busy}
            className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-ghost hover:brightness-125 disabled:opacity-40"
          >
            Link
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </li>
  );
};

export default IssueRow;
