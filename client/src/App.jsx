const swatches = [
  { name: "Alice Blue", hex: "#D8DFE9", className: "bg-alice" },
  { name: "Honeydew", hex: "#CFDECA", className: "bg-honeydew" },
  { name: "Vanilla", hex: "#EFF0A3", className: "bg-vanilla" },
  { name: "Eerie Black", hex: "#212121", className: "bg-ink text-ghost" },
  { name: "Ghost White", hex: "#F6F5FA", className: "bg-ghost" },
];

const severities = [
  { label: "Critical", score: 88, className: "bg-ink text-ghost" },
  { label: "High", score: 72, className: "bg-vanilla" },
  { label: "Medium", score: 42, className: "bg-alice" },
  { label: "Healthy", score: 19, className: "bg-honeydew" },
];

const App = () => (
  <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-xl font-bold">
        <span className="flex size-9 items-center justify-center gap-1 rounded-xl bg-ink">
          <span className="h-4 w-1.5 rounded-sm bg-ghost" />
          <span className="h-4 w-1.5 rounded-sm bg-vanilla" />
        </span>
        DocGap
      </div>
      <button
        type="button"
        className="rounded-full bg-ink px-5 py-3 font-semibold text-ghost transition hover:brightness-125"
      >
        + New knowledge gap
      </button>
    </header>

    <section className="rounded-card bg-white p-6">
      <h1 className="text-4xl font-semibold tracking-tight">
        Find the gaps before they become problems.
      </h1>
      <p className="mt-2 text-muted">
        Direction A theme preview: Urbanist plus five brand colors.
      </p>
    </section>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {swatches.map(({ name, hex, className }) => (
        <div
          key={name}
          className={`flex h-36 flex-col justify-end rounded-tile p-4 ${className}`}
        >
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-xs opacity-80">{hex}</span>
        </div>
      ))}
    </section>

    <section className="rounded-card bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">Debt score badges</h2>
      <div className="flex flex-wrap gap-3">
        {severities.map(({ label, score, className }) => (
          <span
            key={label}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${className}`}
          >
            {score} · {label}
          </span>
        ))}
      </div>
    </section>

    <section className="rounded-card bg-honeydew p-6">
      <p className="text-sm font-semibold">Did the fix work?</p>
      <p className="mt-1 text-5xl font-bold tracking-tight">↓ 72%</p>
      <p className="mt-1">Printer Driver Install Guide · 32 → 9 tickets</p>
    </section>
  </main>
);

export default App;
