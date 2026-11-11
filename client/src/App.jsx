import { Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import DocumentDetailPage from "./pages/DocumentDetailPage.jsx";
import NewDocumentPage from "./pages/NewDocumentPage.jsx";
import EditDocumentPage from "./pages/EditDocumentPage.jsx";
import IssuesPage from "./pages/IssuesPage.jsx";
import ImpactPage from "./pages/ImpactPage.jsx";
import NewKnowledgeBasePage from "./pages/NewKnowledgeBasePage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="documents/new" element={<NewDocumentPage />} />
      <Route path="documents/:id" element={<DocumentDetailPage />} />
      <Route path="documents/:id/edit" element={<EditDocumentPage />} />
      <Route path="issues" element={<IssuesPage />} />
      <Route path="impact" element={<ImpactPage />} />
      <Route
        path="reports"
        element={
          <PlaceholderPage
            title="Reports"
            description="Ticket trends and knowledge base health over time."
          />
        }
      />
      <Route path="knowledge-bases/new" element={<NewKnowledgeBasePage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
