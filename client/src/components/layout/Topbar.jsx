import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import { navItems } from "./navItems.js";
import { BellIcon, PlusIcon, SearchIcon } from "../icons.jsx";

const mobileLinkClasses = ({ isActive }) =>
  isActive
    ? "whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ghost"
    : "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium hover:bg-ghost";

const Topbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("q") ?? "";

  // Search sends you to the Documents page with ?q=
  const handleSearch = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q").trim();
    navigate(
      query ? `/documents?q=${encodeURIComponent(query)}` : "/documents",
    );
  };

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        {/* Logo shows here on phones, where the sidebar is hidden */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold md:hidden"
        >
          <span className="flex size-8 items-center justify-center gap-1 rounded-lg bg-ink">
            <span className="h-3.5 w-1 rounded-sm bg-ghost" />
            <span className="h-3.5 w-1 rounded-sm bg-vanilla" />
          </span>
          DocGap
        </Link>

        <form
          role="search"
          onSubmit={handleSearch}
          className="order-last w-full sm:order-none sm:w-auto sm:max-w-md sm:flex-1"
        >
          <label htmlFor="global-search" className="sr-only">
            Search docs, issues, runbooks
          </label>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-ghost px-3 focus-within:border-ink">
            <SearchIcon className="text-muted" />
            <input
              key={currentSearch}
              id="global-search"
              name="q"
              type="search"
              defaultValue={currentSearch}
              placeholder="Search docs, issues, runbooks…"
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-white hover:bg-ghost"
          >
            <BellIcon />
          </button>
          <Link
            to="/issues"
            className="hidden h-11 items-center rounded-xl border border-line bg-white px-4 font-semibold hover:bg-ghost sm:flex"
          >
            Link an issue
          </Link>
          <Link
            to="/documents/new"
            className="flex h-11 items-center gap-2 rounded-xl bg-ink px-4 font-semibold text-ghost hover:brightness-125"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add document</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Phone-size navigation (the sidebar is hidden below the md breakpoint) */}
      <nav
        aria-label="Main"
        className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden"
      >
        {navItems.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileLinkClasses}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Topbar;
