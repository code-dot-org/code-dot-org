import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as achievements from '@cdo/apps/achievements';
import authoredHintUtils from '@cdo/apps/authoredHintUtils';

import {expect} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('achievements', () => {
  describe('puzzleComplete', () => {
    it('is always achieved', () => {
      const state = {};
      expect(achievements.puzzleComplete(state)).to.include({
        isAchieved: true,
        message: 'Puzzle completed!',
      });
    });
  });

  describe('usingHints', () => {
    it('is achieved if you used one hint', () => {
      const stub = sinon
        .stub(authoredHintUtils, 'currentOpenedHintCount')
        .callsFake(() => 1);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        },
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: true,
        message: 'Using just one hint!',
      });

      stub.restore();
    });

    it('is not achieved if you used too many hints', () => {
      const stub = sinon
        .stub(authoredHintUtils, 'currentOpenedHintCount')
        .callsFake(() => 3);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        },
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: false,
        message: 'Using hints',
      });

      stub.restore();
    });

    afterAll(() => {});
  });
});
