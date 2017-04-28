/** @file Stubbable core setup check behavior for the setup page. */
import CircuitPlaygroundBoard from '../CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '../portScanning';
import {isChrome, gtChrome33} from './browserChecks';

export default class SetupChecker {
  port = null;
  boardController = null;

  /**
   * Resolve if using Chrome > 33
   * @return {Promise}
   */
  detectChromeVersion() {
    return new Promise((resolve, reject) => {
      if (!isChrome()) {
        reject(new Error('Not using Chrome'));
      } if (!gtChrome33()) {
        reject(new Error('Not using Chrome > v33'));
      } else {
        resolve();
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
    return findPortWithViableDevice()
        .then(port => this.port = port);
  }

  /**
   * @return {Promise}
   */
  detectCorrectFirmware() {
    this.boardController = new CircuitPlaygroundBoard(this.port);
    return this.boardController.connectToFirmware();
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
    if (this.boardController) {
      this.boardController.destroy();
    }
    this.boardController = null;
    this.port = null;
  }
}
