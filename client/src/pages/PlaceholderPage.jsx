const PlaceholderPage = ({ title, description }) => (
  <section className="rounded-card bg-white p-6">
    <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
    <p className="mt-2 text-muted">{description}</p>
    <span className="mt-4 inline-block rounded-full bg-vanilla px-3 py-1 text-sm font-semibold">
      Coming in Sprint 5
    </span>
  </section>
);

export default PlaceholderPage;
