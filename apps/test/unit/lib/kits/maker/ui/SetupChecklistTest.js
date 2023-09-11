/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import * as utils from '@cdo/apps/utils';
import * as boardUtils from '@cdo/apps/lib/kits/maker/util/boardUtils';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/lib/kits/maker/microBitRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

describe('SetupChecklist', () => {
  let checker;

  // Speed up the tests by reducing the artificial delay between steps
  const STEP_DELAY_MS = 1;

  // Helpful selectors
  const REDETECT_BUTTON = 'input[value="re-detect"]';
  const WAITING_ICON = '.fa-clock-o';
  const SUCCESS_ICON = '.fa-check-circle';

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
    __testing_stubRedux();
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
    __testing_restoreRedux();
  });
  describe('Should use WebSerial', () => {
    before(() => {
      sinon.stub(boardUtils, 'shouldUseWebSerial').returns(true);
    });

    after(() => {
      boardUtils.shouldUseWebSerial.restore();
    });

    it('renders success', async () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        </Provider>
      );
      expect(wrapper.find(REDETECT_BUTTON)).to.be.disabled;
      expect(wrapper.find(WAITING_ICON)).to.have.length(1);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(REDETECT_BUTTON)).not.to.be.disabled;
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(window.console.error).not.to.have.been.called;
    });

    it('sends analytic event when a board is connected on /maker/setup page', async () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        </Provider>
      );
      const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
      await yieldUntilDoneDetecting(wrapper);
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('Board Type On Maker Setup Page');
      analyticsReporter.sendEvent.restore();
    });

    it('does reload the page on re-detect', async () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        </Provider>
      );
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      wrapper.find(REDETECT_BUTTON).simulate('click');
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(utils.reload).to.have.been.called;
    });
  });

  function yieldUntilDoneDetecting(wrapper) {
    return yieldUntil(
      wrapper,
      () => !wrapper.find(REDETECT_BUTTON).prop('disabled')
    );
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
function yieldUntil(wrapper, predicate, timeoutMs = 3500, intervalMs = 5) {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;
    const key = setInterval(() => {
      if (predicate()) {
        clearInterval(key);
        resolve();
      } else {
        elapsedTime += intervalMs;
        wrapper.update();
        if (elapsedTime > timeoutMs) {
          clearInterval(key);
          reject(new Error(`yieldUntil exceeded timeout of ${timeoutMs}ms`));
        }
      }
    }, intervalMs);
  });
}
