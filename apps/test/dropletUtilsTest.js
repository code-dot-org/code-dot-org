var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
var sinon = require('sinon');

var dropletUtils = require('@cdo/apps/dropletUtils');

describe('promptNum', function () {
  afterEach(function () {
    if (window.prompt.restore) {
      window.prompt.restore();
    }
  });

  it('returns a number if I enter a number', function () {
    var prompt = sinon.stub(window, 'prompt');
    prompt.returns('123');

    var val = dropletUtils.promptNum('Enter a value');
    assert.strictEqual(prompt.callCount, 1);
    assert.strictEqual(val, 123);
  });

  it('returns NaN if I enter a non-numerical value', function () {
    var prompt = sinon.stub(window, 'prompt');
    prompt.onCall(0).returns('onetwothree');
    prompt.onCall(1).returns('123');

    var val = dropletUtils.promptNum('Enter a value');
    assert.strictEqual(prompt.callCount, 2);
    assert.strictEqual(val, 123);
  });
});
