import { useCallback, useMemo, useState } from "react";
import { DataVersionContext } from "./dataVersion.js";

const DataVersionProvider = ({ children }) => {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((current) => current + 1), []);
  const value = useMemo(() => ({ version, refresh }), [version, refresh]);

  return (
    <DataVersionContext.Provider value={value}>
      {children}
    </DataVersionContext.Provider>
  );
};

export default DataVersionProvider;
