// TODO - brent - IIFE me

// (brent) only used by dashboard/app/views/levels/_reference_area.html.haml
// Probably a smarter way to do this
var addClickTouchEvent = function(element, handler) {
  var wrapper = function(e) {
    handler(e);
    e.preventDefault();
  };
  element.on({
    'touchstart': wrapper,
    'click': wrapper
  });
};

/**
 * Wrap a function so that it will only be executed a certain amount of time
 * after it's originally called, to avoid multiple calls in quick succession.
 * Subsequent calls to the returned function will reset its timer.
 * Note: Would reuse lodash's debounce method here, but we don't appear to
 * have access to it here.
 * @param {function} callback - to be called after the given delay
 * @param {number} delay - How long to wait after the _last_ call before executing the callback
 * @returns {function}
 */
// (brent) - used by header.js and dialog.js
var debounce = function (callback, delay) {
  return (function () {
    // Scope the key to this particular call to debounce, but outside
    // the call of the returned function.
    var timerKey;
    return function () {
      if (timerKey) {
        clearTimeout(timerKey);
      }
      timerKey = setTimeout(function () {
        timerKey = undefined;
        callback();
      }, delay);
    };
  })();
};
