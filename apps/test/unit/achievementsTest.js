import {expect} from '../util/reconfiguredChai';
import * as achievements from '@cdo/apps/achievements';
import authoredHintUtils from '@cdo/apps/authoredHintUtils';

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
      const stub = jest
        .spyOn(authoredHintUtils, 'currentOpenedHintCount')
        .mockClear()
        .mockImplementation(() => 1);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        },
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: true,
        message: 'Using just one hint!',
      });

      stub.mockRestore();
    });

    it('is not achieved if you used too many hints', () => {
      const stub = jest
        .spyOn(authoredHintUtils, 'currentOpenedHintCount')
        .mockClear()
        .mockImplementation(() => 3);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        },
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: false,
        message: 'Using hints',
      });

      stub.mockRestore();
    });

    after(() => {});
  });
});
