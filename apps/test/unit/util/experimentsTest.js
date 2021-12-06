import experiments from '@cdo/apps/util/experiments';
import {expect} from '../../util/reconfiguredChai';

describe('experiments.isEnabled', () => {
  it('returns false given unknown experiment', () => {
    expect(experiments.isEnabled('unknown-experiment')).to.equal(false);
  });

  it('returns false given dcdo experiment not enabled', () => {
    window.dcdo = {'test-experiment': false};
    expect(experiments.isEnabled('test-experiment')).to.equal(false);
    // cleanup
    window.dcdo = undefined;
  });

  it('returns false given dcdo experiment not enabled', () => {
    window.dcdo = {'test-experiment': true};
    expect(experiments.isEnabled('test-experiment')).to.equal(true);
    // cleanup
    window.dcdo = undefined;
  });
});
