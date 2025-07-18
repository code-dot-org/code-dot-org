/** Wrap timer functions for easy cleanup of all timers. */
export const timeoutList: number[] = [];

/**
 * call setTimeout and track the returned id
 * @param fn - Callback function
 * @param delay - in milliseconds
 * @returns timeout key
 */
export function setTimeout(fn: () => void, delay: number): number {
  const key = window.setTimeout(fn, delay);
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
 */
export function clearTimeout(key: number) {
  window.clearTimeout(key);
  // List removal requires IE9+
  const index = timeoutList.indexOf(key);
  if (index > -1) {
    timeoutList.splice(index, 1);
  }
}

export const intervalList: number[] = [];

/**
 * call setInterval and track the returned id
 * @param fn - callback function
 * @param intervalTime - in milliseconds
 * @returns interval key
 */
export function setInterval(fn: () => void, intervalTime: number): number {
  const key = window.setInterval(fn, intervalTime);
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

// Strictly a subset of intervalList
export const timedLoopList: number[] = [];

/**
 * Clears a timeout and removes the item from the intervalList
 */
export function clearInterval(key: number) {
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

/**
 * Wrapper around setInterval that doesn't require tracking an interval key
 * because it provides a global stop function.
 */
export function timedLoop(interval: number, fn: () => void): number {
  const key = setInterval(fn, interval);
  timedLoopList.push(key);
  return key;
}

/**
 * Stop intervals started with timedLoop.  If a key is provided, stop that
 * particular interval.  Otherwise stop _all_ intervals that were started
 * with timedLoop.
 */
export function stopTimedLoop(key?: number) {
  if (key === undefined) {
    timedLoopList.slice().forEach(k => clearInterval(k));
  } else {
    clearInterval(key);
  }
}
