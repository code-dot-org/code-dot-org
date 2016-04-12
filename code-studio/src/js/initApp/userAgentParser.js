// Long term we'd like to share this with app/src/dom.js

module.exports.isMobile = function () {
  var reg = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/;
  return reg.test(window.navigator.userAgent);
};

module.exports.isSafari = function () {
  // Chrome has both Chrome and Safari in UA
  // Taken from http://stackoverflow.com/a/7768006/2506748
  return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
};

module.exports.isChrome34 = function () {
  var reg = /Chrome\/34/;
  return reg.test(window.navigator.userAgent);
};
