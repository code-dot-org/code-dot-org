// We support IE 11+
function isUnsupportedIE() {
  var isIE = navigator.userAgent.indexOf('MSIE') !== -1;
  var IEVersion = /MSIE (\d*)./g.exec(navigator.userAgent)[1];
  var unsupported = isIE && IEVersion < 11;
  return unsupported;
}

// We support Chrome 33.x +
function isUnsupportedChrome() {
  var isChrome = navigator.userAgent.lastIndexOf('Chrome/') !== -1;
  var chromeVersion = /Chrome\/(\d*)./g.exec(navigator.userAgent)[1];
  var unsupported = isChrome && chromeVersion < 33;
  return unsupported;
}

// We support Safari 7.0.x +
function isUnsupportedSafari() {
  var isSafari = navigator.userAgent.indexOf('Safari/') !== -1;
  var safariVersion = /Version\/(\d*)./g.exec(navigator.userAgent)[1];
  var unsupported =  isSafari && safariVersion < 7;
  return unsupported;
}

// We support Firefox 25.x +
function isUnsupportedFirefox() {
  var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  var firefoxVersion = /Firefox\/(\d*)./g.exec(navigator.userAgent)[1];
  var unsupported =  isFirefox && firefoxVersion < 25;
  return unsupported;
}

// https://support.code.org/hc/en-us/articles/202591743
// for the full list of supported browsers
function isUnsupportedBrowser () {
  var isUnsupported = false;
  isUnsupported = isUnsupportedIE() || isUnsupportedChrome() || isUnsupportedSafari() || isUnsupportedFirefox()
  return isUnsupported
}
