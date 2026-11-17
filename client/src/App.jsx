import { Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import DocumentDetailPage from "./pages/DocumentDetailPage.jsx";
import NewDocumentPage from "./pages/NewDocumentPage.jsx";
import EditDocumentPage from "./pages/EditDocumentPage.jsx";
import IssuesPage from "./pages/IssuesPage.jsx";
import ImpactPage from "./pages/ImpactPage.jsx";
import NewKnowledgeBasePage from "./pages/NewKnowledgeBasePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const App = () => (
  <Routes>
    {/* Public landing page: no sidebar */}
    <Route index element={<LandingPage />} />

    {/* The app: every page inside the sidebar + top bar layout */}
    <Route element={<AppLayout />}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="documents/new" element={<NewDocumentPage />} />
      <Route path="documents/:id" element={<DocumentDetailPage />} />
      <Route path="documents/:id/edit" element={<EditDocumentPage />} />
      <Route path="issues" element={<IssuesPage />} />
      <Route path="impact" element={<ImpactPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="knowledge-bases/new" element={<NewKnowledgeBasePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
