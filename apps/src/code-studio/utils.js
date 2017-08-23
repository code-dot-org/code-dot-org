import queryString from 'query-string';

// Provide methods that allow tests to mock window.location
let windowLocation = window.location;
export function setWindowLocation(fakeLocation) {
  windowLocation = fakeLocation;
}

export function resetWindowLocation() {
  windowLocation = window.location;
}

export function hasQueryParam(name) {
  const parsedParams = queryParams();

  // can't call hasOwnProperty directly due to bug in query-string:
  // https://github.com/sindresorhus/query-string/issues/50
  return Object.prototype.hasOwnProperty.call(parsedParams, name);
}

/**
 * Gets the URL querystring params.
 * @param name {string=} Optionally pull a specific param.
 * @return {object|string} Hash of params, or param string if `name` is specified.
 */
export function queryParams(name) {
  const parsed = queryString.parse(windowLocation.search);
  if (name) {
    return parsed[name];
  }
  return parsed;
}

/**
 * Updates a query parameter in the URL via pushState (i.e. doesn't force a
 * reload).
 * @param {string} param - Name of the query parameter to modify
 * @param {string} value - New value (or undefined to remove)
 * @param {boolean} useReplaceState - optional param if you wish to use replaceState
 *   instead of pushState
 */
export function updateQueryParam(param, value, useReplaceState=false) {
  const newString = queryString.stringify({
    ...queryString.parse(windowLocation.search),
    [param]: value
  });

  let newLocation = windowLocation.pathname;
  // Don't append ? unless we actually have a value
  if (newString) {
    newLocation += '?' + newString;
  }

  const method = useReplaceState ? 'replaceState' : 'pushState';
  window.history[method](null, document.title, newLocation);
}
