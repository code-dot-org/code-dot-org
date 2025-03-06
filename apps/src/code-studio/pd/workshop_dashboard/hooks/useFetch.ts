import {useEffect, useState} from 'react';

export const useFetch = <T>({
  url,
  options,
}: {
  url?: RequestInfo | URL;
  options?: RequestInit;
}): [
  T | null,
  {
    loading: boolean;
    error: string | null;
  }
] => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!url) return;
    mounted && setError(null);

    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        mounted && setData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        mounted && setError(errorMessage);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [url, options]);

  return [data, {loading, error}];
};
