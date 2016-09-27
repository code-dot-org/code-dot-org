/* global Applab */

import Firebase from 'firebase';
let firebaseCache;
let firebaseConfig;

/**
 * Returns a promise which resolves once Firebase channel config has been fetched from
 * the server and cached locally. Also starts listening for future changes to config.
 * The data has the following structure:
 * {number} config.maxTableRows Maximum number of records allowed per table.
 * {number} config.maxPropertySize Maximum size of a key-value pair value in bytes.
 * {number} config.maxRecordSize Maximum size of a table record in bytes.
 * {Object.<string, number>} config.limits Map from rate limit interval to the maximum
 *     number of requests allowed during that interval.
 * @returns {Promise<Object>} Promise containing the channel config.
 */
export function loadConfig() {
  if (firebaseConfig) {
    // The firebase config has already been loaded.
    return Promise.resolve(firebaseConfig);
  }

  const configRef = getConfigRef();
  return configRef.once('value').then(snapshot => {
    handleLoadConfig(snapshot.val());

    // Make sure we don't listen multiple times.
    configRef.off();

    // Update globals to reflect firebase config any time it changes in the future.
    configRef.on('value', snapshot => handleLoadConfig(snapshot.val()));

    return Promise.resolve(firebaseConfig);
  });
}

function handleLoadConfig(configData) {
  if (!validateConfig(configData)) {
    throw new Error('invalid firebase config: ' + JSON.stringify(configData));
  }
  firebaseConfig = configData;
}

/**
 * Make sure the config data has the correct shape.
 * @param configData
 * @returns {boolean}
 */
function validateConfig(configData) {
  return (
    configData &&
    configData.maxTableCount > 0 &&
    configData.maxTableRows > 0 &&
    configData.maxRecordSize > 0 &&
    configData.maxPropertySize > 0 &&
    configData.limits &&
    Object.keys(configData.limits).length > 0);
}

export function getConfigRef() {
  return getFirebase().child('v3/config/channels');
}

export function getDatabase(channelId) {
  channelId = channelId + Applab.firebaseChannelIdSuffix;
  return getFirebase().child(`v3/channels/${channelId}`);
}

function getFirebase() {
  let fb = firebaseCache;
  if (!fb) {
    if (!Applab.firebaseName) {
      throw new Error("Error connecting to Firebase: Firebase name not specified");
    }
    if (!Applab.firebaseAuthToken) {
      let msg = "Error connecting to Firebase: Firebase auth token not specified. ";
      if (Applab.firebaseName === 'cdo-v3-dev') {
        msg += 'To use Applab data blocks or data browser in development, you must set' +
          'set "firebase_secret" in locals.yml to the value at ' +
          'https://manage.chef.io/organizations/code-dot-org/environments/development/attributes ' +
          '-> cdo-secrets';
      }
      throw new Error(msg);
    }
    let base_url = `https://${Applab.firebaseName}.firebaseio.com`;
    fb = new Firebase(base_url);
    if (Applab.firebaseAuthToken) {
      fb.authWithCustomToken(Applab.firebaseAuthToken, (err, user) => {
        if (err) {
          throw new Error(`error authenticating to Firebase: ${err}`);
        }
      });
    }
    firebaseCache = fb;
  }
  return fb;
}

const ILLEGAL_CHARACTERS = '.$#[]/';

/**
 * Firebase keys must be UTF-8 encoded, can be a maximum of 768 bytes, and cannot contain
 * ., $, #, [, ], /, or ASCII control characters 0-31 or 127.
 * @param {string} key
 * @throws with a helpful message if the key is invalid.
 */
export function validateFirebaseKey(key) {
  if (key.length === 0) {
    throw new Error('The name must not be empty.');
  }
  if (key.length > 768) {
    throw new Error(`The name "${key}" is too long.`);
  }
  for (let i = 0; i < key.length; i++) {
    if (ILLEGAL_CHARACTERS.includes(key.charAt(i))) {
      throw new Error(`The name "${key}" contains an illegal character "${key.charAt(i)}".` +
      ' The characters ".", "$", "#", "[", "]", and "/" are not allowed.');
    }
    if (key.charCodeAt(i) < 32 || key.charCodeAt(i) === 127) {
      throw new Error(`The name ${key} contains an illegal character code ${key.charCodeAt(i)}`);
    }
  }
}
