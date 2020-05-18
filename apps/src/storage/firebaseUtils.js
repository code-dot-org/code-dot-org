import Firebase from 'firebase';
const SHARED_ENV = 'cdo-v3-shared';
let config;
let projectFirebaseCache;
let sharedFirebaseCache;
let firebaseConfig;

export function init(setupConfig) {
  config = setupConfig;

  if (typeof config.showRateLimitAlert !== 'function') {
    throw 'No `showRateLimitAlert` set for Firebase';
  }
}

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
    Object.keys(configData.limits).length > 0
  );
}

export function resetConfigForTesting() {
  getConfigRef().off();
  getConfigRef().set(null);
}

export function getConfigRef() {
  return getFirebase(config.firebaseName).child('v3/config/channels');
}

export function getRecordsRef(tableName) {
  return getProjectDatabase().child(`storage/tables/${tableName}/records`);
}

export function getProjectCountersRef(tableName) {
  return getProjectDatabase().child(`counters/tables/${tableName}`);
}

export function getSharedDatabase() {
  return getFirebase(SHARED_ENV).child('v3/channels/shared');
}

export function getProjectDatabase() {
  const path = `v3/channels/${config.channelId}${
    config.firebaseChannelIdSuffix
  }`;
  return getFirebase(config.firebaseName).child(path);
}

function getFirebase(environment) {
  let fb =
    environment === SHARED_ENV ? sharedFirebaseCache : projectFirebaseCache;
  if (!fb) {
    if (!environment) {
      throw new Error(
        'Error connecting to Firebase: Firebase name not specified'
      );
    }
    const authToken =
      environment === SHARED_ENV
        ? config.firebaseSharedAuthToken
        : config.firebaseAuthToken;
    if (!authToken) {
      throw new Error(
        'Error connecting to Firebase: CDO.firebase_shared_secret and/or CDO.firebase_secret not specified'
      );
    }
    let base_url = `https://${environment}.firebaseio.com`;
    fb = new Firebase(base_url);
    if (authToken) {
      fb.authWithCustomToken(authToken, (err, user) => {
        if (err) {
          throw new Error(`error authenticating to Firebase: ${err}`);
        }
      });
    }
    if (environment === SHARED_ENV) {
      sharedFirebaseCache = fb;
    } else {
      projectFirebaseCache = fb;
    }
  }
  return fb;
}

export function isInitialized() {
  return !!projectFirebaseCache;
}

// The following characters are illegal in firebase paths: .#$[]/
const ILLEGAL_CHARACTERS_REGEX = /[\.\$#\[\]\/]/g;

/**
 * Replaces illegal characters in the firebase key with dashes.
 * @param {string} key
 * @returns {string} Updated firebase key
 */
export function fixFirebaseKey(key) {
  return key.replace(ILLEGAL_CHARACTERS_REGEX, '-');
}

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
    if (ILLEGAL_CHARACTERS_REGEX.test(key.charAt(i))) {
      throw new Error(
        `The name "${key}" contains an illegal character "${key.charAt(i)}".` +
          ' The characters ".", "$", "#", "[", "]", and "/" are not allowed.'
      );
    }
    if (key.charCodeAt(i) < 32 || key.charCodeAt(i) === 127) {
      throw new Error(
        `The name ${key} contains an illegal character code ${key.charCodeAt(
          i
        )}`
      );
    }
  }
}

export function showRateLimitAlert() {
  config.showRateLimitAlert();
}
