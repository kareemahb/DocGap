import { Link, useSearchParams } from "react-router";
import { useApi } from "../hooks/useApi.js";
import { severityStyles } from "../lib/severity.js";
import { knowledgeBaseDot } from "../lib/knowledgeBases.js";

const DocumentsPage = () => {
  const [searchParams] = useSearchParams();
  const knowledgeBaseId = searchParams.get("knowledgeBase");
  const query = searchParams.get("q");

  // Pass the page's filters straight through to the API
  const apiParams = new URLSearchParams();
  if (knowledgeBaseId) apiParams.set("knowledgeBase", knowledgeBaseId);
  if (query) apiParams.set("q", query);
  const apiQuery = apiParams.toString();

  const {
    data: documents,
    loading,
    error,
    reload,
  } = useApi(`/documents${apiQuery ? `?${apiQuery}` : ""}`);
  const knowledgeBases = useApi("/knowledge-bases");

  // The name comes from the knowledge base list, so it shows even when the knowledge base is empty
  const knowledgeBase = knowledgeBases.data?.find(
    (kb) => kb._id === knowledgeBaseId,
  );
  const heading =
    knowledgeBase?.name ?? (query ? `Results for “${query}”` : "Documents");
  const isFiltered = Boolean(knowledgeBaseId || query);

  return (
    <section className="rounded-card border border-line bg-white p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            {knowledgeBase && (
              <span
                className={`size-3.5 rounded ${knowledgeBaseDot[knowledgeBase.color] ?? "bg-ink"}`}
              />
            )}
            {heading}
          </h1>
          <p className="text-muted">
            {documents ? `${documents.length} documents · ` : ""}Sorted by Debt
            Score, highest first
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isFiltered && (
            <Link to="/documents" className="text-sm font-semibold underline">
              Show all documents
            </Link>
          )}
          {knowledgeBase && (
            <Link
              to={`/documents/new?knowledgeBase=${knowledgeBase._id}`}
              className="flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-ghost hover:brightness-125"
            >
              Add document here
            </Link>
          )}
        </div>
      </div>

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

      {documents?.length === 0 && (
        <p className="rounded-tile bg-ghost p-5 text-muted">
          {knowledgeBase
            ? "No documents in this knowledge base yet."
            : "No documents match."}
        </p>
      )}

      {documents?.length > 0 && (
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
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <span
                      className={`size-2 rounded-sm ${knowledgeBaseDot[doc.knowledgeBase?.color] ?? "bg-ink"}`}
                    />
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
