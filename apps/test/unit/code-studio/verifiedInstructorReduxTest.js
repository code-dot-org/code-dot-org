import reducer, {
  setVerified,
  setVerifiedResources,
} from '@cdo/apps/code-studio/verifiedInstructorRedux'; // eslint-disable-line no-restricted-imports

describe('verifiedInstructorRedux', () => {
  it('begins with teachers unverified', () => {
    const state = reducer(undefined, {});
    expect(state.isVerified).toBe(false);
  });

  it('sets isVerified to true when setVerified is dispatched', () => {
    const state = reducer(undefined, setVerified());
    expect(state.isVerified).toBe(true);
  });

  it('begins with assumption that course/script has no resources requiring verification', () => {
    const state = reducer(undefined, {});
    expect(state.hasVerifiedResources).toBe(false);
  });

  it('sets hasVerifiedResources to true when setVerifiedResources is dispatched', () => {
    const state = reducer(undefined, setVerifiedResources());
    expect(state.hasVerifiedResources).toBe(true);
  });
});
