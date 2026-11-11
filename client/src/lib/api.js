const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// An error that carries the HTTP status, plus per-field messages for forms
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

// Every request in the app goes through this one function
export const apiRequest = async (
  path,
  { method = "GET", body, signal } = {},
) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch((error) => {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Can't reach the DocGap API. Is the server running?", 0);
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed (${response.status})`,
      response.status,
      data?.errors,
    );
  }

  return data;
};

// Shorthand helpers: api.get("/documents"), api.post("/gaps", { title: "..." })
export const api = {
  get: (path, options) => apiRequest(path, options),
  post: (path, body, options) =>
    apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
