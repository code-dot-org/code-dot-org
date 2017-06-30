// We support IE 11+
function isUnsupportedIE() {
  var isIE = navigator.userAgent.indexOf('MSIE') !== -1;
  var IEVersion = navigator.appVersion.indexOf('Trident/');
  var IEBelow8 = isIE && IEVersion < 8;

  var IE8 = navigator.userAgent.match('MSIE 8.0;');
  var IE9 = navigator.userAgent.match('MSIE 9.0;');
  var IE10 = navigator.userAgent.match('MSIE 10.0;');

  return IEBelow8 || IE8 || IE9 || IE10;
}

// We support Chrome 33.x +
function isUnsupportedChrome() {
  var isChrome = navigator.userAgent.lastIndexOf('Chrome/') !== -1;
  var chromeVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Chrome/') + 7, 2);
  return isChrome && chromeVersion < 33;
}

// We support Safari 7.0.x +
function isUnsupportedSafari() {
  var isSafari = navigator.userAgent.indexOf('Safari/') !== -1;
  var safariVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Version/') + 8, 2);
  return isSafari && safariVersion < 7;
}

// We support Firefox 25.x +
function isUnsupportedFirefox() {
  var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  var firefoxVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Firefox/') + 8, 2);
  return isFirefox && firefoxVersion < 25;
}

// https://support.code.org/hc/en-us/articles/202591743
// for the full list of supported browsers
function isUnsupportedBrowser() {
  return isUnsupportedIE() || isUnsupportedChrome() || isUnsupportedSafari() || isUnsupportedFirefox();
}

// Prevent filtered errors from being passed to New Relic.
if (window.newrelic) {
  window.newrelic.setErrorHandler(function (err) {
    // Filter errors from unsupported browsers.
    return !!isUnsupportedBrowser();
  });
}
