// Tests a URL for response.
// Use a small image element appended to the body to workaround CORS security.
// Uses the imagesloaded library for cross-browser support.
function testURL(url, successCallback, failureCallback, timeoutMs) {
  var img = document.createElement('img');
  img.width = 1;
  img.height = 1;
  img.style['position'] = 'absolute';
  img.style['bottom'] = 0;
  img.style['width'] = 1;
  img.style['height'] = 1;
  img.style['visibility'] = 'hidden';
  var called = false;
  function wrap(callback) {
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
      wrap(successCallback)();
    }
  }, 250);
  var timeout = window.setTimeout(wrap(failureCallback), timeoutMs);
  img.addEventListener('error', wrap(failureCallback));
  img.addEventListener('load', wrap(successCallback));
  img.src = url;
  document.body.appendChild(img);
}
window.testURL = testURL;
