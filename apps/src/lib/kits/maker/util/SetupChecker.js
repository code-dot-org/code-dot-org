/** @file Stubbable core setup check behavior for the setup page. */
import CircuitPlaygroundBoard from '../CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '../portScanning';
import {isCodeOrgBrowser, isChrome, gtChrome33, isChromeOS} from './browserChecks';
import i18n from '@cdo/applab/locale';

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
        reject(new Error(i18n.maker_error_unsupportedBrowser()));
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
