'use strict';

// Tests whether the browser can access an image URL.
// Useful as a workaround for CORS security to test access to an origin.
function testImageAccess(url, successCallback, failureCallback, timeoutMs) {
  timeoutMs = typeof timeoutMs !== 'undefined' ?  timeoutMs : 5000;
  var img = new Image();
  var called = false;
  function finish(callback) {
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.clearTimeout(timeout);
      callback();
    };
  }
  var timeout = window.setTimeout(finish(failureCallback), timeoutMs);
  img.onerror = finish(failureCallback);
  img.onload = finish(successCallback);
  img.src = url;
  // store a reference to the Image so it doesn't get collected
  window.testImages = window.testImages || [];
  window.testImages.push(img);
}
module.exports = testImageAccess;
