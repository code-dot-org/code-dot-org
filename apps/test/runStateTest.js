var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');

var runState = require('@cdo/apps/redux/runState');

describe('isRunning reducer', function () {
  var reducer = runState.default;

  it('starts out false', function () {
    var state = reducer(null, {});
    assert.strictEqual(state.isRunning, false);
  });

  it('can be set to true when false', function () {
    var previousState = {
      isRunning: false
    };
    var state = reducer(previousState, runState.setIsRunning(true));
    assert.strictEqual(state.isRunning, true);
  });

  it('can be set to false when true', function () {
    var previousState = {
      isRunning: true
    };
    var state = reducer(previousState, runState.setIsRunning(false));
    assert.strictEqual(state.isRunning, false);
  });

  it('can be set to true when already true', function () {
    var previousState = {
      isRunning: true
    };
    var state = reducer(previousState, runState.setIsRunning(true));
    assert.strictEqual(state.isRunning, true);
  });

  it ('sets isDebugging to false when running is set to false', function () {
    var previousState = {
      isRunning: false,
      isDebugging: true
    };
    var state = reducer(previousState, runState.setIsRunning(false));
    assert.deepEqual(state, {
      isRunning: false,
      isDebugging: false
    });
  });

  it ('doesnt change isDebugging when set to true', function () {
    var previousState = {
      isRunning: true,
      isDebugging: true
    };
    var state = reducer(previousState, runState.setIsRunning(true));
    assert.deepEqual(state, {
      isRunning: true,
      isDebugging: true
    });
  });
});

describe('isDebugging reducer', function () {
  var reducer = runState.default;

  it('starts out false', function () {
    var state = reducer(null, {});
    assert.strictEqual(state.isDebugging, false);
  });

  it('can be set to true when false', function () {
    var previousState = {
      isDebugging: false
    };
    var state = reducer(previousState, runState.setIsDebugging(true));
    assert.strictEqual(state.isDebugging, true);
  });

  it('can be set to false when true', function () {
    var previousState = {
      isDebugging: true
    };
    var state = reducer(previousState, runState.setIsDebugging(false));
    assert.strictEqual(state.isDebugging, false);
  });

  it('can be set to true when already true', function () {
    var previousState = {
      isDebugging: true
    };
    var state = reducer(previousState, runState.setIsDebugging(true));
    assert.strictEqual(state.isDebugging, true);
  });

  it ('sets isRunning to true when debugging', function () {
    var previousState = {
      isRunning: true,
      isDebugging: false
    };
    var state = reducer(previousState, runState.setIsDebugging(true));
    assert.deepEqual(state, {
      isRunning: true,
      isDebugging: true
    });
  });

  it ('doesnt change isRunning when set to false', function () {
    var previousState = {
      isRunning: true,
      isDebugging: false
    };
    var state = reducer(previousState, runState.setIsDebugging(false));
    assert.deepEqual(state, {
      isRunning: true,
      isDebugging: false
    });
  });

});
