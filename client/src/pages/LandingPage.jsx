import { useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { ArrowRightIcon } from "../components/icons.jsx";

// ─── Content ──────────────────────────────────────────────────────
// Sample numbers from the demo workspace (the same data `npm run seed` creates)

const loopSteps = [
  {
    number: "01",
    title: "Identify",
    text: "Connect recurring support issues to the docs behind them and classify the root cause.",
  },
  {
    number: "02",
    title: "Measure",
    text: "Score each document on tickets, review age, feedback, missing info and business impact.",
  },
  {
    number: "03",
    title: "Prioritize",
    text: "Rank the queue by Debt Score so the most expensive gap is always on top.",
  },
  {
    number: "04",
    title: "Fix",
    text: "Assign an owner, move the gap through review, and mark it resolved.",
  },
  {
    number: "05",
    title: "Prove it",
    text: "Compare ticket volume before and after the fix to see whether it actually worked.",
    signature: true,
  },
];

// Reset your password's real Debt Score breakdown: 30 + 20 + 20 + 15 + 6.8 = 92
const scoreFactors = [
  { label: "Ticket volume", points: 30, max: 30 },
  { label: "Review age", points: 20, max: 20 },
  { label: "Business impact", points: 20, max: 20 },
  { label: "Missing info", points: 15, max: 15 },
  { label: "Feedback", points: 6.8, max: 15 },
];

const fixFirst = [
  {
    title: "Reset your password",
    meta: "Help Center · 42 tickets",
    score: 92,
    badge: "bg-ink text-ghost",
    dot: "bg-ink",
  },
  {
    title: "VPN connection troubleshooting",
    meta: "IT Runbooks · 31 tickets",
    score: 84,
    badge: "bg-ink text-ghost",
    dot: "bg-gold",
  },
  {
    title: "Update a payment method",
    meta: "Billing FAQ · 24 tickets",
    score: 71,
    badge: "bg-vanilla",
    dot: "bg-sage",
  },
];

const stats = [
  {
    label: "Highest debt",
    value: "92",
    detail: "Reset your password",
    accent: "text-vanilla",
  },
  { label: "Docs tracked", value: "128", detail: "across 4 knowledge bases" },
  { label: "Docs fixed", value: "7", detail: "in the last 14 days" },
  {
    label: "After the fix",
    value: "↓63%",
    detail: "related tickets",
    accent: "text-honeydew",
  },
];

const teams = [
  {
    name: "IT help desk",
    text: "Runbooks and access procedures that stop repeat tickets.",
    className: "bg-alice",
  },
  {
    name: "Customer support",
    text: "Macros and SOPs agents can actually follow.",
    className: "bg-vanilla",
  },
  {
    name: "Operations",
    text: "Processes that stay accurate when people move on.",
    className: "bg-honeydew",
  },
  {
    name: "Onboarding",
    text: "New hires who find the answer without asking.",
    className: "bg-ghost ring-1 ring-line",
  },
];

// ─── Small building blocks ────────────────────────────────────────

const Logo = () => (
  <span className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
    <span className="flex size-9 items-center justify-center gap-1 rounded-xl bg-ink">
      <span className="h-4 w-1.5 rounded-sm bg-ghost" />
      <span className="h-4 w-1.5 rounded-sm bg-vanilla" />
    </span>
    DocGap
  </span>
);

const PrimaryButton = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-ghost hover:brightness-125"
  >
    {children}
  </Link>
);

const SecondaryButton = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold hover:bg-ghost"
  >
    {children}
  </Link>
);

const Section = ({ id, className = "", children }) => (
  <section
    id={id}
    className={`scroll-mt-4 rounded-[2rem] px-5 py-12 sm:px-12 sm:py-16 ${className}`}
  >
    {children}
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────

const LandingPage = () => {
  // Wake the API while the visitor reads, so the dashboard is ready when they click "Get started"
  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4 bg-ghost p-3 sm:p-4">
      {/* ── Hero ── */}
      <section
        id="top"
        className="overflow-hidden rounded-[2rem] bg-alice px-5 pt-6 sm:px-12"
      >
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" aria-label="DocGap home">
            <Logo />
          </Link>

          <nav
            aria-label="Page sections"
            className="order-last flex w-full gap-1 overflow-x-auto rounded-full bg-ghost p-1.5 md:order-none md:w-auto"
          >
            <a
              href="#product"
              className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ghost"
            >
              Product
            </a>
            <a
              href="#loop"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium hover:bg-white"
            >
              How it works
            </a>
            <a
              href="#features"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Analytics
            </a>
            <a
              href="#teams"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Teams
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-2 py-2 text-sm font-semibold">
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ghost hover:brightness-125"
            >
              Get started <ArrowRightIcon size={14} />
            </Link>
          </div>
        </header>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-10 sm:mt-16">
          <div className="flex min-w-0 flex-[1_1_36rem] flex-col gap-6">
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <span className="size-2 rounded-full bg-ink" />
              Operational knowledge health
            </span>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Find the gaps before they become problems.
            </h1>
          </div>

          <div className="flex max-w-md flex-[1_1_20rem] flex-col gap-6 pb-2">
            <p className="text-lg text-ink/80">
              DocGap scores every SOP, runbook and help article by the support
              work it creates, tells you what to fix first, and proves whether
              the fix worked.
            </p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton to="/dashboard">
                Start a free workspace
              </PrimaryButton>
              <SecondaryButton to="/dashboard">See the demo</SecondaryButton>
            </div>
          </div>
        </div>

        {/* Product preview */}
        <div
          id="product"
          className="mt-14 grid scroll-mt-4 items-end gap-4 md:grid-cols-3"
        >
          <div className="flex flex-col gap-3 rounded-t-[1.75rem] bg-white p-5">
            <div className="flex items-center justify-between">
              <strong>Fix first</strong>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-ghost">
                This week
              </span>
            </div>
            {fixFirst.map((doc) => (
              <div
                key={doc.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{doc.title}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <span className={`size-2 rounded-sm ${doc.dot}`} />
                    {doc.meta}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2 py-1 text-sm font-bold ${doc.badge}`}
                >
                  {doc.score}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-t-[1.75rem] bg-vanilla p-6 md:min-h-80">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest">
                Documentation Debt Score
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-ink text-vanilla">
                <ArrowRightIcon size={16} className="-rotate-45" />
              </span>
            </div>
            <p className="flex items-baseline gap-2">
              <span className="text-8xl font-bold leading-none tracking-tighter">
                92
              </span>
              <span className="text-xl font-semibold">/100 · Critical</span>
            </p>
            <p className="text-lg font-semibold">Reset your password</p>
            <div className="flex flex-wrap gap-2">
              {["42 tickets", "Reviewed 14 mo ago", "Missing SSO steps"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-ink px-3 py-1 text-xs font-semibold"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-t-[1.75rem] bg-honeydew p-6">
            <span className="text-xs font-semibold uppercase tracking-widest">
              Did the fix work?
            </span>
            <p className="text-lg font-semibold">Two-factor setup guide</p>
            <div className="flex h-28 items-end gap-3" aria-hidden="true">
              <div className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <div className="h-full rounded-xl bg-sky ring-1 ring-ink/20" />
                <span className="text-xs font-semibold">Before · 38</span>
              </div>
              <div className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <div className="h-[37%] rounded-xl bg-ink" />
                <span className="text-xs font-semibold">After · 14</span>
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">↓ 63% tickets</p>
          </div>
        </div>
      </section>

      {/* ── The loop ── */}
      <Section id="loop" className="bg-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-3xl text-4xl font-semibold leading-none tracking-tight sm:text-6xl">
            One loop, from broken doc to proven fix.
          </h2>
          <p className="max-w-sm text-muted">
            Most tools stop at "article updated." DocGap keeps watching the
            tickets until the numbers say the problem is gone.
          </p>
        </div>

        <ol className="mt-10 border-b border-line">
          {loopSteps.map((step) => (
            <li
              key={step.number}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line py-6"
            >
              <span className="w-10 text-sm font-semibold text-muted">
                {step.number}
              </span>
              <span className="flex flex-[1_1_16rem] items-center gap-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                {step.title}
                {step.signature && (
                  <span className="rounded-full bg-vanilla px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Signature
                  </span>
                )}
              </span>
              <span className="flex-[1_1_20rem] text-ink/80">{step.text}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Signature features ── */}
      <div id="features" className="grid scroll-mt-4 gap-4 lg:grid-cols-2">
        <Section className="flex flex-col gap-6 bg-white">
          <span className="flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-widest">
            <span className="size-2 rounded-full bg-gold" />
            Documentation Debt Score
          </span>
          <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Not "this doc is old."
            <br />
            "This doc is costing you the most."
          </h3>
          <div className="rounded-3xl border border-line bg-ghost p-5">
            <div className="mb-4 flex items-center justify-between">
              <strong>Why the score is high</strong>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-ghost">
                92 · Critical
              </span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {scoreFactors.map((factor) => (
                <li
                  key={factor.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-32 shrink-0">{factor.label}</span>
                  <span
                    className="h-2 flex-1 overflow-hidden rounded-full bg-line"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full bg-ink"
                      style={{
                        width: `${(factor.points / factor.max) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="w-10 text-right font-semibold">
                    {factor.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section className="flex flex-col gap-6 bg-honeydew">
          <span className="self-start rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-ghost">
            Did the fix work?
          </span>
          <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Not "we updated the article."
            <br />
            "Updating it made a difference."
          </h3>
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  14 days before
                </p>
                <p className="text-5xl font-bold tracking-tight">38</p>
                <p className="text-xs text-muted">2FA-related tickets</p>
              </div>
              <ArrowRightIcon size={24} />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  14 days after
                </p>
                <p className="text-5xl font-bold tracking-tight">14</p>
                <p className="text-xs text-muted">2FA-related tickets</p>
              </div>
            </div>
            <p className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3 font-bold text-vanilla">
              ↓ 63% fewer tickets
              <span className="rounded-full bg-white px-3 py-0.5 text-xs text-ink">
                Fix worked
              </span>
            </p>
          </div>
        </Section>
      </div>

      {/* ── Numbers ── */}
      <Section className="bg-ink text-ghost">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            The demo workspace, in numbers.
          </h2>
          <span className="text-sm text-ghost/70">
            Sample data · IT and Support knowledge bases
          </span>
        </div>
        <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-t border-white/20 pt-5">
              <dt className="text-xs font-semibold uppercase tracking-widest text-ghost/70">
                {stat.label}
              </dt>
              <dd
                className={`mt-2 text-6xl font-bold tracking-tight ${stat.accent ?? ""}`}
              >
                {stat.value}
              </dd>
              <dd className="mt-1 text-sm text-ghost/80">{stat.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── Teams ── */}
      <Section id="teams" className="bg-white">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Built for the teams who answer the same question twice.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((team) => (
            <div
              key={team.name}
              className={`flex min-h-52 flex-col justify-between gap-10 rounded-3xl p-6 ${team.className}`}
            >
              <h3 className="text-xl font-bold">{team.name}</h3>
              <p className="text-ink/80">{team.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Call to action ── */}
      <Section className="flex flex-wrap items-end justify-between gap-8 bg-vanilla">
        <h2 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
          Turn documentation debt into actionable work.
        </h2>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton to="/dashboard">Get started</PrimaryButton>
          <SecondaryButton to="/dashboard">Book a walkthrough</SecondaryButton>
        </div>
      </Section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
        <span>
          © {new Date().getFullYear()} DocGap · Built by Kareemah Bahaadur
        </span>
        <nav aria-label="Footer" className="flex gap-6">
          <a href="#product" className="hover:text-ink">
            Product
          </a>
          <a href="#loop" className="hover:text-ink">
            How it works
          </a>
          <a
            href="https://github.com/kareemahb/DocGap"
            className="hover:text-ink"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;
