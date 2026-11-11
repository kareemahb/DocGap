import { useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useDataVersion } from "../context/dataVersion.js";
import KnowledgeBaseForm from "../components/knowledgeBases/KnowledgeBaseForm.jsx";

const NewKnowledgeBasePage = () => {
  const navigate = useNavigate();
  const { refresh } = useDataVersion();

  const createKnowledgeBase = async (payload) => {
    const created = await api.post("/knowledge-bases", payload);
    refresh();
    navigate(`/documents?knowledgeBase=${created._id}`);
  };

  return (
    <section className="flex max-w-2xl flex-col gap-6 rounded-card border border-line bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          New knowledge base
        </h1>
        <p className="text-muted">
          Group related documents, like a Help Center or IT Runbooks.
        </p>
      </div>
      <KnowledgeBaseForm
        onSubmit={createKnowledgeBase}
        submitLabel="Create knowledge base"
        cancelTo="/"
      />
    </section>
  );
};

export default NewKnowledgeBasePage;
