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
