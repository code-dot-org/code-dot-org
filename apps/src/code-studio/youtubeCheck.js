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
