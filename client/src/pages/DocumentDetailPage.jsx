import { Link, useParams } from "react-router";
import { useApi } from "../hooks/useApi.js";
import { severityStyles } from "../lib/severity.js";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const { data: doc, loading, error } = useApi(`/documents/${id}`);

  if (loading && !doc)
    return (
      <p className="rounded-card bg-white p-6 text-muted">Loading document…</p>
    );

  if (error) {
    const notFound = error.status === 404 || error.status === 400;
    return (
      <section className="flex flex-col items-start gap-3 rounded-card bg-white p-6">
        <h1 className="text-2xl font-semibold">
          {notFound ? "Document not found" : "Something went wrong"}
        </h1>
        {!notFound && <p className="text-muted">{error.message}</p>}
        <Link to="/documents" className="font-semibold underline">
          ← Back to documents
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/documents" className="text-sm font-semibold">
        ← All documents
      </Link>

      <section className="rounded-card bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {doc.title}
            </h1>
            <p className="text-muted">
              {doc.knowledgeBase?.name ?? "No knowledge base"} · {doc.type} ·
              Owner: {doc.owner ?? "None"}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-lg font-bold capitalize ${severityStyles[doc.debt.severity]}`}
          >
            {doc.debt.score} · {doc.debt.severity}
          </span>
        </div>

        {doc.debt.reasons.length > 0 && (
          <div className="mt-6 rounded-tile bg-ghost p-5">
            <h2 className="mb-2 font-semibold">
              Why the score is {doc.debt.score >= 60 ? "high" : "what it is"}
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              {doc.debt.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-card bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold">Related support issues</h2>
        {doc.relatedIssues.length === 0 ? (
          <p className="text-muted">
            No support issues linked to this document.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {doc.relatedIssues.map((issue) => (
              <li key={issue._id} className="flex justify-between gap-4 py-3">
                <span>{issue.title}</span>
                <span className="whitespace-nowrap font-semibold">
                  {issue.ticketCount} tickets
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DocumentDetailPage;
