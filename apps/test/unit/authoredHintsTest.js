import sinon from 'sinon';
import {expect} from '../util/deprecatedChai';

import * as utils from '@cdo/apps/utils';
import AuthoredHints from '@cdo/apps/authoredHints';
import authoredHintsReducer from '@cdo/apps/redux/authoredHints';
import {TestResults} from '@cdo/apps/constants';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';

describe('Authored Hints', () => {
  // stub (and restore) redux and a utils method
  beforeEach(() => {
    sinon.stub(utils, 'showGenericQtip').callsFake(() => {});
    stubRedux();
    registerReducers({authoredHints: authoredHintsReducer});
  });

  afterEach(() => {
    restoreRedux();
    utils.showGenericQtip.restore();
  });

  // set up structures to be tested
  let authoredHints, studioApp, hint;
  beforeEach(() => {
    studioApp = {
      config: {
        level: {}
      }
    };
    hint = {
      content: 'sample hint text',
      hintId: 'some hint',
      alreadySeen: false
    };

    authoredHints = new AuthoredHints(studioApp);
    authoredHints.init([hint], [], 1, 1);
  });

  describe('Just-in-Time Hint Prompt', () => {
    it('will not show the hint prompt by default', () => {
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.false;
    });

    const setUpStateToShowHintPrompt = () => {
      studioApp.lastTestResult = TestResults.MINIMUM_PASS_RESULT - 1;
      studioApp.config.level.hintPromptAttemptsThreshold = 2;
      studioApp.attempts = studioApp.config.level.hintPromptAttemptsThreshold;
    };

    it('will show the hint prompt if conditions are met', () => {
      setUpStateToShowHintPrompt();
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.true;
    });

    it('will only show the hint prompt if ALL conditions are met', () => {
      setUpStateToShowHintPrompt();
      studioApp.lastTestResult = TestResults.MINIMUM_PASS_RESULT;
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.false;

      setUpStateToShowHintPrompt();
      studioApp.attempts =
        studioApp.config.level.hintPromptAttemptsThreshold - 1;
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.false;
    });

    it('only shows the prompt once for a given level', () => {
      setUpStateToShowHintPrompt();
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.true;
      authoredHints.showOnetimeHintPrompt();
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.false;
    });

    it('will show the prompt again on a new level', () => {
      setUpStateToShowHintPrompt();
      authoredHints.showOnetimeHintPrompt();
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.false;
      authoredHints.levelId_++;
      expect(authoredHints.shouldShowOnetimeHintPrompt()).to.be.true;
    });
  });
});
