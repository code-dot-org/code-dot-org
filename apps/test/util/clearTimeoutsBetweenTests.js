/**
 * @file
 * We use this helper at the top-level of our test suite, in the entry points. For that reason
 * it's useful to keep it in a separate file and as dependency-free as possible - please don't
 * add other dependencies to this file unless absolutely necessary. Thank you!
 */

/**
 * Track whenever we create a timeout/interval, and then clear all timeouts/intervals
 * upon completion of each test.
 */
export function clearTimeoutsBetweenTests() {
  let timeoutList = [];
  let intervalList = [];
  const leftover = [];

  const setTimeoutNative = window.setTimeout;
  const setIntervalNative = window.setInterval;
  const clearTimeoutNative = window.clearTimeout;
  const clearIntervalNative = window.clearInterval;

  window.setTimeout = (...args) => {
    const result = setTimeoutNative(...args);
    timeoutList.push(result);
    return result;
  };

  window.setInterval = (...args) => {
    const result = setIntervalNative(...args);
    intervalList.push(result);
    return result;
  };

  window.clearTimeout = id => {
    const index = timeoutList.indexOf(id);
    if (index !== -1) {
      timeoutList.splice(index, 1);
    }
    return clearTimeoutNative(id);
  };

  window.clearInterval = id => {
    const index = intervalList.indexOf(id);
    if (index !== -1) {
      intervalList.splice(index, 1);
    }
    return clearIntervalNative(id);
  };

  afterEach(function () {
    // Guard carefully here, because arrow functions can steal our test context
    // and prevent us from grabbing the test name.
    const testName = this && this.currentTest && this.currentTest.fullTitle();

    timeoutList.forEach(id => {
      if (testName) {
        leftover.push('(timeout)  ' + testName);
      } else {
        // When we don't know the test name, also print a note inline to help
        // with debugging.
        leftover.push('(timeout)  Unknown test');
        console.log('clearing leftover timeout');
      }
      clearTimeoutNative(id);
    });
    intervalList.forEach(id => {
      if (testName) {
        leftover.push('(interval) ' + testName);
      } else {
        // When we don't know the test name, also print a note inline to help
        // with debugging.
        leftover.push('(interval) Unknown test');
        console.log('clearing leftover interval');
      }
      clearIntervalNative(id);
    });
    timeoutList = [];
    intervalList = [];
  });

  after(() => {
    console.log('Leftover timeouts/intervals: ' + leftover.length);
    // Uncomment if you want to see the whole list of leftover timeouts
    // console.log(leftover.map(s => '    ' + s).join('\n'));
  });
}
