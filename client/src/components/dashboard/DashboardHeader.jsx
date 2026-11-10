import { useSearchParams } from "react-router";
import { currentUser } from "../../lib/currentUser.js";

const getGreeting = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// "Friday, 6 November", matching the design
const formatToday = (date) => {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${date.getDate()} ${month}`;
};

const describeDrivers = (driverDocs) => {
  if (driverDocs == null) return "Checking this week's tickets…";
  if (driverDocs === 0) return "No doc-related tickets this week.";
  const docs = driverDocs === 1 ? "1 doc is" : `${driverDocs} docs are`;
  return `${docs} driving most of this week's tickets. Start with the highest Debt Score.`;
};

const viewOptions = [
  { value: "mine", label: "My docs" },
  { value: "team", label: "Whole team" },
];

const DashboardHeader = ({ driverDocs }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "mine" ? "mine" : "team";
  const now = new Date();

  const changeView = (nextView) => {
    setSearchParams(nextView === "team" ? {} : { view: nextView }, {
      replace: true,
    });
  };

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          {formatToday(now)}
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {getGreeting(now)}, {currentUser.firstName}
        </h1>
        <p className="mt-2 text-lg text-ink/80">
          {describeDrivers(driverDocs)}
        </p>
      </div>

      <div
        role="group"
        aria-label="Show documents for"
        className="flex gap-1 rounded-tile border border-alice bg-sky p-1"
      >
        {viewOptions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => changeView(value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              view === value
                ? "bg-white shadow-sm"
                : "text-ink/70 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default DashboardHeader;
