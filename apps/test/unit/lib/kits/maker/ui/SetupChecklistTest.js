/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import * as utils from '@cdo/apps/utils';
import * as browserChecks from '@cdo/apps/lib/kits/maker/util/browserChecks';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

describe('SetupChecklist', () => {
  let checker;

  // Speed up the tests by reducing the artificial delay between steps
  const STEP_DELAY_MS = 1;

  // Helpful selectors
  const REDETECT_BUTTON = 'input[value="re-detect"]';
  const WAITING_ICON = '.fa-clock-o';
  const SUCCESS_ICON = '.fa-check-circle';
  const FAILURE_ICON = '.fa-times-circle';

  beforeEach(() => {
    sinon.stub(utils, 'reload');
    sinon.stub(window.console, 'error');
    checker = new StubSetupChecker();
  });

  afterEach(() => {
    window.console.error.restore();
    utils.reload.restore();
  });

  describe('on Chrome OS', () => {
    before(() => sinon.stub(browserChecks, 'isChromeOS').returns(true));
    before(() => sinon.stub(browserChecks, 'isCodeOrgBrowser').returns(false));
    after(() => browserChecks.isCodeOrgBrowser.restore());
    after(() => browserChecks.isChromeOS.restore());

    it('renders success', async () => {
      const wrapper = mount(
        <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
      );
      expect(wrapper.find(REDETECT_BUTTON)).to.be.disabled;
      expect(wrapper.find(WAITING_ICON)).to.have.length(4);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(REDETECT_BUTTON)).not.to.be.disabled;
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(window.console.error).not.to.have.been.called;
    });

    describe('test with expected console.error', () => {
      it('reloads the page on re-detect if plugin not installed', async () => {
        checker.detectChromeAppInstalled.rejects(new Error('not installed'));
        const wrapper = mount(
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        );
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(0);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(3);
        wrapper.find(REDETECT_BUTTON).simulate('click');
        expect(utils.reload).to.have.been.called;
      });
    });

    it('does not reload the page on re-detect if successful', async () => {
      const wrapper = mount(
        <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
      );
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      wrapper.find(REDETECT_BUTTON).simulate('click');
      expect(wrapper.find(WAITING_ICON)).to.have.length(4);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(utils.reload).not.to.have.been.called;
    });
  });

  describe('on Code.org Browser', () => {
    before(() => sinon.stub(browserChecks, 'isChrome').returns(false));
    before(() => sinon.stub(browserChecks, 'isCodeOrgBrowser').returns(true));
    after(() => browserChecks.isCodeOrgBrowser.restore());
    after(() => browserChecks.isChrome.restore());

    it('renders success', async () => {
      const wrapper = mount(
        <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
      );
      expect(wrapper.find(REDETECT_BUTTON)).to.be.disabled;
      expect(wrapper.find(WAITING_ICON)).to.have.length(4);
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(REDETECT_BUTTON)).not.to.be.disabled;
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      expect(window.console.error).not.to.have.been.called;
    });

    describe('test with expected console.error', () => {
      it('fails if Code.org browser version is wrong', async () => {
        const error = new Error('test error');
        checker.detectSupportedBrowser.rejects(error);
        const wrapper = mount(
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        );
        expect(wrapper.find(WAITING_ICON)).to.have.length(4);
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(3);
        expect(window.console.error).to.have.been.calledWith(error);
      });

      it('reloads the page on re-detect if browser check fails', async () => {
        checker.detectSupportedBrowser.rejects(new Error('test error'));
        const wrapper = mount(
          <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
        );
        await yieldUntilDoneDetecting(wrapper);
        expect(wrapper.find(SUCCESS_ICON)).to.have.length(0);
        expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
        expect(wrapper.find(WAITING_ICON)).to.have.length(3);
        wrapper.find(REDETECT_BUTTON).simulate('click');
        expect(utils.reload).to.have.been.called;
      });
    });

    it('does not reload the page on re-detect if successful', async () => {
      const wrapper = mount(
        <SetupChecklist setupChecker={checker} stepDelay={STEP_DELAY_MS} />
      );
      await yieldUntilDoneDetecting(wrapper);
      expect(wrapper.find(SUCCESS_ICON)).to.have.length(4);
      wrapper.find(REDETECT_BUTTON).simulate('click');
      expect(wrapper.find(WAITING_ICON)).to.have.length(4);
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
function yieldUntil(wrapper, predicate, timeoutMs = 2000, intervalMs = 5) {
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

/**
 * SetupChecker with all methods stubbed and by default everything succeeds.
 * Since methods are sinon stubs, individual tests can modify stub behavior
 * as needed.
 * @see http://sinonjs.org/releases/v2.1.0/stubs/#defining-stub-behavior-on-consecutive-calls
 */
class StubSetupChecker extends SetupChecker {
  constructor() {
    super();
    sinon.stub(this, 'detectSupportedBrowser').resolves();
    sinon.stub(this, 'detectChromeAppInstalled').resolves();
    sinon.stub(this, 'detectBoardPluggedIn').resolves();
    sinon.stub(this, 'detectCorrectFirmware').resolves();
    sinon.stub(this, 'detectBoardType').resolves();
    sinon.stub(this, 'detectComponentsInitialize').resolves();
    sinon.stub(this, 'celebrate').resolves();
    sinon.stub(this, 'teardown');
  }
}
