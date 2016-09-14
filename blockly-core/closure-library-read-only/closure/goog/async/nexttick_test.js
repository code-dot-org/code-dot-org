// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
goog.provide('goog.async.nextTickTest');
goog.setTestOnly('goog.async.nextTickTest');

goog.require('goog.async.nextTick');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall(
    'asyncNextTickTest');

var clock;

function setUp() {
  clock = null;
}

function tearDown() {
  if (clock) {
    clock.uninstall();
  }
  goog.async.nextTick.setImmediate_ = undefined;
}


function testNextTick() {
  var c = 0;
  var max = 100;
  var async = true;
  var counterStep = function(i) {
    async = false;
    assertEquals('Order correct', i, c);
    c++;
    if (c === max) {
      asyncTestCase.continueTesting();
    }
  };
  for (var i = 0; i < max; i++) {
    goog.async.nextTick(goog.partial(counterStep, i));
  }
  assertTrue(async);
  asyncTestCase.waitForAsync('Wait for callback');
}


function testNextTickContext() {
  var context = {};
  var c = 0;
  var max = 10;
  var async = true;
  var counterStep = function(i) {
    async = false;
    assertEquals('Order correct', i, c);
    assertEquals(context, this);
    c++;
    if (c === max) {
      asyncTestCase.continueTesting();
    }
  };
  for (var i = 0; i < max; i++) {
    goog.async.nextTick(goog.partial(counterStep, i), context);
  }
  assertTrue(async);
  asyncTestCase.waitForAsync('Wait for callback');
}


function testNextTickMockClock() {
  clock = new goog.testing.MockClock(true);
  var result = '';
  goog.async.nextTick(function() {
    result += 'a';
  });
  goog.async.nextTick(function() {
    result += 'b';
  });
  goog.async.nextTick(function() {
    result += 'c';
  });
  assertEquals('', result);
  clock.tick(0);
  assertEquals('abc', result);
}


function testNextTickProtectEntryPoint() {
  var errorHandlerCallbackCalled = false;
  var errorHandler = new goog.debug.ErrorHandler(function() {
    errorHandlerCallbackCalled = true;
  });

  // This is only testing wrapping the callback with the protected entry point,
  // so it's okay to replace this function with a fake.
  goog.async.nextTick.setImmediate_ = function(cb) {
    try {
      cb();
      fail('The callback should have thrown an error.');
    } catch (e) {
      assertTrue(
          e instanceof goog.debug.ErrorHandler.ProtectedFunctionError);
    }
    asyncTestCase.continueTesting();
  };
  var origSetImmediate;
  if (window.setImmediate) {
    origSetImmediate = window.setImmediate;
    window.setImmediate = goog.async.nextTick.setImmediate_;
  }
  goog.debug.entryPointRegistry.monitorAll(errorHandler);

  function thrower() {
    throw Error('This should be caught by the protected function.');
  }
  asyncTestCase.waitForAsync('Wait for callback');
  goog.async.nextTick(thrower);
  window.setImmediate = origSetImmediate;
}
