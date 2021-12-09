import experiments from '@cdo/apps/util/experiments';
import {expect} from '../../util/reconfiguredChai';
import DCDO from '@cdo/apps/dcdo';

describe('experiments.isEnabled', () => {
  afterEach(() => {
    // cleanup changes the tests made to the global DCDO object.
    DCDO.reset();
  });
  it('returns false given unknown experiment', () => {
    expect(experiments.isEnabled('unknown-experiment')).to.equal(false);
  });

  it('returns false given dcdo experiment not enabled', () => {
    DCDO.set('test-experiment', false);
    expect(experiments.isEnabled('test-experiment')).to.equal(false);
  });

  it('returns true given dcdo experiment is enabled', () => {
    DCDO.set('test-experiment', true);
    expect(experiments.isEnabled('test-experiment')).to.equal(true);
  });
});
