import { Link } from "react-router";

const NotFoundPage = () => (
  <section className="flex flex-col items-start gap-3 rounded-card bg-white p-6">
    <p className="text-6xl font-bold tracking-tight">404</p>
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="text-muted">That page doesn't exist. It might have moved.</p>
    <Link
      to="/"
      className="rounded-full bg-ink px-5 py-3 font-semibold text-ghost"
    >
      Back to dashboard
    </Link>
  </section>
);

export default NotFoundPage;
