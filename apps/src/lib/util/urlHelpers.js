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
 * Sets the global URL prefix for pegasus
 * (e.g. "https://code.org") allowing the pegasus()
 * method above to generate absolute URLs.
 * @param {string} origin
 */
export function setPegasusOrigin(origin) {
  window.dashboard = window.dashboard || {};
  window.dashboard.CODE_ORG_URL = origin;
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
  if (window.pegasus && window.pegasus.STUDIO_URL) {
    return window.pegasus.STUDIO_URL + relativeUrl;
  }
  return relativeUrl;
}

/**
 * Sets the global URL prefix for code studio
 * (e.g. "https://studio.code.org") allowing the studio()
 * method above to generate absolute URLs.
 * @param {string} origin
 */
export function setStudioOrigin(origin) {
  window.pegasus = window.pegasus || {};
  window.pegasus.STUDIO_URL = origin;
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
