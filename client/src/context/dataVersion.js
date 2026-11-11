import { createContext, useContext } from "react";

// A counter shared by the whole app. Bumping it tells every useApi call to fetch fresh data.
export const DataVersionContext = createContext({
  version: 0,
  refresh: () => {},
});

export const useDataVersion = () => useContext(DataVersionContext);
