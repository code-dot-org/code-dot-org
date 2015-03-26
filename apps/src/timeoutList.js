var timeoutList = [];
var stubTimer = false;
window.setImmediate = require('timers-browserify').setImmediate;

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
  var t = stubTimer ? require('timerstub') : window;
  var timeoutId = t.setTimeout.apply(window, [fn, time]);
  timeoutList.push(timeoutId);
  log('set timeout ' + timeoutId);
  return timeoutId;
};

/**
 * Clears all timeouts in our timeoutList and resets the timeoutList
 */
exports.clearTimeouts = function () {
  log('clear timeouts');
  var t = stubTimer ? require('timerstub') : window;
  timeoutList.forEach(t.clearTimeout, window);
  timeoutList = [];
  if(stubTimer) t.clearAll();
};

/**
 * Clears a timeout and removes the item from the timeoutList
 */
exports.clearTimeout = function (id) {
  log('clear timeout:' + id);
  var t = stubTimer ? require('timerstub') : window;
  t.clearTimeout(id);
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
  var t = stubTimer ? require('timerstub') : window;
  var intervalId = t.setInterval.apply(window, [fn, time]);
  log('Setting interval ' + intervalId);
  intervalList.push(intervalId);
  return intervalId;
};

/**
 * Clears all interval timeouts in our intervalList and resets the intervalList
 */
exports.clearIntervals = function () {
  log('clear intervals');
  var t = stubTimer ? require('timerstub') : window;
  intervalList.forEach(t.clearInterval, window);
  intervalList = [];
  if(stubTimer) t.clearAll();
};

/**
 * Clears a timeout and removes the item from the intervalList
 */
exports.clearInterval = function (id) {
  log('clear interval:' + id);

  var t = stubTimer ? require('timerstub') : window;
  t.clearInterval(id);
  // List removal requires IE9+
  var index = intervalList.indexOf(id);
  if (index > -1) {
    intervalList.splice(index, 1);
  }
};

exports.advance = function() {
  var t = stubTimer ? require('timerstub') : window;
  if(stubTimer) t.wait(50000);
  if(stubTimer) t.waitAll();
};

exports.waitAll = function(done) {
  var t = stubTimer ? require('timerstub') : window;
  if(stubTimer) t.waitAll(done);
};
