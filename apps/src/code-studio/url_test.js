// Tests whether the browser can access an image URL.
// Useful as a workaround for CORS security to test access to an origin.
function testImageAccess(
  url,
  successCallback = () => {},
  failureCallback = () => {},
  timeoutMs = 5000,
  videoElement = false) {

  var element;
  if (videoElement) {
    element = document.createElement('video');
  } else {
    element = new Image();
  }
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
  element.onerror = finish(failureCallback);
  if (videoElement) {
    element.ondurationchange = finish(successCallback);
  } else {
    element.onload = finish(successCallback);
  }
  element.src = url;
  // store a reference to the element so it doesn't get collected
  window.testImages = window.testImages || [];
  window.testImages.push(element);
}
module.exports = testImageAccess;
