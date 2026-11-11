import { useState } from "react";
import { Link } from "react-router";
import { knowledgeBaseDot } from "../../lib/knowledgeBases.js";
import Field from "../forms/Field.jsx";

const COLORS = [
  { value: "black", label: "Black" },
  { value: "yellow", label: "Gold" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
];

const inputClasses =
  "h-11 rounded-xl border border-line bg-white px-3 outline-none focus:border-ink aria-[invalid=true]:border-red-700";

const KnowledgeBaseForm = ({ onSubmit, submitLabel, cancelTo }) => {
  const [values, setValues] = useState({
    name: "",
    color: "black",
    description: "",
  });
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
    setFormError("");

    if (!values.name.trim()) {
      setErrors({ name: "Give the knowledge base a name." });
      document.getElementById("name")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        color: values.color,
        description: values.description.trim() || null,
      });
    } catch (error) {
      if (error.status === 409) {
        setErrors({ name: "There's already a knowledge base with that name." });
      } else {
        setErrors(error.fields ?? {});
        setFormError(error.message);
      }
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {formError && (
        <p
          role="alert"
          className="rounded-tile border border-red-700/30 bg-red-50 p-4 font-semibold text-red-800"
        >
          {formError}
        </p>
      )}

      <Field id="name" label="Name" required error={errors.name}>
        {(fieldProps) => (
          <input
            {...fieldProps}
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Security Policies"
            className={inputClasses}
          />
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Color</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                values.color === value
                  ? "border-ink bg-ghost"
                  : "border-line hover:bg-ghost"
              }`}
            >
              <input
                type="radio"
                name="color"
                value={value}
                checked={values.color === value}
                onChange={handleChange}
                className="sr-only"
              />
              <span
                className={`size-3 rounded-sm ${knowledgeBaseDot[value]}`}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        id="description"
        label="Description"
        hint="Optional. What kind of docs live here?"
        error={errors.description}
      >
        {(fieldProps) => (
          <input
            {...fieldProps}
            name="description"
            value={values.description}
            onChange={handleChange}
            className={inputClasses}
          />
        )}
      </Field>

      <div className="flex items-center justify-between gap-3 rounded-tile bg-ghost p-4">
        <span className="text-sm text-muted">Sidebar preview</span>
        <span className="flex items-center gap-3 font-semibold">
          <span
            className={`size-2.5 rounded-sm ${knowledgeBaseDot[values.color]}`}
          />
          {values.name.trim() || "New knowledge base"}
        </span>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          to={cancelTo}
          className="flex h-11 items-center rounded-xl border border-line bg-white px-5 font-semibold hover:bg-ghost"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-xl bg-ink px-5 font-semibold text-ghost hover:brightness-125 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default KnowledgeBaseForm;
