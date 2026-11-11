import { Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import DocumentDetailPage from "./pages/DocumentDetailPage.jsx";
import NewDocumentPage from "./pages/NewDocumentPage.jsx";
import EditDocumentPage from "./pages/EditDocumentPage.jsx";
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
      <Route
        path="issues"
        element={
          <PlaceholderPage
            title="Ticket issues"
            description="Track recurring problems and link them to the docs behind them."
          />
        }
      />
      <Route
        path="impact"
        element={
          <PlaceholderPage
            title="Impact"
            description="See whether each documentation fix reduced related tickets."
          />
        }
      />
      <Route
        path="reports"
        element={
          <PlaceholderPage
            title="Reports"
            description="Ticket trends and knowledge base health over time."
          />
        }
      />
      <Route
        path="knowledge-bases/new"
        element={
          <PlaceholderPage
            title="New knowledge base"
            description="Group related documents, like a Help Center or IT Runbooks."
          />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
