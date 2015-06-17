// Tests whether the browser can access an image URL.
// Useful as a workaround for CORS security to test access to an origin.
function testImageAccess(url, successCallback, failureCallback, timeoutMs) {
  var img = document.createElement('img');
  img.width = 1;
  img.height = 1;
  img.style.position = 'absolute';
  img.style.bottom = 0;
  img.style.width = 1;
  img.style.height = 1;
  img.style.visibility = 'hidden';
  var called = false;
  function finish(callback) {
    return function() {
      if (called) {
        return;
      }
      called = true;
      document.body.removeChild(img);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      callback();
    }
  }
  var interval = window.setInterval(function() {
    if(img.complete) {
      finish(successCallback)();
    }
  }, 250);
  var timeout = window.setTimeout(finish(failureCallback), timeoutMs);
  img.addEventListener('error', finish(failureCallback));
  img.addEventListener('load', finish(successCallback));
  img.src = url;
  document.body.appendChild(img);
}
window.testImageAccess = testImageAccess;
