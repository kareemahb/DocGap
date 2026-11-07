import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

// Fetches `path` from the API and tracks loading, error and data
export const useApi = (path) => {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const requestKey = `${path}#${reloadCount}`;

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
