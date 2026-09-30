// Apps' assetPrefix.fixPath, for the absolute URLs this lab fetches.

const MEDIA_PROXY_PATH = '/media?u=';

// These hosts answer with `access-control-allow-origin: *`.
const CORS_OPEN_HOSTS = [
  /^https:\/\/curriculum\.code\.org\//i,
  /^https:\/\/images\.code\.org\//i,
];

/**
 * `url`, routed through the dashboard's media proxy when it is absolute and
 * on a host that does not allow cross-origin reads. Relative URLs, and any
 * URL on a page opened from a file, are returned as they are.
 */
export function mediaUrl(url: string): string {
  if (
    !/^https?:\/\//i.test(url) ||
    window.location.protocol === 'file:' ||
    CORS_OPEN_HOSTS.some(host => host.test(url))
  ) {
    return url;
  }
  // A space is encoded twice, so the proxy still sees a valid URL after
  // decoding once.
  return (
    '//' +
    window.location.host +
    MEDIA_PROXY_PATH +
    encodeURIComponent(url.replace(/ /g, '%20'))
  );
}
