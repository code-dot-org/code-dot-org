/** @file Test SetupChecklist component */
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/lib/kits/maker/microBitRedux';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import * as boardUtils from '@cdo/apps/lib/kits/maker/util/boardUtils';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import * as utils from '@cdo/apps/utils';



// Speed up the tests by reducing the artificial delay between steps
const STEP_DELAY_MS = 1;

describe('SetupChecklist', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'reload').mockClear().mockImplementation();
    jest.spyOn(window.console, 'error').mockClear().mockImplementation();
    jest.spyOn(SetupChecker.prototype, 'detectSupportedBrowser').mockClear()
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(SetupChecker.prototype, 'detectBoardPluggedIn').mockClear()
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(SetupChecker.prototype, 'detectCorrectFirmware').mockClear()
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(SetupChecker.prototype, 'detectBoardType').mockClear()
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(SetupChecker.prototype, 'detectComponentsInitialize').mockClear()
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(SetupChecker.prototype, 'celebrate').mockClear()
      .mockImplementation(() => Promise.resolve());
    stubRedux();
    registerReducers({microBit: microBitReducer});
    getStore().dispatch(setMicroBitFirmataUpdatePercent(0));
  });

  afterEach(() => {
    window.console.error.mockRestore();
    utils.reload.mockRestore();
    SetupChecker.prototype.detectSupportedBrowser.mockRestore();
    SetupChecker.prototype.detectBoardPluggedIn.mockRestore();
    SetupChecker.prototype.detectCorrectFirmware.mockRestore();
    SetupChecker.prototype.detectBoardType.mockRestore();
    SetupChecker.prototype.detectComponentsInitialize.mockRestore();
    SetupChecker.prototype.celebrate.mockRestore();
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
    beforeAll(() => {
      jest.spyOn(boardUtils, 'shouldUseWebSerial').mockClear().mockReturnValue(true);
    });

    afterAll(() => {
      boardUtils.shouldUseWebSerial.mockRestore();
    });

    it('renders success', async () => {
      const {rerender} = renderDefault();
      expect(screen.getByRole('button', {name: 're-detect'})).to.be.disabled;
      expect(screen.getByTitle('waiting')).toBeDefined();
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).toHaveLength(4);
      expect(window.console.error).not.toHaveBeenCalled();
    });

    it('sends analytic event when a board is connected on /maker/setup page', async () => {
      const {rerender} = renderDefault();
      const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear().mockImplementation();
      await yieldUntilDoneDetecting(screen, rerender);
      expect(sendEventSpy).toHaveBeenCalledTimes(1);
      expect(sendEventSpy).toHaveBeenCalledWith('Board Type On Maker Setup Page');
      analyticsReporter.sendEvent.mockRestore();
    });

    it('does reload the page on re-detect', async () => {
      const {rerender} = renderDefault();
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).toHaveLength(4);
      const redetectButton = screen.getByRole('button', {name: 're-detect'});
      fireEvent.click(redetectButton);
      await yieldUntilDoneDetecting(screen, rerender);
      expect(screen.getAllByTitle('success')).toHaveLength(4);
      expect(utils.reload).toHaveBeenCalled();
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
