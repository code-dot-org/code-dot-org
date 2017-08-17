/**
 * Attempt to construct an absolute Pegasus url (that is,
 * starting with https://code.org or the appropriate
 * equivalent for the current environment) from a given
 * relative url.  If we're already on pegasus we'll
 * just return the relative url.
 * @param {string} relativeUrl - should start with a
 *   leading slash.
 */
export function pegasus(relativeUrl) {
  if (window.dashboard && window.dashboard.CODE_ORG_URL) {
    return window.dashboard.CODE_ORG_URL + relativeUrl;
  }
  return relativeUrl;
}
