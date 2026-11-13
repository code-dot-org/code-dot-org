// The last page load this page started. The navigate event fires for one a
// same-origin document starts, never for one another site's iframe starts,
// so MainActivity.kt opens the congratulations only for a certificate page
// recorded here, or reached from one by a redirect. Each page starts with
// no record.
var STARTED_NAVIGATION_KEY = 'codeai_started_navigation';
try {
  window.sessionStorage.removeItem(STARTED_NAVIGATION_KEY);
  if (window.navigation) {
    window.navigation.addEventListener('navigate', function (event) {
      if (!event.destination.sameDocument) {
        originalSetItem.call(
          window.sessionStorage,
          STARTED_NAVIGATION_KEY,
          event.destination.url,
        );
      }
    });
  }
} catch (e) {
  // Storage unavailable: the page cannot finish a curriculum in the app.
}
