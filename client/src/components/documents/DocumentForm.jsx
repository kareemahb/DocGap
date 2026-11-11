import { useState } from "react";
import { Link } from "react-router";
import { useApi } from "../../hooks/useApi.js";
import Field from "../forms/Field.jsx";

const DOCUMENT_TYPES = ["KB Article", "SOP", "Runbook", "Guide", "Policy"];
const IMPACT_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];
const NOTE_LIMIT = 80;

const inputClasses =
  "h-11 rounded-xl border border-line bg-white px-3 outline-none focus:border-ink aria-[invalid=true]:border-red-700";

const today = () => new Date().toISOString().slice(0, 10);

// Empty form, or a document from the API turned into form values
export const toFormValues = (doc) => ({
  title: doc?.title ?? "",
  knowledgeBase: doc?.knowledgeBase?._id ?? doc?.knowledgeBase ?? "",
  type: doc?.type ?? "KB Article",
  owner: doc?.owner ?? "",
  url: doc?.url ?? "",
  note: doc?.note ?? "",
  businessImpact: doc?.businessImpact ?? "medium",
  negativeFeedback: String(doc?.negativeFeedback ?? 0),
  missingInfo: doc?.missingInfo ?? false,
  notWrittenYet: doc ? doc.lastReviewedAt === null : false,
  lastReviewedAt: doc?.lastReviewedAt
    ? doc.lastReviewedAt.slice(0, 10)
    : today(),
});

// Form values → the JSON the API expects
const toPayload = (values) => {
  const textOrNull = (text) => text.trim() || null;
  return {
    title: values.title.trim(),
    knowledgeBase: values.knowledgeBase,
    type: values.type,
    owner: textOrNull(values.owner),
    url: textOrNull(values.url),
    note: textOrNull(values.note),
    businessImpact: values.businessImpact,
    negativeFeedback: Number(values.negativeFeedback),
    missingInfo: values.missingInfo,
    lastReviewedAt: values.notWrittenYet ? null : values.lastReviewedAt,
  };
};

// Quick checks before calling the API; the server still validates everything
const validate = (values) => {
  const errors = {};
  if (!values.title.trim()) errors.title = "Give the document a title.";
  if (!values.knowledgeBase) errors.knowledgeBase = "Choose a knowledge base.";
  if (values.note.length > NOTE_LIMIT)
    errors.note = `Keep the note to ${NOTE_LIMIT} characters or fewer.`;
  const feedback = Number(values.negativeFeedback);
  if (!Number.isInteger(feedback) || feedback < 0)
    errors.negativeFeedback = "Use a whole number, 0 or more.";
  if (!values.notWrittenYet && !values.lastReviewedAt)
    errors.lastReviewedAt = "Pick a review date.";
  return errors;
};

const DocumentForm = ({ initialValues, onSubmit, submitLabel, cancelTo }) => {
  const knowledgeBases = useApi("/knowledge-bases");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const clientErrors = validate(values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      document.getElementById(Object.keys(clientErrors)[0])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setErrors(error.fields ?? {});
      setFormError(error.message);
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

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="title" label="Title" required error={errors.title}>
          {(fieldProps) => (
            <input
              {...fieldProps}
              name="title"
              value={values.title}
              onChange={handleChange}
              className={inputClasses}
            />
          )}
        </Field>

        <Field
          id="knowledgeBase"
          label="Knowledge base"
          required
          error={errors.knowledgeBase}
        >
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="knowledgeBase"
              value={values.knowledgeBase}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">
                {knowledgeBases.loading ? "Loading…" : "Choose one"}
              </option>
              {knowledgeBases.data?.map((kb) => (
                <option key={kb._id} value={kb._id}>
                  {kb.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="type" label="Type">
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="type"
              value={values.type}
              onChange={handleChange}
              className={inputClasses}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="owner"
          label="Owner"
          hint="Who keeps this document up to date."
          error={errors.owner}
        >
          {(fieldProps) => (
            <input
              {...fieldProps}
              name="owner"
              value={values.owner}
              onChange={handleChange}
              className={inputClasses}
            />
          )}
        </Field>

        <div className="md:col-span-2">
          <Field
            id="url"
            label="Link to the document"
            hint="Where the doc lives, like Confluence or Notion."
            error={errors.url}
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="url"
                name="url"
                value={values.url}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field
            id="note"
            label="What's wrong with it?"
            hint={`Short and specific, like "missing SSO steps". ${values.note.length}/${NOTE_LIMIT}`}
            error={errors.note}
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                name="note"
                value={values.note}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
          </Field>
        </div>
      </div>

      <fieldset className="flex flex-col gap-5 rounded-tile border border-line p-5">
        <legend className="px-1 text-sm font-semibold uppercase tracking-widest text-muted">
          Debt Score inputs
        </legend>

        <div className="flex flex-col gap-2">
          <span id="impact-label" className="font-semibold">
            Business impact
          </span>
          <div
            role="radiogroup"
            aria-labelledby="impact-label"
            className="flex flex-wrap gap-2"
          >
            {IMPACT_LEVELS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  values.businessImpact === value
                    ? "border-ink bg-ink text-ghost"
                    : "border-line hover:bg-ghost"
                }`}
              >
                <input
                  type="radio"
                  name="businessImpact"
                  value={value}
                  checked={values.businessImpact === value}
                  onChange={handleChange}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            id="negativeFeedback"
            label="Negative feedback reports"
            error={errors.negativeFeedback}
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="number"
                min="0"
                step="1"
                name="negativeFeedback"
                value={values.negativeFeedback}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
          </Field>

          <Field
            id="lastReviewedAt"
            label="Last reviewed"
            error={errors.lastReviewedAt}
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="date"
                max={today()}
                name="lastReviewedAt"
                value={values.lastReviewedAt}
                onChange={handleChange}
                disabled={values.notWrittenYet}
                className={`${inputClasses} disabled:opacity-50`}
              />
            )}
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="missingInfo"
              checked={values.missingInfo}
              onChange={handleChange}
              className="size-5 accent-ink"
            />
            <span>It's missing information people need</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notWrittenYet"
              checked={values.notWrittenYet}
              onChange={handleChange}
              className="size-5 accent-ink"
            />
            <span>This doc hasn't been written yet</span>
          </label>
        </div>
      </fieldset>

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

export default DocumentForm;
