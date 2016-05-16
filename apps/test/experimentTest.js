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
    localStorage.removeItem('experimentsList');
  });

  it('can load experiment state from localStorage "experimentsList" key', function () {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    localStorage.setItem('experimentsList', JSON.stringify(['awesome-feature']));
    assert.isTrue(experiments.isEnabled('awesome-feature'));
  });

  it('can persist experiment state to local storage "experimentList" key', function () {
    assert.isNull(localStorage.getItem('experimentsList'));
    experiments.setEnabled('awesome-feature', true);
    assert.sameMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      ['awesome-feature']
    );
    experiments.setEnabled('better-feature', true);
    assert.sameMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      ['better-feature', 'awesome-feature']
    );

    experiments.setEnabled('awesome-feature', false);
    assert.sameMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      ['better-feature']
    );
  });

  it('can return a list of all enabled experiments', function () {
    assert.isArray(experiments.getEnabledExperiments());
    assert.lengthOf(experiments.getEnabledExperiments(), 0);
    experiments.setEnabled('awesome-feature', true);
    experiments.setEnabled('better-feature', true);
    assert.sameMembers(
      experiments.getEnabledExperiments(),
      ['awesome-feature', 'better-feature']
    );
  });

  it('can enable experiments with the enableExperiments query parameter', function () {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?enableExperiments=awesome-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
  });

  it('can enable multiple experiments with the enableExperiments query parameter', function () {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?enableExperiments=awesome-feature,better-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.isTrue(experiments.isEnabled('better-feature'));
  });

  it('can disable an experiment with the disableExperiments query parameter', function () {
    experiments.setEnabled('awesome-feature', true);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?disableExperiments=awesome-feature';
    assert.isFalse(experiments.isEnabled('awesome-feature'));
  });

  it('can disable multiple experiments with the disableExperiments query parameter', function () {
    experiments.setEnabled('awesome-feature', true);
    experiments.setEnabled('better-feature', true);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.isTrue(experiments.isEnabled('better-feature'));
    mockedQueryString = '?disableExperiments=awesome-feature,better-feature';
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    assert.isFalse(experiments.isEnabled('better-feature'));
  });

});
