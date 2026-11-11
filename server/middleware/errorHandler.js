// Any URL that didn't match a route ends up here
export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Every error in the app ends up here, including ones thrown in async controllers
export const errorHandler = (err, req, res, next) => {
  let status = err.status ?? 500;
  let message = err.message ?? "Server error";
  let errors;

  // Schema rule broken (missing title, bad enum value): one message per field
  if (err.name === "ValidationError") {
    status = 400;
    message = "Please fix the highlighted fields.";
    errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, fieldError]) => [
        field,
        fieldError.message,
      ]),
    );
  }

  // Malformed id, like /api/documents/abc
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid id: ${err.value}`;
  }

  // A `unique` field already has this value, like a knowledge base name
  if (err.code === 11000) {
    status = 409;
    message = `Already exists: ${Object.values(err.keyValue ?? {}).join(", ")}`;
  }

  res.status(status).json({
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
