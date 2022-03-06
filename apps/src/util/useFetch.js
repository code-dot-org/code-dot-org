import {useState, useEffect} from 'react';

export const useFetch = (url, options = {}, deps = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    let defaultOptions = {
      credentials: 'same-origin'
    };

    let abortController;
    if (window.AbortController) {
      abortController = new AbortController();
      defaultOptions = {
        ...defaultOptions,
        signal: abortController.signal
      };
    }

    options = {
      ...defaultOptions,
      ...options
    };

    (async () => {
      setLoading(true);
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setData(data);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, deps);

  return {
    loading: loading,
    error: error,
    data: data
  };
};
