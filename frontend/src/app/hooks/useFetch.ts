// src/hooks/useFetch.ts
import { useState, useEffect } from "react";

export function useFetch<T = any>(promiseFactory: (() => Promise<T>) | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!promiseFactory);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (!promiseFactory) return;
    setLoading(true);
    promiseFactory()
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch((err) => {
        if (mounted) setError(err);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
