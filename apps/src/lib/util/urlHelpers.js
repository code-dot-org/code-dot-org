import $ from 'jquery';
import _ from 'lodash';
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

/**
 * Fetch the meta description tag from the specified url
 * Memoize so that we only request once per relative url.
 */
export const metaTagDescription = _.memoize((relativeUrl) => {
  return fetch(relativeUrl)
    .then(response => Promise.all([response.status, response.text()]))
    .then(([status,text]) => {
      // Catch fetch's 400 errors
      if (status < 200 || status >= 300) {
        return relativeUrl;
      } else {
        const metaTag = $(text).filter("meta[name='description']").attr("content");
        // Return url if there was no description meta tag
        return metaTag || relativeUrl;
      }
    })
    .catch(error => relativeUrl);
});
