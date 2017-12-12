import { assert, expect } from 'chai';
import Multi from '@cdo/apps/code-studio/levels/multi';
import { writeSourceForLevel } from '@cdo/apps/code-studio/clientState';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import { TooFewDialog } from '@cdo/apps/lib/ui/LegacyDialogContents';

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

  before(() => {
    replaceOnWindow('appOptions', {});
  });
  after(() => {
    restoreOnWindow('appOptions');
  });

  // Clear source written via writeSourceForLevel
  afterEach(() => sessionStorage.clear());

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

  describe('getResult', () => {
    it('returns correct data for valid result', () => {
      const multi = new Multi(levelId, id, app, standalone, numAnswers, answers,
        answersFeedback, lastAttemptString, containedMode);
      multi.clickItem(1);
      const result = multi.getResult(true);

      assert.deepEqual(result, {
        response: 1,
        result: true,
        errorDialog: undefined,
        submitted: false,
        valid: true
      });
    });

    it('returns a TooFewDialog for too few answers', () => {
      // numAnswers of 2 instead of 1
      const multi = new Multi(levelId, id, app, standalone, 2, answers,
        answersFeedback, null, containedMode);
      const result = multi.getResult(true);

      assert.strictEqual(result.errorDialog.type, TooFewDialog);
    });
  });
});
