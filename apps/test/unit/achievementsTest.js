import {expect} from '../util/configuredChai';
import * as achievements from '@cdo/apps/achievements';
import sinon from 'sinon';
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

  describe('numberOfBlocks', () => {
    it('returns null if block limit is undefined', () => {
      const state = {
        feedback: {
          blockLimit: undefined,
        }
      };
      expect(achievements.numberOfBlocks(state)).to.be.null;
    });

    it('returns null if block limit is Infinity', () => {
      const state = {
        feedback: {
          blockLimit: Infinity,
        }
      };
      expect(achievements.numberOfBlocks(state)).to.be.null;
    });

    it('is achieved if blocks used is under the limit', () => {
      const state = {
        feedback: {
          blocksUsed: 7,
          blockLimit: 11,
        }
      };
      expect(achievements.numberOfBlocks(state)).to.include({
        isAchieved: true,
        message: 'Fewer than 11 blocks used!',
      });
    });

    it('is not achieved if blocks used is under the limit', () => {
      const state = {
        feedback: {
          blocksUsed: 17,
          blockLimit: 11,
        }
      };
      expect(achievements.numberOfBlocks(state)).to.include({
        isAchieved: false,
        message: 'Using too many blocks',
      });
    });
  });

  describe('usingHints', () => {

    it('is achieved if you used one hint', () => {
      const stub = sinon.stub(authoredHintUtils, 'currentOpenedHintCount')
        .callsFake(() => 1);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        }
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: true,
        message: 'Using just one hint!',
      });

      stub.restore();
    });

    it('is not achieved if you used too many hints', () => {
      const stub = sinon.stub(authoredHintUtils, 'currentOpenedHintCount')
        .callsFake(() => 3);
      const state = {
        pageConstants: {
          serverLevelId: 123,
        }
      };

      expect(achievements.usingHints(state)).to.include({
        isAchieved: false,
        message: 'Using hints',
      });

      stub.restore();
    });

    after(() => {
    });
  });
});
