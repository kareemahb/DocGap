// Root cause values from the API → readable labels
export const rootCauseLabels = {
  missing_documentation: "Missing docs",
  outdated_documentation: "Outdated docs",
  confusing_documentation: "Confusing docs",
  product_bug: "Product bug",
  user_education: "User education",
  product_limitation: "Product limitation",
};

// Root causes that a documentation fix can actually solve
export const docRootCauses = [
  "missing_documentation",
  "outdated_documentation",
  "confusing_documentation",
];
