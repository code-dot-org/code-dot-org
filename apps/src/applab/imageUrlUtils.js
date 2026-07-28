import {ABSOLUTE_REGEXP, fixPath} from '@cdo/apps/assetManagement/assetPrefix';

const HTTP_PREFIX_REGEX = /^http:\/\//i;

/**
 * The media proxy only reaches allowlisted hostnames so absolute URLs load
 * directly. Our img-src policy omits http: so replace it with https:
 * @param {string} url
 * @returns {string}
 */
export function resolveAppLabImagePath(url) {
  if (!ABSOLUTE_REGEXP.test(url)) {
    return fixPath(url);
  }
  return url.replace(HTTP_PREFIX_REGEX, 'https://');
}
