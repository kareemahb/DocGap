import { useApi } from "../hooks/useApi.js";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import SummaryCards from "../components/dashboard/SummaryCards.jsx";
import FixFirstTable from "../components/dashboard/FixFirstTable.jsx";
import ImpactCheckCard from "../components/dashboard/ImpactCheckCard.jsx";
import KnowledgeBaseHealthCard from "../components/dashboard/KnowledgeBaseHealthCard.jsx";
import TicketTrendChart from "../components/dashboard/TicketTrendChart.jsx";

const StatusMessage = ({ children }) => (
  <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-white p-8 text-center">
    {children}
  </div>
);

const DashboardPage = () => {
  const overview = useApi("/analytics/overview");

  if (overview.loading && !overview.data) {
    return (
      <StatusMessage>
        <p className="text-muted">Loading DocGap…</p>
      </StatusMessage>
    );
  }

  if (overview.error) {
    return (
      <StatusMessage>
        <p className="text-lg font-semibold">Couldn't load the dashboard</p>
        <p className="text-muted">{overview.error.message}</p>
        <button
          type="button"
          onClick={overview.reload}
          className="rounded-full bg-ink px-5 py-3 font-semibold text-ghost hover:brightness-125"
        >
          Try again
        </button>
      </StatusMessage>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader driverDocs={overview.data.driverDocs} />

      <SummaryCards overview={overview.data} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <FixFirstTable totalDocuments={overview.data.totalDocuments} />

        <div className="flex flex-col gap-6">
          <ImpactCheckCard />
          <KnowledgeBaseHealthCard />
        </div>
      </div>

      <TicketTrendChart />
    </div>
  );
};

export default DashboardPage;
