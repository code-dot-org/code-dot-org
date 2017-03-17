/** @file Wrap timer functions for easy cleanup of all timers. */
const timeoutList = [];

/**
 * call setTimeout and track the returned id
 * @param {function} fn
 * @param {number} delay in milliseconds
 * @return {number} timeout key
 */
export function setTimeout(fn, delay) {
  const key = window.setTimeout.apply(window, arguments);
  timeoutList.push(key);
  return key;
}

/**
 * Clears all timeouts in our timeoutList and resets the timeoutList
 */
export function clearTimeouts() {
  timeoutList.forEach(window.clearTimeout, window);
  timeoutList.length = 0;
}

/**
 * Clears a timeout and removes the item from the timeoutList
 * @param {number} key
 */
export function clearTimeout(key) {
  window.clearTimeout(key);
  // List removal requires IE9+
  const index = timeoutList.indexOf(key);
  if (index > -1) {
    timeoutList.splice(index, 1);
  }
}

const intervalList = [];

/**
 * call setInterval and track the returned id
 * @param {function} fn
 * @param {number} intervalTime in milliseconds
 * @return {number} interval key
 */
export function setInterval(fn, intervalTime) {
  const key = window.setInterval.apply(window, arguments);
  intervalList.push(key);
  return key;
}

/**
 * Clears all interval timeouts in our intervalList and resets the intervalList
 */
export function clearIntervals() {
  intervalList.forEach(window.clearInterval, window);
  intervalList.length = 0;
}

/**
 * Clears a timeout and removes the item from the intervalList
 * @param {number} key
 */
export function clearInterval(key) {
  window.clearInterval(key);
  // List removal requires IE9+
  const timedLoopIndex = timedLoopList.indexOf(key);
  if (timedLoopIndex > -1) {
    timedLoopList.splice(timedLoopIndex, 1);
  }
  const intervalIndex = intervalList.indexOf(key);
  if (intervalIndex > -1) {
    intervalList.splice(intervalIndex, 1);
  }
}

// Strictly a subset of intervalList
const timedLoopList = [];

/**
 * Wrapper around setInterval that doesn't require tracking an interval key
 * because it provides a global stop function.
 * @param {number} interval in milliseconds
 * @param {function} fn
 * @return {number} interval key
 */
export function timedLoop(interval, fn) {
  const key = setInterval(fn, interval);
  timedLoopList.push(key);
  return key;
}

/**
 * Stop intervals started with timedLoop.  If a key is provided, stop that
 * particular interval.  Otherwise stop _all_ intervals that were started
 * with timedLoop.
 * @param {number} [key]
 */
export function stopTimedLoop(key) {
  if (key === undefined) {
    timedLoopList.slice().forEach(k => exports.clearInterval(k));
  } else {
    clearInterval(key);
  }
}
