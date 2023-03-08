/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import * as utils from '@cdo/apps/utils';
import * as browserChecks from '@cdo/apps/lib/kits/maker/util/browserChecks';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import microbitReducer, {
  setMicrobitFirmataUpdatePercent
} from '@cdo/apps/lib/kits/maker/microbitRedux';

describe('SetupChecklist', () => {
  let checker;

  // Speed up the tests by reducing the artificial delay between steps
  const STEP_DELAY_MS = 1;

  // Helpful selectors
  const REDETECT_BUTTON = 'input[value="re-detect"]';
  const WAITING_ICON = '.fa-clock-o';
  const SUCCESS_ICON = '.fa-check-circle';
  const FAILURE_ICON = '.fa-times-circle';
  const error = new Error('test error');

  beforeEach(() => {
    sinon.stub(utils, 'reload');
    sinon.stub(window.console, 'error');
    sinon
      .stub(SetupChecker.prototype, 'detectSupportedBrowser')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(SetupChecker.prototype, 'detectChromeAppInstalled')
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
    registerReducers({microbit: microbitReducer});
    getStore().dispatch(setMicrobitFirmataUpdatePercent('0%'));
  });

  afterEach(() => {
    window.console.error.restore();
    utils.reload.restore();
    SetupChecker.prototype.detectSupportedBrowser.restore();
    SetupChecker.prototype.detectChromeAppInstalled.restore();
    SetupChecker.prototype.detectBoardPluggedIn.restore();
    SetupChecker.prototype.detectCorrectFirmware.restore();
    SetupChecker.prototype.detectBoardType.restore();
    SetupChecker.prototype.detectComponentsInitialize.restore();
    SetupChecker.prototype.celebrate.restore();
    restoreRedux();
  });

  describe('on Chrome OS', () => {
    before(() => {
      sinon.stub(browserChecks, 'isChrome').returns(true);
      sinon.stub(browserChecks, 'isCodeOrgBrowser').returns(false); // maker app
    });

    after(() => {
      browserChecks.isCodeOrgBrowser.restore();
      browserChecks.isChrome.restore();
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

    describe('test with expected console.error', () => {
      it('does not reload the page on re-detect if successful', async () => {
        const wrapper = mount(
          <Provider store={getStore()}>
            <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
          </Provider>
        );
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
        wrapper.find(REDETECT_BUTTON).simulate('click');
        expect(wrapper.find(WAITING_ICON)).to.have.length(1);
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
        expect(utils.reload).not.to.have.been.called;
      });

      it('reloads the page on re-detect if plugin not installed', async () => {
        SetupChecker.prototype.detectChromeAppInstalled.restore();
        sinon
          .stub(SetupChecker.prototype, 'detectChromeAppInstalled')
          .callsFake(() => Promise.reject(error));
        const wrapper = mount(
          <Provider store={getStore()}>
            <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
          </Provider>
        );
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(0);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(0);
        wrapper.find(REDETECT_BUTTON).simulate('click');
        expect(utils.reload).to.have.been.called;
      });
    });
  });

  describe('on Code.org Browser', () => {
    before(() => {
      sinon.stub(browserChecks, 'isChrome').returns(false);
      sinon.stub(browserChecks, 'isCodeOrgBrowser').returns(true);
    });

    after(() => {
      browserChecks.isCodeOrgBrowser.restore();
      browserChecks.isChrome.restore();
    });

    it('renders success', async () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <SetupChecklist stepDelay={STEP_DELAY_MS} />
        </Provider>
      );
      expect(wrapper.find(REDETECT_BUTTON)).to.be.disabled;
      expect(wrapper.find(WAITING_ICON)).to.have.length(1);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(REDETECT_BUTTON)).not.to.be.disabled;
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(window.console.error).not.to.have.been.called;
    });

    describe('test with expected console.error', () => {
      it('fails if Code.org browser version is wrong', async () => {
        SetupChecker.prototype.detectSupportedBrowser.restore();
        sinon
          .stub(SetupChecker.prototype, 'detectSupportedBrowser')
          .callsFake(() => Promise.reject(error));
        const wrapper = mount(
          <Provider store={getStore()}>
            <SetupChecklist stepDelay={STEP_DELAY_MS} />
          </Provider>
        );
        expect(wrapper.find(WAITING_ICON)).to.have.length(1);
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(0);
        expect(window.console.error).to.have.been.calledWith(error);
      });

      it('reloads the page on re-detect if browser check fails', async () => {
        SetupChecker.prototype.detectSupportedBrowser.restore();
        sinon
          .stub(SetupChecker.prototype, 'detectSupportedBrowser')
          .callsFake(() => Promise.reject(error));
        const wrapper = mount(
          <Provider store={getStore()}>
            <SetupChecklist stepDelay={STEP_DELAY_MS} />
          </Provider>
        );
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(0);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(0);
        wrapper.find(REDETECT_BUTTON).simulate('click');
        expect(utils.reload).to.have.been.called;
      });
    });

    it('does not reload the page on re-detect if successful', async () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <SetupChecklist stepDelay={STEP_DELAY_MS} />
        </Provider>
      );
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      wrapper.find(REDETECT_BUTTON).simulate('click');
      expect(wrapper.find(WAITING_ICON)).to.have.length(1);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(utils.reload).not.to.have.been.called;
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
