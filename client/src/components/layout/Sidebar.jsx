import { Link, NavLink, useLocation, useSearchParams } from "react-router";
import { useApi } from "../../hooks/useApi.js";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import { currentUser, workspace } from "../../lib/currentUser.js";
import { navItems } from "./navItems.js";
import { ChevronUpDownIcon, PlusIcon } from "../icons.jsx";

const navLinkClasses = ({ isActive }) =>
  isActive
    ? "flex items-center gap-3 rounded-xl bg-sky px-3 py-2.5 font-semibold"
    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink/80 hover:bg-ghost";

const Sidebar = () => {
  const overview = useApi("/analytics/overview");
  const knowledgeBases = useApi("/knowledge-bases");
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const counts = {
    documents: overview.data?.totalDocuments,
    issues: overview.data?.unlinkedIssues,
  };
  const activeKnowledgeBase =
    pathname === "/documents" ? searchParams.get("knowledgeBase") : null;

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-white px-4 py-5 md:flex">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 px-1 text-2xl font-bold tracking-tight"
      >
        <span className="flex size-9 items-center justify-center gap-1 rounded-xl bg-ink">
          <span className="h-4 w-1.5 rounded-sm bg-ghost" />
          <span className="h-4 w-1.5 rounded-sm bg-vanilla" />
        </span>
        DocGap
      </Link>

      {/* Workspace */}
      <div className="flex items-center gap-3 rounded-tile border border-alice bg-sky p-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-sm font-bold">
          {workspace.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="font-semibold">{workspace.name}</span>
          <span className="text-xs text-muted">
            Workspace · {workspace.members} members
          </span>
        </span>
        <ChevronUpDownIcon size={16} className="text-muted" />
      </div>

      {/* Main navigation */}
      <nav aria-label="Main" className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: ItemIcon, end, countKey }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClasses}>
            <ItemIcon />
            <span className="flex-1">{label}</span>
            {countKey && counts[countKey] != null && (
              <span className="text-sm text-muted">{counts[countKey]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Knowledge bases */}
      <section aria-labelledby="kb-heading" className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 pb-1">
          <h2
            id="kb-heading"
            className="text-xs font-semibold uppercase tracking-widest text-muted"
          >
            Knowledge bases
          </h2>
          <Link
            to="/knowledge-bases/new"
            aria-label="Add knowledge base"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-ghost"
          >
            <PlusIcon size={16} />
          </Link>
        </div>

        {knowledgeBases.loading && !knowledgeBases.data && (
          <p className="px-3 text-sm text-muted">Loading…</p>
        )}
        {knowledgeBases.error && (
          <p className="px-3 text-sm text-muted">
            Couldn't load knowledge bases.
          </p>
        )}

        {knowledgeBases.data?.map((kb) => (
          <Link
            key={kb._id}
            to={`/documents?knowledgeBase=${kb._id}`}
            aria-current={activeKnowledgeBase === kb._id ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
              activeKnowledgeBase === kb._id
                ? "bg-sky font-semibold"
                : "text-ink/80 hover:bg-ghost"
            }`}
          >
            <span
              className={`size-2.5 rounded-sm ${knowledgeBaseDot[kb.color] ?? "bg-ink"}`}
            />
            <span className="flex-1">{kb.name}</span>
            <span className="text-sm text-muted">{kb.documentCount}</span>
          </Link>
        ))}
      </section>

      {/* Signed-in user */}
      <div className="mt-auto flex items-center gap-3 border-t border-line px-1 pt-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ghost">
          {currentUser.initials}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-semibold">{currentUser.name}</span>
          <span className="text-sm text-muted">{currentUser.role}</span>
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
