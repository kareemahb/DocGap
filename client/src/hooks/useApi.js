import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useDataVersion } from "../context/dataVersion.js";

// Fetches `path` from the API and tracks loading, error and data.
// Refetches when the path changes, when reload() is called,
// or when anything in the app calls refresh() after saving data.
export const useApi = (path) => {
  const { version } = useDataVersion();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const requestKey = `${path}#${reloadCount}#${version}`;

  useEffect(() => {
    const controller = new AbortController();

    api
      .get(path, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setResult({ key: requestKey, data: null, error });
      });

    return () => controller.abort();
  }, [path, requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    data: result.data,
    error: result.error,
    loading: result.key !== requestKey,
    reload,
  };
};
