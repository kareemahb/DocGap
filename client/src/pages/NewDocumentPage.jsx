import { useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { currentUser } from "../lib/currentUser.js";
import { useDataVersion } from "../context/dataVersion.js";
import DocumentForm, {
  toFormValues,
} from "../components/documents/DocumentForm.jsx";

const NewDocumentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useDataVersion();

  // Start with you as the owner, and the knowledge base you came from (if any)
  const initialValues = {
    ...toFormValues(),
    owner: currentUser.name,
    knowledgeBase: searchParams.get("knowledgeBase") ?? "",
  };

  const createDocument = async (payload) => {
    const created = await api.post("/documents", payload);
    refresh();
    navigate(`/documents/${created._id}`);
  };

  return (
    <section className="flex flex-col gap-6 rounded-card border border-line bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add document</h1>
        <p className="text-muted">
          DocGap will score it as soon as it's saved.
        </p>
      </div>
      <DocumentForm
        initialValues={initialValues}
        onSubmit={createDocument}
        submitLabel="Add document"
        cancelTo="/documents"
      />
    </section>
  );
};

export default NewDocumentPage;
