var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var experiments = require('@cdo/apps/experiments');

describe('experiments', function () {
  var mockedQueryString = '';

  experiments.getQueryString_ = function () {
    return mockedQueryString;
  };

  beforeEach(function () {
    mockedQueryString = ' ';
    localStorage.removeItem('experiments-topInstructions');
    localStorage.removeItem('experiments-runModeIndicators');
  });

  it('can load from localStorage', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    localStorage.setItem('experiments-topInstructions', true);
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
  });

  it('can toggle an experiment', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);

    mockedQueryString = '?topInstructions=true';
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), 'true');

    mockedQueryString = '?topInstructions=false';
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);
  });

  it('can toggle multiple experiments', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);
    assert.strictEqual(experiments.isEnabled('runModeIndicators'), false);
    assert.strictEqual(localStorage.getItem('experiments-runModeIndicators'), null);

    mockedQueryString = '?topInstructions=true&runModeIndicators=true';
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), 'true');
    assert.strictEqual(experiments.isEnabled('runModeIndicators'), true);
    assert.strictEqual(localStorage.getItem('experiments-runModeIndicators'), 'true');
  });

  it('only looks at the first instance of a repeated key', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);

    mockedQueryString = '?topInstructions=true&topInstructions=false';
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), 'true');
  });

});
