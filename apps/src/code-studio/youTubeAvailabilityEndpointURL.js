/**
 * This function returns the image URL that should be tested to
 * determine whether YouTube is available.
 *
 * It supports two URL parameters that return specific URLs
 * to force specific outcomes:
 *   force_youtube_fallback: YouTube appears to be unreachable.
 *   force_youtube_player: YouTube appears to be reachable.
 *
 * It is used by our legacy video player code at
 * apps/src/code-studio/videos.js, and in our new Lab2 standalone
 * video level player code at apps/src/standaloneVideo/.
 */

export default function youTubeAvailabilityEndpointURL(noCookie) {
  const url = window.document.URL.toString();
  if (url.indexOf('force_youtube_fallback') >= 0) {
    return 'https://unreachable-test-subdomain.example.com/favicon.ico';
  } else if (url.indexOf('force_youtube_player') >= 0) {
    return 'https://code.org/images/favicon.ico';
  }

  if (noCookie) {
    return 'https://www.youtube-nocookie.com/favicon.ico';
  } else {
    return 'https://www.youtube.com/favicon.ico';
  }
}
