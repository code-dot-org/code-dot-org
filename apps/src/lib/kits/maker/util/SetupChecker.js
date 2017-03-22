/** @file Stubbable core setup check behavior for the setup page. */

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
}

// TODO deduplicate these helpers into yet another util file
function gtChrome33() {
  return getChromeVersion() >= 33;
}

function isChrome() {
  return !!window.chrome;
}

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}
