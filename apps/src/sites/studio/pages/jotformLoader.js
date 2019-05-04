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
    // Domains used by Jotform:
    // cdn.jotfor.ms       https://cdn.jotfor.ms/images/calendar.png  817B
    checkReachability('https://cdn.jotfor.ms/images/calendar.png'),
    // www.jotform.com     https://www.jotform.com/favicon.ico        887B
    checkReachability('https://www.jotform.com/favicon.ico')
    // Not using these yet, they're likely to fall under the same policy as www.jotform.com
    // events.jotform.com
    // files.jotform.com
    // form.jotform.com
  ]).then(([jotFormFrameLoadedMs, cdnjotformsMs, wwwjotformcomMs]) => {
    if (jotFormFrameLoadedMs === false) {
      // Load failed if we specifically got 'false'
      logToCloud.addPageAction(logToCloud.PageAction.JotFormLoadFailed, {
        route: `GET ${context.location.pathname}`,
        reachedCdnjotforms: false !== cdnjotformsMs,
        reachedWwwjotformcom: false !== wwwjotformcomMs,
        cdnjotformsMs,
        wwwjotformcomMs
      });
    } else {
      logToCloud.addPageAction(logToCloud.PageAction.JotFormFrameLoaded, {
        route: `GET ${context.location.pathname}`,
        jotFormFrameLoadedMs,
        cdnjotformsMs,
        wwwjotformcomMs
      });
    }
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
