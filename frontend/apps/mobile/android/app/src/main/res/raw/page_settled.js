// LoadingCover.kt keeps the app's loading cover up until this says the page is
// done: loaded, no studio.code.org request open, and unchanged for a moment.
// Many pages fetch their content and render it after the load event.
var SETTLE_MS = 500;
var lastChange = Date.now();
var openRequests = 0;

function requestDone() {
  openRequests = Math.max(0, openRequests - 1);
  lastChange = Date.now();
}

if (window.fetch) {
  var originalFetch = window.fetch;
  window.fetch = function (input) {
    var url = input && typeof input === 'object' && 'url' in input ? input.url : input;
    var promise = originalFetch.apply(this, arguments);
    if (sameOrigin(url)) {
      openRequests++;
      promise.then(requestDone, requestDone);
    }
    return promise;
  };
}

var originalOpen = XMLHttpRequest.prototype.open;
var originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function (method, url) {
  this.__codeaiCounted = sameOrigin(url);
  return originalOpen.apply(this, arguments);
};
XMLHttpRequest.prototype.send = function () {
  if (this.__codeaiCounted) {
    openRequests++;
    this.addEventListener('loadend', requestDone);
  }
  return originalSend.apply(this, arguments);
};

window.__codeaiSettled = function () {
  return (
    document.readyState === 'complete' &&
    openRequests === 0 &&
    Date.now() - lastChange >= SETTLE_MS
  );
};

onPageChange(function () {
  lastChange = Date.now();
});
