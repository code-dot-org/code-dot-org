import { assert } from 'chai';
import Multi from '@cdo/apps/code-studio/levels/multi';

describe('multi', () => {
  let originalAppOptions;
  before(() => {
    originalAppOptions = window.appOptions;
    window.appOptions = {};
  });
  after(() => {
    window.appOptions = originalAppOptions;
  });

  describe('validateAnswers', () => {
    const levelId = 1028;
    const id = "level_1028";
    const app = "multi";
    const standalone = false;
    const numAnswers = 1;
    const answers = [false, true, false];
    const answersFeedback = [null, null, null];
    const lastAttemptString = "";
    const containedMode = false;

    it('returns true if user provides the correct answer', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, lastAttemptString, containedMode);
      multi.clickItem(1);
      assert.strictEqual(multi.validateAnswers(), true);
    });

    it('returns false if user provides the wrong answer', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, lastAttemptString, containedMode);
      multi.clickItem(0);
      assert.strictEqual(multi.validateAnswers(), false);
    });

    it('returns false if user provides no answers', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, lastAttemptString, containedMode);
      assert.strictEqual(multi.validateAnswers(), false);
    });

    it('returns false if user answers correctly but multi was not given the answers', () => {
      const noAnswers = undefined;

      const multi = new Multi(levelId, id, app, standalone, numAnswers, noAnswers,
        answersFeedback, lastAttemptString, containedMode);

      multi.clickItem(1);
      assert.strictEqual(multi.validateAnswers(), false);
    });
  });
});
