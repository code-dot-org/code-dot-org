import {assert} from '../util/deprecatedChai';
import {setExternalGlobals} from '../util/testUtils';
import experiments from '@cdo/apps/util/experiments';
import sinon from 'sinon';

describe('experiments', function() {
  let mockedQueryString = '';
  let date, now, expirationTime, clock;

  setExternalGlobals();

  before(function() {
    experiments.getQueryString_ = function() {
      return mockedQueryString;
    };
  });

  beforeEach(function() {
    mockedQueryString = ' ';
    localStorage.removeItem('experimentsList');

    date = new Date(2009, 0, 20);
    now = date.getTime();
    const expriationDate = new Date(now);
    expriationDate.setHours(expriationDate.getHours() + 12);
    expirationTime = expriationDate.getTime();
    clock = sinon.useFakeTimers(date.getTime());
  });

  afterEach(function() {
    clock.restore();
  });

  it('can load experiment state from localStorage "experimentsList" key', function() {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([{key: 'awesome-feature', expiration: now + 1}])
    );
    assert.isTrue(experiments.isEnabled('awesome-feature'));
  });

  it('can persist experiment state to local storage "experimentList" key', function() {
    assert.isNull(localStorage.getItem('experimentsList'));
    experiments.setEnabled('awesome-feature', true);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature'}]
    );
    experiments.setEnabled('better-feature', true);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'better-feature'}, {key: 'awesome-feature'}]
    );

    experiments.setEnabled('awesome-feature', false);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'better-feature'}]
    );
  });

  it('can persist temporary experiment state to local storage "experimentList" key', function() {
    assert.isNull(localStorage.getItem('experimentsList'));
    experiments.setEnabled('awesome-feature', true, expirationTime);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature', expiration: expirationTime}]
    );
    experiments.setEnabled('better-feature', true, expirationTime);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [
        {key: 'better-feature', expiration: expirationTime},
        {key: 'awesome-feature', expiration: expirationTime}
      ]
    );

    experiments.setEnabled('awesome-feature', false);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'better-feature', expiration: expirationTime}]
    );
  });

  it('can return a list of all enabled experiments', function() {
    assert.isArray(experiments.getEnabledExperiments());
    assert.lengthOf(experiments.getEnabledExperiments(), 0);
    experiments.setEnabled('awesome-feature', true);
    experiments.setEnabled('better-feature', true);
    assert.sameMembers(experiments.getEnabledExperiments(), [
      'awesome-feature',
      'better-feature'
    ]);
  });

  it('can enable experiments with the enableExperiments query parameter', function() {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?enableExperiments=awesome-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    clock.tick(13 * 60 * 60 * 1000);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
  });

  it('can enable multiple experiments with the enableExperiments query parameter', function() {
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?enableExperiments=awesome-feature,better-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.isTrue(experiments.isEnabled('better-feature'));
  });

  it('can temporarily enable experiments with the tempEnableExperiments query parameter', function() {
    mockedQueryString = '?tempEnableExperiments=awesome-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '';
    clock.tick(13 * 60 * 60 * 1000);
    assert.isFalse(experiments.isEnabled('awesome-feature'));
  });

  it('can disable an experiment with the disableExperiments query parameter', function() {
    experiments.setEnabled('awesome-feature', true);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?disableExperiments=awesome-feature';
    assert.isFalse(experiments.isEnabled('awesome-feature'));
  });

  it('can disable a temporary experiment with the disableExperiments query parameter', function() {
    experiments.setEnabled('awesome-feature', true, expirationTime);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    mockedQueryString = '?disableExperiments=awesome-feature';
    assert.isFalse(experiments.isEnabled('awesome-feature'));
  });

  it('can disable multiple experiments with the disableExperiments query parameter', function() {
    experiments.setEnabled('awesome-feature', true);
    experiments.setEnabled('better-feature', true);
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.isTrue(experiments.isEnabled('better-feature'));
    mockedQueryString = '?disableExperiments=awesome-feature,better-feature';
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    assert.isFalse(experiments.isEnabled('better-feature'));
  });

  it('can convert a temporary experiment to a permanent one with the enableExperiments query parameter', function() {
    experiments.setEnabled('awesome-feature', true, expirationTime);
    mockedQueryString = '?enableExperiments=awesome-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature'}]
    );
  });

  it('can convert a permanent experiment to a temporary one with the tempEnableExperiments query parameter', function() {
    experiments.setEnabled('awesome-feature', true);
    mockedQueryString = '?tempEnableExperiments=awesome-feature';
    assert.isTrue(experiments.isEnabled('awesome-feature'));
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature', expiration: expirationTime}]
    );
  });

  it('still registers a temporary experiment as enabled 11 hours after enabling it', function() {
    experiments.setEnabled('best-feature', true, expirationTime);
    clock.tick(11 * 60 * 60 * 1000);
    assert.isTrue(experiments.isEnabled('best-feature'));
  });

  it('no longer registers a temporary experiment as enabled 13 hours after enabling it', function() {
    experiments.setEnabled('best-feature', true, expirationTime);
    clock.tick(13 * 60 * 60 * 1000);
    assert.isFalse(experiments.isEnabled('best-feature'));
  });

  it('still registers a non-expiring experiment as enabled 13 hours after enabling it', function() {
    experiments.setEnabled('best-feature', true);
    clock.tick(13 * 60 * 60 * 1000);
    assert.isTrue(experiments.isEnabled('best-feature'));
  });

  it('resets the expiration if setEnabled is called again', function() {
    experiments.setEnabled('awesome-feature', true, expirationTime);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature', expiration: expirationTime}]
    );
    const newExpirationTime = expirationTime + 10;
    experiments.setEnabled('awesome-feature', true, newExpirationTime);
    assert.sameDeepMembers(
      JSON.parse(localStorage.getItem('experimentsList')),
      [{key: 'awesome-feature', expiration: newExpirationTime}]
    );
  });

  it('quietly returns false if localstorage throws an exception', function() {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('some error');
    };

    localStorage.setItem(
      'experimentsList',
      JSON.stringify(['awesome-feature'])
    );
    assert.isFalse(experiments.isEnabled('awesome-feature'));

    localStorage.getItem = originalGetItem;
  });

  it('expires old-style experiments in localstorage', function() {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify(['awesome-feature'])
    );
    assert.isFalse(experiments.isEnabled('awesome-feature'));
    assert.equal(localStorage.getItem('experimentsList'), '[]');
  });
});
