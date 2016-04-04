/* global Promise */
var _ = require('lodash');
require("babelify/polyfill"); // required for Promises in IE / Phantom

/**
 * tickWrapper allows us to insert functions that get run at the beginning of
 * our onTick. In most cases we only want to take these actions when certain
 * conditions are met (i.e. complete puzzle if tickCount is 3)
 * The first time we insert a function, we'll wrap onTick.
 * Subsequent insertions will just modify our list of inserted methods, such that
 * we shouldn't need to wrap more than once.
 */
var originalApp;
var originalOnTick;
var preTickFunctions = [];

/**
 * Insert a preTick method into our list. If app hasn't had onTick wrapped yet,
 * do that now.
 */
function insert(app, fn) {
  if (!originalOnTick) {
    wrapOnTick(app);
  }

  preTickFunctions.push(fn);
}

module.exports.reset = function reset() {
  if (originalOnTick) {
    originalApp.onTick = originalOnTick;
    originalOnTick = undefined;
    originalApp = undefined;
  }
  preTickFunctions = [];
};

/**
 * Insert a preTick method that calls fn on the given tick
 * @param {Object} app - App object (Studio/Applab/etc)
 * @param {number} tick - Tick on which to run
 * @param {function} fn - Function to call on given tick
 */
module.exports.runOnAppTick = function runOnAppTick(app, tick, fn) {
  insert(app, takeActionConditionally(fn, function () {
    return app.tickCount === tick;
  }));
};

/**
 * Insert a preTick method that resolves a promise when predicate is first
 * true
 * @param {Object} app - App object (Studio/Applab/etc)
 * @param {function} predicate - The condition that has to be met for the promise
 *   to resolve
 * @returns the promise
 */
module.exports.tickAppUntil = function tickAppUntil(app, predicate) {
  return new Promise(function (resolve) {
    // Create an action that will resolve our promise the first time it's hit
    var tookAction = false;
    var action = function () {
      if (tookAction) {
        return;
      }
      tookAction = true;
      resolve();
    };

    insert(app, takeActionConditionally(action, predicate));
  });
};

/**
 * Wrap app's onTick method to execute all the preTick functions before executing
 * onTick.
 */
function wrapOnTick(app) {
  if (originalOnTick) {
    throw new Error('App has already been wrapped');
  }
  if (!app.onTick) {
    throw new Error('App has no onTick');
  }

  originalApp = app;
  originalOnTick = app.onTick;

  app.onTick = _.wrap(app.onTick, function () {
    preTickFunctions.forEach(function (beforeTick) {
      beforeTick();
    });

    originalOnTick.call(originalApp);
  });
}

/**
 * @param {function} action - Action to take if condition is met
 * @param {function} condition - Condition to check
 * @returns {function} - A function that executes action if condition resolves
 *   to true
 */
function takeActionConditionally(action, condition) {
  return function () {
    if(condition()) {
      action();
    }
  };
}
