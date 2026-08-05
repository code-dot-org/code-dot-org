import {ABSOLUTE_REGEXP, fixPath} from '@cdo/apps/assetManagement/assetPrefix';

const HTTP_PREFIX_REGEX = /^http:\/\//i;

export function normalizeToHttps(url) {
  return url.replace(HTTP_PREFIX_REGEX, 'https://');
}

/**
 * Resolve an image path to a fully qualified URL.
 * @param {string} url
 * @returns {string}
 */
export function resolveAppLabImagePath(url) {
  if (!ABSOLUTE_REGEXP.test(url)) {
    return fixPath(url);
  }
  return normalizeToHttps(url);
}
