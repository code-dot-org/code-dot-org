import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import reducer, {
  onLevelChange,
  setShareFailure,
} from '@cdo/apps/lab2/lab2Redux';
import {LevelProperties, ShareFailure} from '@cdo/apps/lab2/types';

const FAKE_LEVEL_PROPERTIES = {
  appName: 'sketchlab',
} as LevelProperties;

const PROFANITY_FAILURE: ShareFailure = {type: 'profanity'};

describe('lab2Redux', () => {
  describe('onLevelChange', () => {
    it('stores the share failure', () => {
      const state = reducer(
        undefined,
        onLevelChange({
          levelProperties: FAKE_LEVEL_PROPERTIES,
          shareFailure: PROFANITY_FAILURE,
        })
      );
      expect(state.shareFailure).to.deep.equal(PROFANITY_FAILURE);
    });

    it('clears the share failure when a level loads without one', () => {
      const blockedState = reducer(
        undefined,
        onLevelChange({
          levelProperties: FAKE_LEVEL_PROPERTIES,
          shareFailure: PROFANITY_FAILURE,
        })
      );
      const state = reducer(
        blockedState,
        onLevelChange({levelProperties: FAKE_LEVEL_PROPERTIES})
      );
      expect(state.shareFailure).to.be.null;
    });
  });

  describe('setShareFailure', () => {
    it('replaces the stored share failure', () => {
      const state = reducer(undefined, setShareFailure(PROFANITY_FAILURE));
      expect(state.shareFailure).to.deep.equal(PROFANITY_FAILURE);

      const cleared = reducer(state, setShareFailure(null));
      expect(cleared.shareFailure).to.be.null;
    });
  });
});
