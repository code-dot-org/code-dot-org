/** @file Stubbable core setup check behavior for the setup page. */
import {ensureAppInstalled} from '../portScanning';
import {isChrome, gtChrome33} from './browserChecks';

export default class SetupChecker {
  /**
   * Resolve if using Chrome > 33
   * @returns {Promise}
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
   */
  detectChromeAppInstalled() {
    return ensureAppInstalled();
  }
}
