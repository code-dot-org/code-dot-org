import $ from 'jquery';
import _ from 'lodash';

/**
 * Attempt to construct an absolute Marketing url (that is,
 * starting with https://code.org or the appropriate
 * equivalent for the current environment) from a given
 * relative url.
 * @param {string} relativeUrl - should start with a
 *   leading slash.
 */
export function marketing(relativeUrl) {
  // if (window.dashboard && window.dashboard.CODE_ORG_URL) {
    // Hook TBD
    return 'https://code.org' + relativeUrl;
  // }
  return relativeUrl;
}

/**
 * Attempt to construct an absolute Studio url (that is,
 * starting with https://studio.code.org or the appropriate
 * equivalent for the current environment) from a given
 * relative url.  If we're already on dashboard we'll
 * just return the relative url.
 * @param {string} relativeUrl - should start with a
 *   leading slash.
 */
export function studio(relativeUrl) {
  // if (window.marketing && window.marketing.STUDIO_URL) {
  //   return window.marketing.STUDIO_URL + relativeUrl;
  // }
  // Hook TBD
  return relativeUrl;
}

/**
 * Fetch the meta description tag from the specified url
 * Memoize so that we only request once per relative url.
 */
export const metaTagDescription = _.memoize(relativeUrl => {
  return fetch(relativeUrl)
    .then(response => Promise.all([response.status, response.text()]))
    .then(([status, text]) => {
      // Catch fetch's 400 errors
      if (status < 200 || status >= 300) {
        return relativeUrl;
      } else {
        const metaTag = $(text)
          .filter("meta[name='description']")
          .attr('content');
        // Return url if there was no description meta tag
        return metaTag || relativeUrl;
      }
    })
    .catch(error => relativeUrl);
});

export const ADD_A_PERSONAL_LOGIN_HELP_URL =
  'https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account';
export const RELEASE_OR_DELETE_RECORDS_EXPLANATION =
  'https://support.code.org/hc/en-us/articles/360015983631';
