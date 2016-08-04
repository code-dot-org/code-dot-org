/** @file Test of consoleShim.js which makes console functions safer to use
 *  on older browsers by filling in no-op functions. */
'use strict';

var assert = require('assert');
var consoleShim = require('@cdo/apps/code-studio/consoleShim');

describe('consoleShim', function () {
  it ('creates console object with standard functions if console is missing', function () {
    var fakeWindow = {};
    consoleShim(fakeWindow);
    var console = fakeWindow.console;
    assert(typeof console === 'object', "console exists");
    assert(typeof console.assert === 'function', "assert() exists");
    assert(typeof console.clear === 'function', "clear() exists");
    assert(typeof console.count === 'function', "count() exists");
    assert(typeof console.debug === 'function', "debug() exists");
    assert(typeof console.dir === 'function', "dir() exists");
    assert(typeof console.dirxml === 'function', "dirxml() exists");
    assert(typeof console.error === 'function', "error() exists");
    assert(typeof console.exception === 'function', "exception() exists");
    assert(typeof console.group === 'function', "group() exists");
    assert(typeof console.groupCollapsed === 'function', "groupCollapsed() exists");
    assert(typeof console.groupEnd === 'function', "groupEnd() exists");
    assert(typeof console.info === 'function', "info() exists");
    assert(typeof console.log === 'function', "log() exists");
    assert(typeof console.markTimeline === 'function', "markTimeline() exists");
    assert(typeof console.profile === 'function', "profile() exists");
    assert(typeof console.profileEnd === 'function', "profileEnd() exists");
    assert(typeof console.table === 'function', "table() exists");
    assert(typeof console.time === 'function', "time() exists");
    assert(typeof console.timeEnd === 'function', "timeEnd() exists");
    assert(typeof console.timeStamp === 'function', "timeStamp() exists");
    assert(typeof console.trace === 'function', "trace() exists");
    assert(typeof console.warn === 'function', "warn() exists");

    // Invoke no-op log function, for coverage purposes :)
    console.log("Arguments don't matter");
  });

  it ('does not replace functions on existing console', function () {
    var originalLogFunction = function () {};
    var someNonstandardFunction = function () {};
    var fakeWindow = {
      console: {
        log: originalLogFunction,
        snf: someNonstandardFunction
      }
    };
    consoleShim(fakeWindow);
    var console = fakeWindow.console;
    assert(console.log === originalLogFunction, "log function hasn't changed");
    assert(console.snf === someNonstandardFunction, "nonstandard function left in place");
    assert(typeof console.error === 'function', "error function is still stubbed");
  });
});
