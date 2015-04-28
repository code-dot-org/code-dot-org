// This module wraps setTimeout/setInterval calls to provide two additional features:
// 1. Track all timeout/interval IDs, so they can be cleared all at once with clearTimeouts/clearIntervals.
// 2. Stub the default timer implementations in test runs for faster execution.

var timeoutList = [];
var stubTimer = false;
// Polyfill setImmediate in Browserify
window.setImmediate = window.setImmediate || require('timers-browserify').setImmediate;

// Only use stubbed timer functions when explicitly set by stubTimer(true)
function getTimer() {
  return stubTimer ? require('timerstub') : window;
}

exports.getStubTimer = function() {
  return stubTimer;
};

function log(msg) {
  //console.log(msg);
}


exports.stubTimer = function (bool) {
  log('set stubTimer: ' + bool);
  stubTimer = bool;
};

/**
 * call setTimeout and track the returned id
 */
exports.setTimeout = function (fn, time) {
  log('setting timeout, stubTimer = ' + stubTimer);
  var t = getTimer();
  var timeoutId = t.setTimeout.apply(window, [fn, time]);
  timeoutList.push(timeoutId);
  log('set timeout ' + timeoutId);
  exports.advance();
  return timeoutId;
};

/**
 * Clears all timeouts in our timeoutList and resets the timeoutList
 */
exports.clearTimeouts = function () {
  log('clear timeouts');
  var t = getTimer();
  timeoutList.forEach(t.clearTimeout, window);
  timeoutList = [];
  if(stubTimer) {
    t.clearAll();
  }
};

/**
 * Clears a timeout and removes the item from the timeoutList
 */
exports.clearTimeout = function (id) {
  log('clear timeout:' + id);
  var timer = getTimer();
  timer.clearTimeout(id);
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
  var timer = getTimer();
  var intervalId = timer.setInterval.apply(window, [fn, time]);
  log('Setting interval ' + intervalId);
  intervalList.push(intervalId);
  return intervalId;
};

/**
 * Clears all interval timeouts in our intervalList and resets the intervalList
 */
exports.clearIntervals = function () {
  log('clear intervals');
  var timer = getTimer();
  intervalList.forEach(t.clearInterval, window);
  intervalList = [];
  if (stubTimer) {
    t.clearAll();
  }
};

/**
 * Clears a timeout and removes the item from the intervalList
 */
exports.clearInterval = function (id) {
  log('clear interval:' + id);

  var timer = getTimer();
  timer.clearInterval(id);
  // List removal requires IE9+
  var index = intervalList.indexOf(id);
  if (index > -1) {
    intervalList.splice(index, 1);
  }
};

exports.advance = function() {
  log('advance');
  if(stubTimer) {
    var timer = getTimer();
    if(stubTimer) {
      t.wait(50000);
      t.waitAll();
    }
  }
};

exports.waitAll = function(done) {
  log('WaitAll');
  if(stubTimer) {
    getTimer().waitAll(done);
  }
};
