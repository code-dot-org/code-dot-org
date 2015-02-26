var list = [];

/**
 * call setTimeout and track the returned id
 */
exports.setTimeout = function (fn, time) {
  list.push(window.setTimeout.apply(window, arguments));
};

/**
 * Clears all timeouts in our list and resets the list
 */
exports.clearTimeouts = function () {
  list.forEach(window.clearTimeout, window);
  list = [];
};

/**
 * Clears a timeout and removes the item from the list
 */
exports.clearTimeout = function (id) {
  window.clearTimeout(id);
  // List removal requires IE9+
  var index = list.indexOf(id);
  if (index > -1) {
    list.splice(index, 1);
  }
};

var intervalList = [];

/**
 * call setInterval and track the returned id
 */
exports.setInterval = function (fn, time) {
  intervalList.push(window.setInterval.apply(window, arguments));
};

/**
 * Clears all interval timeouts in our list and resets the list
 */
exports.clearIntervals = function () {
  intervalList.forEach(window.clearInterval, window);
  intervalList = [];
};

/**
 * Clears a timeout and removes the item from the list
 */
exports.clearInterval = function (id) {
  window.clearInterval(id);
  // List removal requires IE9+
  var index = intervalList.indexOf(id);
  if (index > -1) {
    intervalList.splice(index, 1);
  }
};

