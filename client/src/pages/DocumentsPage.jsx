import { Link } from "react-router";
import { useApi } from "../hooks/useApi.js";
import { severityStyles } from "../lib/severity.js";

const DocumentsPage = () => {
  const { data: documents, loading, error, reload } = useApi("/documents");

  return (
    <section className="rounded-card bg-white p-6">
      <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
      <p className="mb-4 text-muted">
        Sorted by documentation debt: highest first
      </p>

      {loading && !documents && (
        <p className="text-muted">Loading documents…</p>
      )}

      {error && (
        <div className="flex flex-wrap items-center gap-3">
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

      {documents && (
        <ul className="divide-y divide-line">
          {documents.map((doc) => (
            <li key={doc._id}>
              <Link
                to={`/documents/${doc._id}`}
                className="flex items-center gap-4 rounded-xl px-2 py-3 hover:bg-ghost"
              >
                <span className="w-12 text-center text-2xl font-bold tracking-tight">
                  {doc.debt.score}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{doc.title}</span>
                  <span className="text-sm text-muted">
                    {doc.knowledgeBase?.name ?? "No knowledge base"} ·{" "}
                    {doc.owner ?? "No owner"} · {doc.recentTicketCount} tickets
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${severityStyles[doc.debt.severity]}`}
                >
                  {doc.debt.severity}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DocumentsPage;
