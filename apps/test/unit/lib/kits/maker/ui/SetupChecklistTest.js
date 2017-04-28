/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
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
    sinon.stub(window.console, 'error');
    sinon.stub(window.location, 'reload');
    checker = new StubSetupChecker();
  });

  afterEach(() => {
    window.location.reload.restore();
    window.console.error.restore();
  });

  it('renders success', () => {
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY_MS}
      />
    );
    expect(wrapper.find(REDETECT_BUTTON)).to.be.disabled;
    expect(wrapper.find(WAITING_ICON)).to.have.length(5);
    return yieldUntilDoneDetecting(wrapper)
        .then(() => {
          expect(wrapper.find(REDETECT_BUTTON)).not.to.be.disabled;
          expect(wrapper.find(SUCCESS_ICON)).to.have.length(5);
          expect(window.console.error).not.to.have.been.called;
        });
  });

  it('fails if chrome version is wrong', () => {
    const error = new Error('test error');
    checker.detectChromeVersion.rejects(error);
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY_MS}
      />
    );
    expect(wrapper.find(WAITING_ICON)).to.have.length(5);
    return yieldUntilDoneDetecting(wrapper)
        .then(() => {
          expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
          expect(wrapper.find(WAITING_ICON)).to.have.length(4);
          expect(wrapper.text()).to.include('Your current browser is not supported at this time.');
          expect(window.console.error).to.have.been.calledWith(error);
        });
  });

  it('does not reload the page on re-detect if successful', () => {
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY_MS}
      />
    );
    return yieldUntilDoneDetecting(wrapper)
        .then(() => {
          expect(wrapper.find(SUCCESS_ICON)).to.have.length(5);
          wrapper.find(REDETECT_BUTTON).simulate('click');
          expect(wrapper.find(WAITING_ICON)).to.have.length(5);
        })
        .then(() => yieldUntilDoneDetecting(wrapper))
        .then(() => {
          expect(wrapper.find(SUCCESS_ICON)).to.have.length(5);
          expect(window.location.reload).not.to.have.been.called;
        });
  });

  it('reloads the page on re-detect if plugin not installed', () => {
    checker.detectChromeAppInstalled.rejects(new Error('not installed'));
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY_MS}
      />
    );
    return yieldUntilDoneDetecting(wrapper)
        .then(() => {
          expect(wrapper.find(SUCCESS_ICON)).to.have.length(1);
          expect(wrapper.find(FAILURE_ICON)).to.have.length(1);
          expect(wrapper.find(WAITING_ICON)).to.have.length(3);
          wrapper.find(REDETECT_BUTTON).simulate('click');
          expect(window.location.reload).to.have.been.called;
        });
  });

  function yieldUntilDoneDetecting(wrapper) {
    return yieldUntil(() => !wrapper.find(REDETECT_BUTTON).prop('disabled'));
  }
});

/**
 * Returns a promise that resolves when a condition becomes true, or rejects
 * when a timeout is reached.
 * @param {function():boolean} predicate
 * @param {number} timeoutMs - maximum time to wait
 * @param {number} intervalMs - time to wait between steps
 * @return {Promise}
 */
function yieldUntil(predicate, timeoutMs = 2000, intervalMs = 5) {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;
    const key = setInterval(() => {
      if (predicate()) {
        clearInterval(key);
        resolve();
      } else {
        elapsedTime += intervalMs;
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
    sinon.stub(this, 'detectChromeVersion').resolves();
    sinon.stub(this, 'detectChromeAppInstalled').resolves();
    sinon.stub(this, 'detectBoardPluggedIn').resolves();
    sinon.stub(this, 'detectCorrectFirmware').resolves();
    sinon.stub(this, 'detectComponentsInitialize').resolves();
    sinon.stub(this, 'celebrate').resolves();
    sinon.stub(this, 'teardown');
  }
}
