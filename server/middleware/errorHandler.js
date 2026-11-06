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

  // Schema rule broken (missing title, bad enum value)
  if (err.name === "ValidationError") status = 400;

  // Malformed id, like /api/documents/abc
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid id: ${err.value}`;
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
