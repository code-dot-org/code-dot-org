import queryString from 'query-string';

/**
 * Gets the URL querystring params.
 * @param name Optionally pull a specific param.
 * @return Hash of params, or param string if `name` is specified.
 */
export function queryParams(name?: string): string | {
  [key: string]: string;
} {
  const parsed = queryString.parse(window.location.search);
  if (name) {
    const result = parsed[name];
    if (Array.isArray(result)) {
      return result[0] || '';
    }
    return result || '';
  }

  return parsed as {
    [key: string]: string;
  };
}

/**
 * Updates a query parameter in the URL via pushState (i.e. doesn't force a
 * reload).
 * @param param - Name of the query parameter to modify
 * @param value - New value (or undefined to remove)
 * @param useReplaceState - optional param if you wish to use replaceState
 *   instead of pushState
 */
export function updateQueryParam(param: string, value?: string, useReplaceState: boolean = false) {
  const newString = queryString.stringify({
    ...queryString.parse(window.location.search),
    [param]: value,
  });

  let newLocation = window.location.pathname;
  // Don't append ? unless we actually have a value
  if (newString) {
    newLocation += '?' + newString;
  }

  const method = useReplaceState ? 'replaceState' : 'pushState';
  window.history[method](null, document.title, newLocation);
}
