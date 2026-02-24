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
 * @param {string | undefined} value - New value (or undefined to remove)
 * @param {boolean} useReplaceState - optional param if you wish to use replaceState
 *   instead of pushState
 */
export function updateQueryParam(param, value, useReplaceState = false) {
  const newString = queryString.stringify({
    ...queryString.parse(windowLocation.search),
    [param]: value,
  });

  let newLocation = windowLocation.pathname;
  // Don't append ? unless we actually have a value
  if (newString) {
    newLocation += '?' + newString;
  }

  const method = useReplaceState ? 'replaceState' : 'pushState';
  window.history[method](null, document.title, newLocation);
}

/**
 * We have various cookies that we want to be environment specific. We accomplish
 * this by tacking on the rack_env (unless we're in prod). This helper gets the
 * appropriate cookie name
 * @param {string} name - Base cookie name
 * @returns {string} Actual cookie name, with the rack_env appended
 */
export function environmentSpecificCookieName(name) {
  const rack_env = window.dashboard.rack_env;
  if (rack_env === 'production') {
    return name;
  }

  return `${name}_${rack_env}`;
}

/**
 * Given a host name (e.g. studio.code.org) return the site's root domain
 * (e.g. code.org).  Useful for getting the domain on which we will set a cookie.
 * @param {string} hostname - A host name
 * @returns {string} The root domain name for the host name
 */
export function getRootDomainFromHostname(hostname) {
  return hostname.split('.').slice(-2).join('.');
}
