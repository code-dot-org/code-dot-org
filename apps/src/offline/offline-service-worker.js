import 'whatwg-fetch';

/**
 * The Service Worker which enables the offline PWA experience for Code.org. It is responsible for
 * caching html, javascript, images, etc so that they can be used when students don't have an
 * internet connection.
 */

// cacheVersion should be updated anytime we want users to start over with a new cache.
const cacheVersion = 2;
const cacheName = `code-org-pwa-express-2021-lessons-1-v${cacheVersion}`;

/**
 * Runs when the service worker is updated or registered for the first time.
 */
self.addEventListener('install', e => {
  console.log('[Service Worker] installing offline service worker!');
  // TODO - Add retry logic if cache.addAll fails for one of the assets.
  // TODO - Add ability to clear the cache and/or reinstall.
  e.waitUntil(caches.open(cacheName).then(cache => cacheFiles(cache)));
});

/**
 * Intercepts HTTP requests and returns the cached response if it is available. Otherwise it
 * requests over the internet.
 */
self.addEventListener('fetch', event => {
  //Strip the query string parameters
  const url = event.request.url.split('?')[0];
  event.respondWith(
    caches.open(cacheName).then(cache =>
      cache.match(url).then(
        response =>
          // Return the cached response, otherwise fetch it over the internet.
          response || fetch(event.request)
      )
    )
  );
});

/**
 * Queries the list of files needed for levels to work offline and then caches them.
 * @param cache Where the files should be stored.
 * @returns {Promise<unknown[]>}
 */
async function cacheFiles(cache) {
  return getOfflineFilesList().then(filepaths =>
    Promise.all(
      filepaths.map(async filepath => cacheFilesHelper(cache, filepath, 1, 3))
    )
  );
}

/**
 * This function attempts to cache files to be available offline.
 * In the event of a cache failure, it recursively retries caching
 * for a specified number of times
 *
 * @param cache - the cache to which we add files
 * @param filepath - the file to be added to the cache
 * @param attempt - # of retries attempted so far
 * @param retries - total number of retries to attempt
 * @returns {*}
 */
function cacheFilesHelper(cache, filepath, attempt, retries) {
  if (attempt > retries) {
    throw `Failed to cache ${filepath} after ${retries} retries`;
  }
  return cache.add(filepath).catch(err => {
    console.log(
      `Failed to cache ${filepath}, attempt ${attempt}/${retries}`,
      err
    );
    cacheFilesHelper(cache, filepath, attempt + 1, retries);
  });
}

/**
 * Gets the list of files which need to be cached so the levels work offline.
 * See offline_controller.rb for the generation of this list.
 * @returns {Promise<*>}
 */
async function getOfflineFilesList() {
  // Request the manifest of all the files which should be cached.
  const response = await fetch('/offline-files.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  // TODO Add check for 404 status
  const responseJson = await response.json();
  return responseJson.files;
}
