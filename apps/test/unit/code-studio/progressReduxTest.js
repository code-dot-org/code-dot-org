import { assert } from 'chai';

import reducer, {
  disablePostMilestone,
  setUserSignedIn,
  setIsHocScript,
  SignInState
} from '@cdo/apps/code-studio/progressRedux';

describe('progressReduxTest', () => {
  describe('reducer', () => {
    const initialState = reducer(undefined, {});

    it('initially sets postMilestoneDisabled to false', () => {
      assert.equal(initialState.postMilestoneDisabled, false);
    });

    it('can update postMilestoneDisabled', () => {
      const nextState = reducer(initialState, disablePostMilestone());
      assert.equal(nextState.postMilestoneDisabled, true);
    });

    it('initially sets signInState to Unknown', () => {
      assert.equal(initialState.signInState, SignInState.Unknown);
    });

    it('can update signInState', () => {
      const signedIn = reducer(initialState, setUserSignedIn(true));
      assert.equal(signedIn.signInState, SignInState.SignedIn);

      const signedOut = reducer(initialState, setUserSignedIn(false));
      assert.equal(signedOut.signInState, SignInState.SignedOut);
    });

    it ('initially sets isHocScript to null', () => {
      assert.equal(initialState.isHocScript, null);
    });

    it('can update isHocScript', () => {
      const isHocScript = reducer(initialState, setIsHocScript(true));
      assert.equal(isHocScript.isHocScript, true);

      const isNotHocScript = reducer(initialState, setIsHocScript(false));
      assert.equal(isNotHocScript.isHocScript, false);
    });
  });
});
