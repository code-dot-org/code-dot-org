import {writeSourceForLevel} from '@cdo/apps/code-studio/clientState'; // eslint-disable-line no-restricted-imports
import Multi from '@cdo/apps/code-studio/levels/multi';
import {
  LegacyTooFewDialog,
  LegacyIncorrectDialog,
} from '@cdo/apps/legacySharedComponents/LegacyDialogContents';

import {TestResults} from '../../../../src/constants';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';

describe('multi', () => {
  const levelId = 1028;
  const id = 'level_1028';
  const app = 'multi';
  const standalone = false;
  const numAnswers = 1;
  const answers = [false, true, false];
  const answersFeedback = [null, null, null];
  const lastAttemptNum = 2;
  const lastAttemptString = '2';
  const otherLastAttemptString = '0';
  const emptyLastAttemptString = '';
  const containedMode = false;
  const allowMultipleAttempts = false;

  beforeAll(() => {
    replaceOnWindow('appOptions', {});
  });
  afterAll(() => {
    restoreOnWindow('appOptions');
  });

  // Clear source written via writeSourceForLevel
  afterEach(() => sessionStorage.clear());

  describe('validateAnswers', () => {
    it('returns true if user provides the correct answer', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );
      multi.clickItem(1);
      expect(multi.validateAnswers()).toBe(true);
    });

    it('returns false if user provides the wrong answer', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );
      multi.clickItem(0);
      expect(multi.validateAnswers()).toBe(false);
    });

    it('returns false if user provides no answers', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );
      expect(multi.validateAnswers()).toBe(false);
    });

    it('returns false if user answers correctly but multi was not given the answers', () => {
      const noAnswers = undefined;

      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        noAnswers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );

      multi.clickItem(1);
      expect(multi.validateAnswers()).toBe(false);
    });
  });

  describe('Shows last attempt', () => {
    const scriptName = 'test-script';

    it('selects nothing if there was no last attempt', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );
      expect(multi.selectedAnswers).toHaveLength(0);
    });

    it('selects the server-side last attempt when provided', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        lastAttemptString,
        containedMode,
        allowMultipleAttempts
      );
      expect(multi.selectedAnswers).toEqual(
        expect.arrayContaining([lastAttemptNum])
      );
    });

    it('selects the client-side last attempt when available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(
        scriptName,
        levelId,
        +new Date(2017, 1, 19),
        lastAttemptString
      );
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );

      expect(multi.selectedAnswers).toEqual(
        expect.arrayContaining([lastAttemptNum])
      );
    });

    it('selects the server-side last attempt when both are available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(
        scriptName,
        levelId,
        +new Date(2017, 1, 19),
        otherLastAttemptString
      );
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        lastAttemptString,
        containedMode,
        allowMultipleAttempts
      );

      expect(multi.selectedAnswers).toEqual(
        expect.arrayContaining([lastAttemptNum])
      );
    });

    it('selects none after attempt is reset', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(
        scriptName,
        levelId,
        +new Date(2017, 1, 19),
        lastAttemptString
      );
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        emptyLastAttemptString,
        containedMode,
        allowMultipleAttempts
      );

      expect(multi.selectedAnswers).toEqual(
        expect.arrayContaining([lastAttemptNum])
      );

      multi.resetAnswers();

      expect(multi.selectedAnswers.length).toBe(0);
    });
  });

  describe('getResult', () => {
    it('returns correct data for valid result when allowMultipleAttempts is true', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        lastAttemptString,
        containedMode,
        true
      );
      multi.clickItem(1);
      const result = multi.getResult(true);

      expect(result).toEqual({
        response: 1,
        result: true,
        errorDialog: undefined,
        submitted: false,
        testResult: undefined,
        valid: true,
      });
    });

    it('returns correct data for incorrect answer when allowMultipleAttempts is false', () => {
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        numAnswers,
        answers,
        answersFeedback,
        lastAttemptString,
        containedMode,
        false
      );
      multi.clickItem(0);
      const result = multi.getResult(true);

      expect(result.response).toEqual(0);
      expect(result.result).toEqual(false);
      expect(result.errorDialog.type).toEqual(LegacyIncorrectDialog);
      expect(result.testResult).toEqual(TestResults.CONTAINED_LEVEL_RESULT);
    });

    it('returns a TooFewDialog for too few answers', () => {
      // numAnswers of 2 instead of 1
      const multi = new Multi(
        levelId,
        id,
        app,
        standalone,
        2,
        answers,
        answersFeedback,
        null,
        containedMode,
        allowMultipleAttempts
      );
      const result = multi.getResult(true);

      expect(result.errorDialog.type).toBe(LegacyTooFewDialog);
    });
  });
});
