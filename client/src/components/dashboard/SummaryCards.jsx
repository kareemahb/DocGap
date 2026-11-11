import { Link } from "react-router";
import { ArrowRightIcon } from "../icons.jsx";

const SummaryCard = ({ label, dotClass, value, detail, linkTo, linkLabel }) => (
  <section className="flex flex-col gap-3 rounded-card border border-line bg-white p-5">
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
      <span className={`size-2 rounded-full ${dotClass}`} />
      {label}
    </h2>
    <p className="flex flex-wrap items-baseline gap-x-3">
      <span className="text-5xl font-bold tracking-tight">{value}</span>
      <span className="text-ink/80">{detail}</span>
    </p>
    <Link
      to={linkTo}
      className="flex items-center gap-1.5 self-start font-semibold hover:underline"
    >
      {linkLabel}
      <ArrowRightIcon size={16} />
    </Link>
  </section>
);

const describeOldestReview = (days) => {
  if (days == null) return "none reviewed yet";
  const months = Math.round(days / 30);
  return months >= 1
    ? `oldest review ${months} months ago`
    : `oldest review ${days} days ago`;
};

const SummaryCards = ({ overview }) => {
  const { highDebt, unlinkedIssues, ticketsThisWeek, fixesToVerify } = overview;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        label="High-debt docs"
        dotClass="bg-ink"
        value={highDebt.count}
        detail={describeOldestReview(highDebt.oldestReviewDays)}
        linkTo="/documents"
        linkLabel="Review docs"
      />
      <SummaryCard
        label="Unlinked issues"
        dotClass="bg-gold"
        value={unlinkedIssues}
        detail={`${ticketsThisWeek.count} tickets this week`}
        linkTo="/issues?show=unlinked"
        linkLabel="Link issues"
      />
      <SummaryCard
        label="Fixes to verify"
        dotClass="bg-sage"
        value={fixesToVerify.count}
        detail={`${fixesToVerify.ready} ready for before/after`}
        linkTo="/impact"
        linkLabel="See impact"
      />
    </div>
  );
};

export default SummaryCards;
