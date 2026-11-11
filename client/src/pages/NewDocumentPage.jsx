import { Link, useNavigate, useParams } from "react-router";
import { api } from "../lib/api.js";
import { useApi } from "../hooks/useApi.js";
import DocumentForm, {
  toFormValues,
} from "../components/documents/DocumentForm.jsx";

const EditDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: doc, loading, error } = useApi(`/documents/${id}`);

  if (loading && !doc)
    return (
      <p className="rounded-card border border-line bg-white p-6 text-muted">
        Loading document…
      </p>
    );

  if (error) {
    return (
      <section className="flex flex-col items-start gap-3 rounded-card border border-line bg-white p-6">
        <h1 className="text-2xl font-semibold">Document not found</h1>
        <Link to="/documents" className="font-semibold underline">
          ← Back to documents
        </Link>
      </section>
    );
  }

  const saveDocument = async (payload) => {
    await api.put(`/documents/${id}`, payload);
    navigate(`/documents/${id}`);
  };

  return (
    <section className="flex flex-col gap-6 rounded-card border border-line bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit document</h1>
        <p className="text-muted">{doc.title}</p>
      </div>
      <DocumentForm
        key={doc._id}
        initialValues={toFormValues(doc)}
        onSubmit={saveDocument}
        submitLabel="Save changes"
        cancelTo={`/documents/${id}`}
      />
    </section>
  );
};

export default EditDocumentPage;
