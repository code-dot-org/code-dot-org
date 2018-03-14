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
 * Retrieve the meta description tag from the specified url
 * Memoize so that we only request once per relative url.
 */
export function metaTagDescription(relativeUrl) {
  return metaTagMemoized(relativeUrl);
}

/**
* Fetch the html of the given page and parse to get content of
* 'description' meta tag.
*/
const metaTagMemoized = _.memoize((relativeUrl) => {
  return fetch(relativeUrl)
    .then(
      response => {
        // Catch fetch's 400 errors
        if (response.status < 200 || response.status >= 300) {
          return relativeUrl;
        } else {
          return response.text().then(data => {
            const metaTag = $(data).filter("meta[name='description']").attr("content");
            // Return url if there was no description meta tag
            if (metaTag) {
              return metaTag;
            } else {
              return relativeUrl;
            }
          });
        }
      }
    ).catch(error => relativeUrl);
});
