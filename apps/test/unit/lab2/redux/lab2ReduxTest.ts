import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import reducer, {onLevelChange} from '@cdo/apps/lab2/lab2Redux';
import {LevelProperties} from '@cdo/apps/lab2/types';

const FAKE_LEVEL_PROPERTIES = {
  appName: 'sketchlab',
} as LevelProperties;

describe('lab2Redux', () => {
  describe('onLevelChange', () => {
    it('stores the privacy/profanity violation flag', () => {
      const state = reducer(
        undefined,
        onLevelChange({
          levelProperties: FAKE_LEVEL_PROPERTIES,
          hasPrivacyProfanityViolation: true,
        })
      );
      expect(state.hasPrivacyProfanityViolation).to.be.true;
    });

    it('clears the flag when a level loads without one', () => {
      const blockedState = reducer(
        undefined,
        onLevelChange({
          levelProperties: FAKE_LEVEL_PROPERTIES,
          hasPrivacyProfanityViolation: true,
        })
      );
      const state = reducer(
        blockedState,
        onLevelChange({levelProperties: FAKE_LEVEL_PROPERTIES})
      );
      expect(state.hasPrivacyProfanityViolation).to.be.undefined;
    });
  });
});
