import { assert } from 'chai';
import reducer, {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedTeacherRedux';

describe('verifiedTeacherRedux', () => {
  it('begins with teachers unverified', () => {
    const state = reducer(undefined, {});
    assert.strictEqual(state.isVerified, false);
  });

  it('sets isVerified to true when setVerified is dispatched', () => {
    const state = reducer(undefined, setVerified());
    assert.strictEqual(state.isVerified, true);
  });

  it('begins with assumption that course/script has no resources requiring verification', () => {
    const state = reducer(undefined, {});
    assert.strictEqual(state.hasVerifiedResources, false);
  });

  it('sets hasVerifiedResources to true when setVerifiedResources is dispatched', () => {
    const state = reducer(undefined, setVerifiedResources());
    assert.strictEqual(state.hasVerifiedResources, true);
  });
});
