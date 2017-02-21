var timeoutList = [];

/**
 * call setTimeout and track the returned id
 */
exports.setTimeout = function (fn, time) {
  var timeout = window.setTimeout.apply(window, arguments);
  timeoutList.push(timeout);
  return timeout;
};

/**
 * Clears all timeouts in our timeoutList and resets the timeoutList
 */
exports.clearTimeouts = function () {
  timeoutList.forEach(window.clearTimeout, window);
  timeoutList = [];
};

/**
 * Clears a timeout and removes the item from the timeoutList
 */
exports.clearTimeout = function (id) {
  window.clearTimeout(id);
  // List removal requires IE9+
  var index = timeoutList.indexOf(id);
  if (index > -1) {
    timeoutList.splice(index, 1);
  }
};

var intervalList = [];

/**
 * call setInterval and track the returned id
 */
exports.setInterval = function (fn, time) {
  var interval = window.setInterval.apply(window, arguments);
  intervalList.push(interval);
  return interval;
};

/**
 * Clears all interval timeouts in our intervalList and resets the intervalList
 */
exports.clearIntervals = function () {
  intervalList.forEach(window.clearInterval, window);
  intervalList = [];
};

/**
 * Clears a timeout and removes the item from the intervalList
 */
exports.clearInterval = function (id) {
  window.clearInterval(id);
  // List removal requires IE9+
  const timedLoopIndex = timedLoopList.indexOf(id);
  if (timedLoopIndex > -1) {
    timedLoopList.splice(timedLoopIndex, 1);
  }
  var index = intervalList.indexOf(id);
  if (index > -1) {
    intervalList.splice(index, 1);
  }
};

// Strictly a subset of intervalList
const timedLoopList = [];

/**
 * Wrapper around setInterval that doesn't require tracking an interval key
 * because it provides a global stop function.
 * @param {number} interval in milliseconds
 * @param {function} fn
 * @return {number} interval key
 */
exports.timedLoop = function (interval, fn) {
  const key = exports.setInterval(fn, interval);
  timedLoopList.push(key);
  return key;
};

/**
 * Stop intervals started with timedLoop.  If a key is provided, stop that
 * particular interval.  Otherwise stop _all_ intervals that were started
 * with timedLoop.
 * @param {number} [key]
 */
exports.stopTimedLoop = function (key) {
  if (key === undefined) {
    timedLoopList.slice().forEach(k => exports.clearInterval(k));
  } else {
    exports.clearInterval(key);
  }
};
