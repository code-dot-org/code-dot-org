/**
 * @file Entry point for a bundle to embed on pages where we are also letting JotForm embed
 * an inline form using an iframe.  This bundle monitors the JotForm script and attempts
 * to measure reachability of the JotForm domain, load success, load time, and reports metrics
 * back to our system so we have a sense of how often this fails.
 * We also attempt to improve the user experience when the form is unavailable.
 */
import logToCloud from '../../../logToCloud';

function main(context) {
  Promise.all([
    checkJotFormFrameLoaded(context),
    checkJotFormReachability()
  ]).then(([jotFormFrameLoadedMs, jotformReachability]) => {
    const pageAction =
      jotFormFrameLoadedMs === false
        ? logToCloud.PageAction.JotFormLoadFailed
        : logToCloud.PageAction.JotFormFrameLoaded;
    const eventData = {
      route: `GET ${context.location.pathname}`,
      jotFormFrameLoadedMs,
      ...jotformReachability
    };
    logToCloud.addPageAction(pageAction, eventData);
  });
}

/**
 * Report page time when JotForm's embedded form successfully loads, or resolve(false) if it
 * fails to load within five seconds.
 * @param {Window} context
 * @returns {Promise<number|false>} Always resolves, page time (ms) if load succeeded, `false` if not.
 */
function checkJotFormFrameLoaded(context) {
  return new Promise(resolve => {
    context.JotFormFrameLoaded = function() {
      const time = performance.now();
      if (timeoutKey) {
        clearTimeout(timeoutKey);
      }
      console.log(`JotFormFrameLoaded fired at ${time}ms`);
      resolve(time);
    };

    const timeoutKey = setTimeout(function() {
      console.log(`JotForm failed to load in 5s`);
      resolve(false);
    }, 5000);
  });
}

/**
 * Check a whole set of JotForm domains to see if they're reachable from this client.
 * @returns {Promise<object>} Resolves to a results object when all reachability checks are done,
 *   in the form:
 *   {
 *     wwwjotformcomReached: <boolean, whether reachable>,
 *     wwwjotformcomMs: <(number|false), time to load in ms, or false if load failed>,
 *     ...and so on for each domain
 *   }
 */
function checkJotFormReachability() {
  // Small (<2KB) files on domains used by JotForm:
  const jotformUrls = [
    'https://cdn.jotfor.ms/favicon.ico',
    'https://www.jotform.com/favicon.ico',
    'https://api.jotform.com/favicon.ico',
    'https://submit.jotform.us/favicon.ico'
    // Not using these yet, they're likely to fall under the same policy as www.jotform.com
    // events.jotform.com
    // files.jotform.com
    // form.jotform.com
  ];
  const anchor = document.createElement('a'); // For URL manipulation
  return Promise.all(jotformUrls.map(checkReachability)).then(loadTimes =>
    loadTimes.reduce((result, timeMs, i) => {
      anchor.src = jotformUrls[i];
      const origin = anchor.hostname.toLowerCase();
      result[`${origin}Reached`] = false !== timeMs;
      result[`${origin}Ms`] = timeMs;
      return result;
    }, {})
  );
}

/**
 * Check reachability of another domain from this client.
 * @param {string} url - an image URL on another domain.
 * @returns {Promise<number|false>} Always resolves, load time (ms) if reachable, `false` if not.
 */
function checkReachability(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onabort = () => resolve(false);
    img.onerror = () => resolve(false);
    img.onload = () => {
      const duration = performance.now() - startTime;
      console.log(`Loaded ${url} in ${duration}ms`);
      resolve(duration);
    };
    const startTime = performance.now();
    img.src = `${url}?__cacheBust=${Math.random()}`;
  });
}

main(window);
