import { useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { currentUser } from "../../lib/currentUser.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import { rootCauseLabels } from "../../lib/rootCauses.js";
import {
  OPEN_STATUSES,
  statusLabels,
  priorityStyles,
  actionLabels,
} from "../../lib/gaps.js";

const GapRow = ({ gap, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  const changeStatus = (event) =>
    run(() => api.put(`/gaps/${gap._id}`, { status: event.target.value }));
  const assignToMe = () =>
    run(() =>
      api.patch(`/gaps/${gap._id}/assign`, { assignee: currentUser.name }),
    );
  const resolve = () => run(() => api.patch(`/gaps/${gap._id}/resolve`));

  return (
    <li className={`flex flex-col gap-3 py-4 ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{gap.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-ink ${priorityStyles[gap.priority]}`}
            >
              {gap.priority}
            </span>
            {gap.document && (
              <Link
                to={`/documents/${gap.document._id}`}
                className="flex items-center gap-1.5 font-semibold text-ink hover:underline"
              >
                <span
                  className={`size-2 rounded-sm ${knowledgeBaseDot[gap.document.knowledgeBase?.color] ?? "bg-ink"}`}
                />
                {gap.document.title}
              </Link>
            )}
            {gap.rootCause && <span>· {rootCauseLabels[gap.rootCause]}</span>}
            <span>· {actionLabels[gap.recommendedAction]}</span>
          </p>
        </div>

        <span className="text-sm text-muted">
          {gap.assignee ? `Assigned to ${gap.assignee}` : "Unassigned"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`status-${gap._id}`} className="sr-only">
          Status of {gap.title}
        </label>
        <select
          id={`status-${gap._id}`}
          value={gap.status}
          onChange={changeStatus}
          disabled={busy}
          className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink"
        >
          {OPEN_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>

        {!gap.assignee && (
          <button
            type="button"
            onClick={assignToMe}
            disabled={busy}
            className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold hover:bg-ghost"
          >
            Assign to me
          </button>
        )}

        <button
          type="button"
          onClick={resolve}
          disabled={busy}
          className="ml-auto h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-ghost hover:brightness-125 disabled:opacity-50"
        >
          Mark resolved
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </li>
  );
};

export default GapRow;
