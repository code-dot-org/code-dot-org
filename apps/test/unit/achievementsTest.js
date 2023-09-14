import {expect} from '../util/reconfiguredChai';
import {puzzleComplete, usingHints} from '@cdo/apps/achievements';
import sinon from 'sinon';
import authoredHintUtils from '@cdo/apps/authoredHintUtils';

describe('achievements', () => {
  describe('puzzleComplete', () => {
    it('is always achieved', () => {
      const state = {};
      expect(puzzleComplete(state)).to.include({
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

      try {
        const state = {
          pageConstants: {
            serverLevelId: 123,
          },
        };

        expect(usingHints(state)).to.include({
          isAchieved: true,
          message: 'Using just one hint!',
        });
      } finally {
        stub.restore();
      }
    });

    it('is not achieved if you used too many hints', () => {
      const stub = sinon
        .stub(authoredHintUtils, 'currentOpenedHintCount')
        .callsFake(() => 3);

      try {
        const state = {
          pageConstants: {
            serverLevelId: 123,
          },
        };

        expect(usingHints(state)).to.include({
          isAchieved: false,
          message: 'Using hints',
        });
      } finally {
        stub.restore();
      }
    });

    after(() => {});
  });
});
