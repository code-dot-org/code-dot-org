/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/reconfiguredChai';
import {fireEvent, render, screen} from '@testing-library/react';
import * as utils from '@cdo/apps/utils';
import * as boardUtils from '@cdo/apps/lib/kits/maker/util/boardUtils';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/lib/kits/maker/microBitRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

const STEP_DELAY_MS = 1;

describe('SetupChecklist', () => {
  // Speed up the tests by reducing the artificial delay between steps

  beforeEach(() => {
    sinon.stub(utils, 'reload');
    sinon.stub(window.console, 'error');
    sinon
      .stub(SetupChecker.prototype, 'detectSupportedBrowser')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'detectBoardPluggedIn')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'detectCorrectFirmware')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'detectBoardType')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'detectComponentsInitialize')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'celebrate')
      .callsFake(() => Promise.resolve());
    stubRedux();
    registerReducers({microBit: microBitReducer});
    getStore().dispatch(setMicroBitFirmataUpdatePercent(0));
  });

  afterEach(() => {
    window.console.error.restore();
    utils.reload.restore();
    SetupChecker.prototype.detectSupportedBrowser.restore();
    SetupChecker.prototype.detectBoardPluggedIn.restore();
    SetupChecker.prototype.detectCorrectFirmware.restore();
    SetupChecker.prototype.detectBoardType.restore();
    SetupChecker.prototype.detectComponentsInitialize.restore();
    SetupChecker.prototype.celebrate.restore();
    restoreRedux();
  });

  function renderDefault() {
    return render(
      <Provider store={getStore()}>
        <SetupChecklist stepDelay={STEP_DELAY_MS} />
      </Provider>
    );
  }
  describe('Should use WebSerial', () => {
    before(() => {
      sinon.stub(boardUtils, 'shouldUseWebSerial').returns(true);
    });

    after(() => {
      boardUtils.shouldUseWebSerial.restore();
    });

    it('renders success', async () => {
      const {rerender} = renderDefault();
      expect(screen.getByRole('button', {name: 're-detect'})).to.be.disabled;
      expect(screen.getByTitle('waiting')).to.exist;
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).to.have.length(4);
      expect(window.console.error).not.to.have.been.called;
    });

    it('sends analytic event when a board is connected on /maker/setup page', async () => {
      const {rerender} = renderDefault();
      const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
      await yieldUntilDoneDetecting(screen, rerender);
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('Board Type On Maker Setup Page');
      analyticsReporter.sendEvent.restore();
    });

    it('does reload the page on re-detect', async () => {
      const {rerender} = renderDefault();
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).to.have.length(4);
      const redetectButton = screen.getByRole('button', {name: 're-detect'});
      fireEvent.click(redetectButton);
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).to.have.length(4);
      expect(utils.reload).to.have.been.called;
    });
  });

  function yieldUntilDoneDetecting(screen, rerender) {
    return yieldUntil(screen, rerender, screen => {
      const button = screen.getByRole('button', {name: 're-detect'});
      return !button.disabled;
    });
  }
});

/**
 * Returns a promise that resolves when a condition becomes true, or rejects
 * when a timeout is reached.
 * @param {object} wrapper
 * @param {function():boolean} predicate
 * @param {number} timeoutMs - maximum time to wait
 * @param {number} intervalMs - time to wait between steps
 * @return {Promise}
 */
function yieldUntil(
  screen,
  rerender,
  predicate,
  timeoutMs = 3500,
  intervalMs = 5
) {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;
    const key = setInterval(() => {
      if (predicate(screen)) {
        clearInterval(key);
        resolve();
      } else {
        elapsedTime += intervalMs;
        // Update the screen.
        rerender(
          <Provider store={getStore()}>
            <SetupChecklist stepDelay={STEP_DELAY_MS} />
          </Provider>
        );
        if (elapsedTime > timeoutMs) {
          clearInterval(key);
          reject(new Error(`yieldUntil exceeded timeout of ${timeoutMs}ms`));
        }
      }
    }, intervalMs);
  });
}
