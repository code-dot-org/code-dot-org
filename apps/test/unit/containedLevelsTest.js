import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {assert} from '../util/reconfiguredChai';
import sinon from 'sinon';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import * as callouts from '@cdo/apps/code-studio/callouts';
import {
  getContainedLevelResultInfo,
  getValidatedResult,
  initializeContainedLevel
} from '@cdo/apps/containedLevels';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import GameButtons from '@cdo/apps/templates/GameButtons';
import {TestResults} from '@cdo/apps/constants';
import $ from 'jquery';
import {setInstructionsConstants} from '@cdo/apps/redux/instructions';

describe('getContainedLevelResultInfo', () => {
  const containedLevelResult = {
    id: 6669,
    app: 'multi',
    callback: 'http://localhost-studio.code.org:3000/milestone/2023/16504/6669',
    result: {
      response: 1,
      result: false,
      errorType: null,
      submitted: false,
      valid: true
    },
    feedback: 'This is feedback'
  };

  let gameButtons;
  let attemptedRunButtonClickListener;

  beforeEach(() => {
    sinon
      .stub(codeStudioLevels, 'getContainedLevelResult')
      .returns(containedLevelResult);
    sinon.stub(codeStudioLevels, 'hasValidContainedLevelResult');
    stubRedux();
    registerReducers(commonReducers);

    gameButtons = document.createElement('div');
    ReactDOM.render(
      <Provider store={getStore()}>
        <GameButtons
          hideRunButton={false}
          runButtonText={'Run'}
          playspacePhoneFrame={false}
          nextLevelUrl={'nextUrl'}
          showSkipButton
          showFinishButton
        />
      </Provider>,
      gameButtons
    );
    document.body.appendChild(gameButtons);

    sinon.stub(codeStudioLevels, 'lockContainedLevelAnswers');
    sinon.stub(codeStudioLevels, 'registerAnswerChangedFn');
    sinon.stub(callouts, 'addCallouts');
    attemptedRunButtonClickListener = sinon.stub();
    $(window).on('attemptedRunButtonClick', attemptedRunButtonClickListener);
  });

  afterEach(() => {
    codeStudioLevels.lockContainedLevelAnswers.restore();
    codeStudioLevels.registerAnswerChangedFn.restore();
    callouts.addCallouts.restore();
    $(window).off('attemptedRunButtonClick', attemptedRunButtonClickListener);

    codeStudioLevels.getContainedLevelResult.restore();
    codeStudioLevels.hasValidContainedLevelResult.restore();
    restoreRedux();
    document.body.removeChild(gameButtons);
  });

  it('returns the right info', () => {
    const info = getContainedLevelResultInfo();
    assert.deepEqual(info, {
      app: 'multi',
      level: 6669,
      callback:
        'http://localhost-studio.code.org:3000/milestone/2023/16504/6669',
      result: true,
      testResult: TestResults.CONTAINED_LEVEL_RESULT,
      program: 1,
      feedback: 'This is feedback',
      submitted: false
    });
  });

  it('returns an unvalidated result', () => {
    const validatedResult = getValidatedResult();
    assert.isFalse(validatedResult);
  });

  it('returns a validated result', () => {
    containedLevelResult.result.result = true;

    const validatedResult = getValidatedResult();
    assert.isTrue(validatedResult);

    containedLevelResult.result.result = false;
  });

  /**
   * Changes the hasContainedLevels value in the redux instructions module
   * correctly by dispatching an action, and without changing any of the
   * other constants.
   * @param {boolean} newValue
   */
  function setHasContainedLevels(newValue) {
    const store = getStore();
    store.dispatch(
      setInstructionsConstants({
        ...store.getState().instructions,
        hasContainedLevels: newValue
      })
    );
  }

  it('does not disable run button when level not contained', () => {
    setHasContainedLevels(false);
    initializeContainedLevel();
    assert.isFalse($('#runButton').prop('disabled'));
  });

  it('locks contained level answer if valid', () => {
    setHasContainedLevels(true);
    codeStudioLevels.hasValidContainedLevelResult.returns(true);
    initializeContainedLevel();
    assert.isTrue(codeStudioLevels.lockContainedLevelAnswers.calledOnce);
    assert.isFalse($('#runButton').prop('disabled'));
  });

  it('disables run button if no valid answer and reenables when answer is valid', () => {
    setHasContainedLevels(true);
    codeStudioLevels.hasValidContainedLevelResult.returns(false);
    initializeContainedLevel();
    const runButton = $('#runButton');
    const runButtonWrapper = $('#runButtonWrapper');
    const gameButtons = $('#gameButtons');
    assert.isTrue(callouts.addCallouts.calledOnce);
    assert.isTrue(runButton.prop('disabled'));

    gameButtons.click();
    assert.isFalse(attemptedRunButtonClickListener.called);

    runButtonWrapper.click();
    assert.isTrue(attemptedRunButtonClickListener.calledOnce);

    // Change answer to valid, should re-enable run button and unbind click listener.
    codeStudioLevels.hasValidContainedLevelResult.returns(true);
    codeStudioLevels.registerAnswerChangedFn.firstCall.args[0]();
    assert.isFalse(runButton.prop('disabled'));

    attemptedRunButtonClickListener.resetHistory();
    runButtonWrapper.click();
    assert.isFalse(attemptedRunButtonClickListener.called);
  });
});
