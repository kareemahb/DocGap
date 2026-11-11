// Knowledge gap values from the API → labels and badge styles

export const OPEN_STATUSES = ["open", "in_review", "in_progress"];

export const statusLabels = {
  open: "Open",
  in_review: "In review",
  in_progress: "In progress",
  resolved: "Resolved",
  archived: "Archived",
};

export const priorityStyles = {
  critical: "bg-ink text-ghost",
  high: "bg-vanilla",
  medium: "bg-alice",
  low: "bg-ghost ring-1 ring-line",
};

export const actionLabels = {
  update_existing: "Update existing doc",
  create_new: "Write a new doc",
  clarify: "Clarify the doc",
  escalate_to_product: "Escalate to product",
};

export const verdictBadges = {
  worked: { label: "Fix worked", className: "bg-honeydew" },
  partial: { label: "Partly worked", className: "bg-vanilla" },
  no_improvement: {
    label: "No improvement",
    className: "bg-ghost ring-1 ring-line",
  },
  not_enough_data: {
    label: "Not enough data",
    className: "bg-ghost ring-1 ring-line",
  },
  too_early: { label: "Too early", className: "bg-sky ring-1 ring-alice" },
};
