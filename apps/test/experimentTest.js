var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var experiments = require('@cdo/apps/experiments');

var processQueryParams = experiments.__TestInterface__.processQueryParams;
var loadFromLocalStorage = experiments.__TestInterface__.loadFromLocalStorage;

describe('experiments', function () {
  before(function () {
    // call loadFromLocalStorage once so that loadedLocalStorage will be true
    // for every subsequent test
    loadFromLocalStorage();
  });

  beforeEach(function () {
    experiments.__TestInterface__.reset();
    localStorage.removeItem('experiments-topInstructions');
    localStorage.removeItem('experiments-runModeIndicators');
  });

  it('can toggle an existing experiment', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);

    processQueryParams('?topInstructions=true');
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), 'true');

    processQueryParams('?topInstructions=false');
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);
  });

  it('can toggle multiple experiments', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), null);
    assert.strictEqual(experiments.isEnabled('runModeIndicators'), false);
    assert.strictEqual(localStorage.getItem('experiments-runModeIndicators'), null);

    processQueryParams('?topInstructions=true&runModeIndicators=true');
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
    assert.strictEqual(localStorage.getItem('experiments-topInstructions'), 'true');
    assert.strictEqual(experiments.isEnabled('runModeIndicators'), true);
    assert.strictEqual(localStorage.getItem('experiments-runModeIndicators'), 'true');
  });

  it('ignores unknown experiments', function () {
    processQueryParams('?notatest=true');
    assert.strictEqual(experiments.isEnabled('notatest'), false);
    assert.strictEqual(localStorage.getItem('experiments-notatest'), null);
  });

  it('can load from localStorage', function () {
    assert.strictEqual(experiments.isEnabled('topInstructions'), false);

    localStorage.setItem('experiments-topInstructions', true);
    loadFromLocalStorage();
    assert.strictEqual(experiments.isEnabled('topInstructions'), true);
  });
});
