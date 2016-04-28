var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');

var isRunning = require('@cdo/apps/redux/isRunning');

describe('isRunning reducer', function () {
  var reducer = isRunning.default;

  it('starts out false', function () {
    var state = reducer(null, {});
    assert.strictEqual(state, false);
  });

  it('can be set to true when false', function () {
    var state = reducer(false, isRunning.setIsRunning(true));
    assert.strictEqual(state, true);
  });

  it('can be set to false when true', function () {
    var state = reducer(true, isRunning.setIsRunning(false));
    assert.strictEqual(state, false);
  });

  it('can be set to true when already true', function () {
    var state = reducer(true, isRunning.setIsRunning(true));
    assert.strictEqual(state, true);
  });
});
