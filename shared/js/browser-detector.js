// We support IE 11+
function isUnsupportedIE() {
  var isIE = navigator.userAgent.indexOf('MSIE') !== -1;
  var IEVersion = navigator.appVersion.indexOf('Trident/');
  var IEBelow8 = isIE && IEVersion < 8;

  var IE8 = navigator.userAgent.match('MSIE 8.0;');
  var IE9 = navigator.userAgent.match('MSIE 9.0;');
  var IE10 = navigator.userAgent.match('MSIE 10.0;');

  var unsupported = IEBelow8 || IE8 || IE9 || IE10 ? true : false
  return unsupported;
}

// We support Chrome 33.x +
function isUnsupportedChrome() {
  var isChrome = navigator.userAgent.lastIndexOf('Chrome/') !== -1;
  var chromeVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Chrome/') + 7, 2);
  var unsupported = isChrome && chromeVersion < 33 ? true : false
  return unsupported;
}

// We support Safari 7.0.x +
function isUnsupportedSafari() {
  var isSafari = navigator.userAgent.indexOf('Safari/') !== -1;
  var safariVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Version/') + 8, 1);
  var unsupported =  isSafari && safariVersion < 7 ? true : false
  return unsupported;
}

// We support Firefox 25.x +
function isUnsupportedFirefox() {
  var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  var firefoxVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Firefox/') + 8, 2); 
  var unsupported =  isFirefox && firefoxVersion < 25 ? true : false
  return unsupported;
}

// https://support.code.org/hc/en-us/articles/202591743
// for the full list of supported browsers
function isUnsupportedBrowser () {
  var isUnsupported = false;
  isUnsupported = isUnsupportedIE() || isUnsupportedChrome() || isUnsupportedSafari() || isUnsupportedFirefox()
  return isUnsupported
}
