// A labeled form field with an optional hint and error message.
// Pass the input itself as `children`; Field wires up the ids for accessibility.
const Field = ({ id, label, hint, error, required = false, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold">
        {label}
        {required && <span className="text-muted"> (required)</span>}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby":
          [hintId, errorId].filter(Boolean).join(" ") || undefined,
      })}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
