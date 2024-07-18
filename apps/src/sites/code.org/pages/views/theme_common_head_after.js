import 'details-element-polyfill';
import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
import testImageAccess from '@cdo/apps/code-studio/url_test';
import {initHamburger} from '@cdo/apps/hamburger/hamburger';
import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {loadVideos} from '@cdo/apps/util/loadVideos';

// Prevent filtered errors from being passed to New Relic.
if (window.newrelic) {
  window.newrelic.setErrorHandler(function (err) {
    // Remove errors from unsupportenewrelicnd IE versions
    return !!isUnsupportedBrowser();
  });
}

$(document).ready(function () {
  if (isUnsupportedBrowser()) {
    $('#warning-banner').show();
  }
});

initHamburger();

$(window).load(function () {
  if (document.getElementsByClassName('insert_video_player').length > 0) {
    const urlParams = window.location.search;
    let forcePlayer = false;
    if (urlParams.indexOf('force_youtube_fallback') !== -1) {
      forcePlayer = 'fallback';
    } else if (urlParams.indexOf('force_youtube_player') !== -1) {
      forcePlayer = 'youtube';
    }
    loadVideos(forcePlayer);
  }

  // This code is for the share_buttons partial.
  $(document).ready(function () {
    testImageAccess(
      'https://facebook.com/favicon.ico' + '?' + Math.random(),
      () => {
        $('.share-button-facebook-link').show();
      }
    );
    testImageAccess(
      'https://twitter.com/favicon.ico' + '?' + Math.random(),
      () => {
        $('.share-button-twitter-link').show();
      }
    );
  });
});
