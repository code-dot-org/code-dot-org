import {useState, useEffect} from 'react';
import {flushSync} from 'react-dom';

const baseFetchState = {
  loading: false,
  data: null,
  response: null,
  error: null,
  status: null,
};

const EMPTY_OPTIONS = {};

/**
 * React hook for making a fetch request to a resource that returns a JSON
 * response.
 *
 * By default, fetch requests are configured with the following options:
 * - credentials: 'same-origin'
 * The default options can be overriden by the passed-in options.
 *
 * The 'loading' field of the return value indicates whether there is currently
 * a request in flight. Note that this value will initially be false and then
 * transition to true as a request is sent and internal state is updated
 * asynchronously.
 *
 * If the fetch request is successful, the body is parsed as json and the
 * resulting object is put in the 'data' field of the return value. If the
 * request is not successful or the body could not be parsed as json, the
 * 'error' field will contain an object representing the error.
 *
 * A new fetch request is sent whenever the given url or options change. As with
 * all React hooks, Object.is() is used to determine equality so callers should
 * use useMemo() if needed to ensure that the same options object is passed in
 * when the options have not changed.
 *
 * @param {string} url - URL of resource to fetch
 * @param {RequestInit} options - options to pass to fetch
 * @param {any[]} deps - array of values that fetch depends on; a new fetch
 *    request will be sent if any of the values in the array change
 * @returns {{loading: boolean, data: Object, error: Object, status: number | null}}
 */
export const useFetch = (url, options = EMPTY_OPTIONS) => {
  const [fetchState, setFetchState] = useState(baseFetchState);

  useEffect(() => {
    // This local variable tracks whether this instance of the effect has been
    // cancelled. One important case where this is true is when a previous instance
    // of the effect is canceled before a new instance is created when deps change.
    let canceled = false;

    // Likewise, the abortController is also a local variable and specifc to
    // this instance of the effect.
    let abortController;
    if (window.AbortController) {
      abortController = new AbortController();
    }

    const calculatedOptions = {
      credentials: 'same-origin',
      signal: abortController ? abortController.signal : undefined,
      ...options,
    };

    // This async IIFE contains the core of the fetch logic. Note that the
    // setFetchState calls are asynchronous so state that is set here isn't
    // returned to the caller until (at least) the next render cycle.
    (async () => {
      setFetchState({...baseFetchState, loading: true});
      let status = null;
      try {
        const response = await fetch(url, calculatedOptions);
        if (!response.ok) {
          status = response.status;
          throw new Error(
            `fetch request to ${url} failed with status code ${response.status}`
          );
        }

        const data = await response.json();
        if (!canceled) {
          flushSync(() => {
            setFetchState({
              ...baseFetchState,
              data,
              response,
              status: response.status,
            });
          });
        }
      } catch (e) {
        console.error(e);
        if (!canceled) {
          setFetchState({...baseFetchState, error: e, status});
        }
      }
    })();

    return () => {
      if (abortController) {
        canceled = true;
        abortController.abort();
      }
    };
  }, [url, options]);

  return {
    loading: fetchState.loading,
    data: fetchState.data,
    response: fetchState.response,
    error: fetchState.error,
    status: fetchState.status,
  };
};
