import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

describe('experiments.isEnabled', () => {
  afterEach(() => {
    // cleanup changes the tests made to the global DCDO object.
    DCDO.reset();
  });
  it('returns false given unknown experiment', () => {
    expect(experiments.isEnabled('unknown-experiment')).toBe(false);
  });

  it('returns false given dcdo experiment not enabled', () => {
    DCDO.set('test-experiment', false);
    expect(experiments.isEnabled('test-experiment')).toBe(false);
  });

  it('returns true given dcdo experiment is enabled', () => {
    DCDO.set('test-experiment', true);
    expect(experiments.isEnabled('test-experiment')).toBe(true);
  });
});

describe('experiments.getLocalStorageExperimentDetails', () => {
  afterEach(() => {
    localStorage.removeItem('experimentsList');
  });

  it('drops duplicate keys and rewrites storage', () => {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([{key: 'dupe'}, {key: 'other'}, {key: 'dupe'}])
    );

    expect(experiments.getLocalStorageExperimentDetails()).toEqual([
      {key: 'dupe'},
      {key: 'other'},
    ]);
    expect(JSON.parse(localStorage.getItem('experimentsList'))).toEqual([
      {key: 'dupe'},
      {key: 'other'},
    ]);
  });

  it('keeps a valid entry that follows an expired duplicate', () => {
    const future = Date.now() + 1000;
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([
        {key: 'dupe', expiration: 1},
        {key: 'dupe', expiration: future},
      ])
    );

    expect(experiments.getLocalStorageExperimentDetails()).toEqual([
      {key: 'dupe', expiration: future},
    ]);
  });
});
