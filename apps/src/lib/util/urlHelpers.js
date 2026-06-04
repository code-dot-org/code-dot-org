import $ from 'jquery';
import _ from 'lodash';

import {configure, root_url} from '@cdo/generated-scripts/studioRoutes';

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
 * Construct an absolute Studio URL for a dynamic path.
 *
 * Prefer named route helpers from `@cdo/generated-scripts/studioRoutes`
 * when a named Rails route exists. Use `studio()` only for legacy or fully
 * dynamic paths that do not map cleanly to a generated helper.
 *
 * @see https://github.com/railsware/js-routes/tree/v2.3.7
 * @see https://guides.rubyonrails.org/v7.0.10/routing.html#listing-existing-routes
 *
 * @param {string} relativeUrl - should start with a
 *   leading slash.
 *
 * @example Find the Rails route helper name by searching for a route prefix or path:
 *
 *   cd dashboard
 *   bundle exec rails routes -g script_lesson_script_level
 *   bundle exec rails routes -g '/s/'
 *
 * Example Rails route output:
 *
 *   Prefix: script_lesson_script_level
 *   URI Pattern: /s/:script_id/lessons/:lesson_position/levels/:id
 *
 * The `js-routes` gem generates JavaScript helpers from Rails route prefixes.
 * For this route, use `script_lesson_script_level_url(...)`.
 *
 * @example Prefer the generated route helper when a named route exists:
 *
 *   import {script_lesson_script_level_url} from '@cdo/generated-scripts/studioRoutes';
 *
 *   const url = script_lesson_script_level_url({
 *     script_id: 'coursea-2025',
 *     lesson_position: 1,
 *     id: 2,
 *   });
 *
 * Generated URL: https://studio.code.org/s/coursea-2025/lessons/1/levels/2
 *
 * @example Use positional arguments only when the route helper expects them:
 *
 *   const url = script_lesson_script_level_url('coursea-2025', 1, 2);
 *
 * Generated URL: https://studio.code.org/s/coursea-2025/lessons/1/levels/2
 */
export function studio(relativeUrl) {
  return root_url().replace(/\/$/, '') + relativeUrl;
}

/**
 * Sets the global URL prefix for code studio
 * (e.g. "https://studio.code.org") allowing the studio()
 * method above to generate absolute URLs.
 * @param {string} origin
 */
export function setStudioOrigin(origin) {
  const originURL = new URL(origin);
  configure({
    default_url_options: {
      host: originURL.hostname,
      port: originURL.port,
      protocol: originURL.protocol.replace(/:$/, ''),
      script_name: originURL.pathname.replace(/\/$/, ''),
    },
  });
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
