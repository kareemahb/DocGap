import { useApi } from "../../hooks/useApi.js";
import { rootCauseLabels, docRootCauses } from "../../lib/rootCauses.js";

const RootCauseBreakdown = ({ days }) => {
  const { data, loading, error } = useApi(
    `/analytics/root-causes?days=${days}`,
  );

  if (loading && !data)
    return <p className="text-muted">Loading root causes…</p>;
  if (error) return <p className="text-muted">{error.message}</p>;
  if (data.totalTickets === 0)
    return <p className="text-muted">No tickets in this period.</p>;

  const docTickets = data.rootCauses
    .filter((row) => docRootCauses.includes(row.rootCause))
    .reduce((sum, row) => sum + row.tickets, 0);
  const docShare = Math.round((docTickets / data.totalTickets) * 100);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-lg">
        <span className="text-3xl font-bold tracking-tight">{docShare}%</span>{" "}
        <span className="text-ink/80">
          of tickets point to a documentation problem
        </span>
      </p>

      <ul className="flex flex-col gap-3">
        {data.rootCauses.map((row) => {
          const share = Math.round((row.tickets / data.totalTickets) * 100);
          const isDocProblem = docRootCauses.includes(row.rootCause);
          return (
            <li key={row.rootCause}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="font-semibold">
                  {rootCauseLabels[row.rootCause]}
                </span>
                <span className="text-muted">
                  {row.tickets} tickets · {row.issues}{" "}
                  {row.issues === 1 ? "issue" : "issues"} · {share}%
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-ghost"
                aria-hidden="true"
              >
                <div
                  className={`h-full rounded-full ${isDocProblem ? "bg-ink" : "bg-alice"}`}
                  style={{ width: `${Math.max(share, 1)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-ink" /> Documentation can fix
          it
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-alice" /> Needs product or
          training
        </span>
      </p>
    </div>
  );
};

export default RootCauseBreakdown;
