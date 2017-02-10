import { assert, expect } from 'chai';
import Multi from '@cdo/apps/code-studio/levels/multi';
import { writeSourceForLevel } from '@cdo/apps/code-studio/clientState';

describe('multi', () => {
  const levelId = 1028;
  const id = "level_1028";
  const app = "multi";
  const standalone = false;
  const numAnswers = 1;
  const answers = [false, true, false];
  const answersFeedback = [null, null, null];
  const lastAttemptNum = 2;
  const lastAttemptString = "2";
  const otherLastAttemptString = "0";
  const emptyLastAttemptString = "";
  const containedMode = false;

  let originalAppOptions;
  before(() => {
    originalAppOptions = window.appOptions;
    window.appOptions = {};
  });
  after(() => {
    window.appOptions = originalAppOptions;
  });

  describe('validateAnswers', () => {
    it('returns true if user provides the correct answer', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, emptyLastAttemptString, containedMode);
      multi.clickItem(1);
      assert.strictEqual(multi.validateAnswers(), true);
    });

    it('returns false if user provides the wrong answer', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, emptyLastAttemptString, containedMode);
      multi.clickItem(0);
      assert.strictEqual(multi.validateAnswers(), false);
    });

    it('returns false if user provides no answers', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, emptyLastAttemptString, containedMode);
      assert.strictEqual(multi.validateAnswers(), false);
    });

    it('returns false if user answers correctly but multi was not given the answers', () => {
      const noAnswers = undefined;

      const multi = new Multi(levelId, id, app, standalone, numAnswers, noAnswers,
        answersFeedback, emptyLastAttemptString, containedMode);

      multi.clickItem(1);
      assert.strictEqual(multi.validateAnswers(), false);
    });
  });

  describe('Shows last attempt', () => {
    const scriptName = 'test-script';

    it('selects nothing if there was no last attempt', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
          answersFeedback, emptyLastAttemptString, containedMode);
      expect(multi.selectedAnswers).to.be.empty;
    });

    it('selects the server-side last attempt when provided', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
          answersFeedback, lastAttemptString, containedMode);
      expect(multi.selectedAnswers).to.include(lastAttemptNum);
    });

    it('selects the client-side last attempt when available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(scriptName, levelId, +new Date(2017, 1, 19), lastAttemptString);
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
          answersFeedback, emptyLastAttemptString, containedMode);

      expect(multi.selectedAnswers).to.include(lastAttemptNum);
    });

    it('selects the server-side last attempt when both are available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(scriptName, levelId, +new Date(2017, 1, 19), otherLastAttemptString);
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
          answersFeedback, lastAttemptString, containedMode);

      expect(multi.selectedAnswers).to.include(lastAttemptNum);
    });
  });
});
