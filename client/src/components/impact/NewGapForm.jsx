import { useState } from "react";
import { api } from "../../lib/api.js";
import { rootCauseLabels } from "../../lib/rootCauses.js";
import { actionLabels } from "../../lib/gaps.js";
import Field from "../forms/Field.jsx";

const inputClasses =
  "h-11 rounded-xl border border-line bg-white px-3 outline-none focus:border-ink aria-[invalid=true]:border-red-700";

const emptyGap = {
  title: "",
  document: "",
  rootCause: "outdated_documentation",
  recommendedAction: "update_existing",
  priority: "medium",
};

const NewGapForm = ({ documents, onCreated, onCancel }) => {
  const [values, setValues] = useState(emptyGap);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = {};
    if (!values.title.trim()) clientErrors.title = "Describe what's wrong.";
    if (!values.document) clientErrors.document = "Choose the document to fix.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      document.getElementById(Object.keys(clientErrors)[0])?.focus();
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/gaps", { ...values, title: values.title.trim() });
      await onCreated();
    } catch (error) {
      setErrors(error.fields ?? {});
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-tile border border-line bg-ghost p-5"
    >
      {formError && (
        <p role="alert" className="font-semibold text-red-800">
          {formError}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="title" label="What's wrong?" required error={errors.title}>
          {(fieldProps) => (
            <input
              {...fieldProps}
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Reset steps don't cover SSO accounts"
              className={inputClasses}
            />
          )}
        </Field>

        <Field id="document" label="Document" required error={errors.document}>
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="document"
              value={values.document}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">
                {documents ? "Choose a document" : "Loading…"}
              </option>
              {documents?.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.title}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="rootCause" label="Root cause">
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="rootCause"
              value={values.rootCause}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.entries(rootCauseLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="recommendedAction" label="Recommended action">
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="recommendedAction"
              value={values.recommendedAction}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.entries(actionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="priority" label="Priority">
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="priority"
              value={values.priority}
              onChange={handleChange}
              className={inputClasses}
            >
              {["low", "medium", "high", "critical"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority[0].toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-line bg-white px-4 font-semibold hover:bg-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-xl bg-ink px-4 font-semibold text-ghost hover:brightness-125 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Create gap"}
        </button>
      </div>
    </form>
  );
};

export default NewGapForm;
