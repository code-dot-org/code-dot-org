// Images a lab reads by URL: its own project's files, the animation
// library, or another site. Another site's image comes through the
// dashboard's media proxy unless that site allows cross-origin reads, as
// apps' assetPrefix.fixPath arranged.

import type {Transport} from '../../transports/types';

// These hosts answer with `access-control-allow-origin: *`.
const CORS_OPEN_HOSTS = [
  /^https:\/\/curriculum\.code\.org\//i,
  /^https:\/\/images\.code\.org\//i,
];

/** Whether reading `url` from a page must go through the media proxy. */
export function needsMediaProxy(url: string): boolean {
  return (
    /^https?:\/\//i.test(url) && !CORS_OPEN_HOSTS.some(host => host.test(url))
  );
}

export function createMediaApi(transport: Transport) {
  return {
    /**
     * GET an image: a site path as it is, an absolute URL directly or
     * through GET /media?u=<url>.
     */
    async getImage(params: {url: string}): Promise<Blob> {
      const {url} = params;
      if (!needsMediaProxy(url)) {
        return transport.requestBlob({method: 'GET', url});
      }
      // A space is encoded twice, so the proxy still sees a valid URL after
      // decoding once.
      return transport.requestBlob({
        method: 'GET',
        url: '/media',
        query: {u: url.replace(/ /g, '%20')},
      });
    },
  };
}
