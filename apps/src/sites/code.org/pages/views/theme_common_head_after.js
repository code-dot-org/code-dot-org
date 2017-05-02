import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {initHamburger} from '@cdo/apps/hamburger/hamburger.js';

// Prevent filtered errors from being passed to New Relic.
 if (window.newrelic) {
   window.newrelic.setErrorHandler(function (err) {
     // Remove errors from unsupportenewrelicnd IE versions
     return !!isUnsupportedBrowser();
   });
 }

window.isUnsupportedBrowser = isUnsupportedBrowser;
initHamburger();
