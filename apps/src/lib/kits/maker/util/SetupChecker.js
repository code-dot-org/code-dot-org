/** @file Stubbable core setup check behavior for the setup page. */
import CircuitPlaygroundBoard from '../boards/circuitPlayground/CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '../portScanning';
import {
  isCodeOrgBrowser,
  isChrome,
  gtChrome33,
  isChromeOS
} from './browserChecks';
import {BOARD_TYPE, detectBoardTypeFromPort} from './boardUtils';
import MicroBitBoard from '../boards/microBit/MicroBitBoard';

export default class SetupChecker {
  port = null;
  boardController = null;

  /**
   * Resolve if using Chrome > 33 or Code.org Browser
   * @return {Promise}
   */
  detectSupportedBrowser() {
    return new Promise((resolve, reject) => {
      if (isCodeOrgBrowser()) {
        // TODO: Check browser version
        resolve();
      } else if (isChromeOS()) {
        resolve();
      } else if (isChrome() && gtChrome33()) {
        // Legacy support for Chrome App on Desktop
        resolve();
      } else {
        reject(new Error('Not using a supported browser.'));
      }
    });
  }

  /**
   * Resolve if the Chrome Connector App is installed.
   * @return {Promise}
   */
  detectChromeAppInstalled() {
    return ensureAppInstalled();
  }

  /**
   * @return {Promise}
   */
  detectBoardPluggedIn() {
    return findPortWithViableDevice().then(port => (this.port = port));
  }

  /**
   * @return {Promise}
   */
  detectCorrectFirmware(boardType) {
    if (boardType === BOARD_TYPE.MICROBIT) {
      this.boardController = new MicroBitBoard(this.port);
      return this.boardController.checkExpectedFirmware();
    } else {
      this.boardController = new CircuitPlaygroundBoard(this.port);
      return this.boardController.connectToFirmware();
    }
  }

  /**
   * Return the type of board connected to port.
   * @return {string}
   */
  detectBoardType() {
    return detectBoardTypeFromPort(this.port);
  }

  /**
   * @return {Promise}
   */
  detectComponentsInitialize() {
    return this.boardController.initializeComponents();
  }

  /**
   * @return {Promise}
   */
  celebrate() {
    return this.boardController.celebrateSuccessfulConnection();
  }

  teardown() {
    const releaseRefs = () => {
      this.boardController = null;
      this.port = null;
    };

    if (this.boardController) {
      this.boardController.destroy().then(releaseRefs);
    } else {
      releaseRefs();
    }
  }
}
