import { assert } from '../util/configuredChai';
import { setExternalGlobals } from '../util/testUtils';
import experiments from '@cdo/apps/util/experiments';
import sinon from 'sinon';

describe('experiments', function () {
  let mockedQueryString = '';
  let date, now, expirationTime, clock;

  setExternalGlobals();

  before(function () {
    experiments.getQueryString_ = function () {
      return mockedQueryString;
    };

    date = new Date(2009, 0, 20);
    now = date.getTime();
    const expriationDate = new Date(now);
    expriationDate.setHours(expriationDate.getHours() + 12);
    expirationTime = expriationDate.getTime();
    clock = sinon.useFakeTimers(date.getTime());
  });

  after(function () {
    clock.restore();
  });

  beforeEach(function () {
    mockedQueryString = ' ';
    localStorage.removeItem('experimentsList');
  });

  it('can load experiment state from localStorage "experimentsList" key', function () {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    localStorage.setItem('experimentsList',
        JSON.stringify([{key: 'awesome-feature', expiration: now + 1}]));
    assert.isTrue(experiments.isEnabled('awesome-feature'));
  });

  it('can persist experiment state to local storage "experimentList" key', function () {
    assert.isNull(localStorage.getItem('experimentsList'));
    experiments.setEnabled('awesome-feature', true);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature', expiration: expirationTime}]
    );
    experiments.setEnabled('better-feature', true);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [
        {key: 'better-feature', expiration: expirationTime},
        {key: 'awesome-feature', expiration: expirationTime},
      ]
    );

    experiments.setEnabled('awesome-feature', false);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'better-feature', expiration: expirationTime}],
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

  it('still registers an experiment as enabled 11 hours after enabling it', function () {
    experiments.setEnabled('best-feature', true);
    clock.tick(11 * 60 * 60 * 1000);
    assert.isTrue(experiments.isEnabled('best-feature'));
  });

  it('no longer registers an experiment as enabled 13 hours after enabling it', function () {
    experiments.setEnabled('best-feature', true);
    clock.tick(13 * 60 * 60 * 1000);
    assert.isFalse(experiments.isEnabled('best-feature'));
  });

  it('resets the expiration if setEnabled is called again', function () {
    experiments.setEnabled('best-feature', true);
    clock.tick(9 * 60 * 60 * 1000);
    experiments.setEnabled('best-feature', true);
    clock.tick(9 * 60 * 60 * 1000);
    assert.isTrue(experiments.isEnabled('best-feature'));
    clock.tick(4 * 60 * 60 * 1000);
    assert.isFalse(experiments.isEnabled('best-feature'));
  });

  it('quietly returns false if localstorage throws an exception', function () {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('some error');
    };

    localStorage.setItem('experimentsList',
        JSON.stringify(['awesome-feature']));
    assert.isFalse(experiments.isEnabled('awesome-feature'));

    localStorage.getItem = originalGetItem;
  });

  it('expires old-style experiments in localstorage', function () {
    localStorage.setItem('experimentsList',
        JSON.stringify(['awesome-feature']));
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    assert.equal(localStorage.getItem('experimentsList'), '[]');
  });
});
