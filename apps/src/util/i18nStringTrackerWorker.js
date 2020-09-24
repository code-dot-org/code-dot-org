import 'whatwg-fetch';

/**
 * Gets the singleton instance of an I18nStringTrackerWorker
 * @returns {I18nStringTrackerWorker}
 */
export function getI18nStringTrackerWorker() {
  return new I18nStringTrackerWorker();
}

/**
 * A singleton class which buffers i18n string usage data and sends it in batches to the '/i18n/track_string_usage' API.
 */
class I18nStringTrackerWorker {
  constructor() {
    // Check if there is already a singleton instance.
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    // Set the singleton instance to this instance if it doesn't exist already.
    this.constructor.instance = this;

    /**
     * A buffer of records to be sent in batches. Each key is the `source` file of the string and the values are the
     * i18n `stringKey`s used to lookup the translated string.
     * @typedef {Object.<string, Set>} I18nRecords
     * Example:
     * {
     *   'common_locale': [ 'curriculum', 'teacherForum', 'professionalLearning', ...],
     *   'fish_locale': ...
     * }
     */
    this.buffer = {};
  }

  /**
   * Buffers the given i18n string usage data to be sent later.
   * @param {string} stringKey The key used to look up the i18n string value e.g. 'curriculum'
   * @param {string} source Context about the file i18n value was looked up in e.g. 'common_locale'
   */
  log(stringKey, source) {
    if (!stringKey || !source) {
      return;
    }

    this.buffer[source] = this.buffer[source] || new Set();
    this.buffer[source].add(stringKey);

    // schedule a buffer flush if there isn't already one.
    if (!this.pendingFlush) {
      this.pendingFlush = setTimeout(() => this.flush(), 3000);
    }
  }

  // Sends all the buffered records
  flush() {
    // Do nothing if there are no records to record.
    if (Object.keys(this.buffer).length === 0) {
      return;
    }

    // Grab the contents of the current buffer and clear the buffer.
    const records = this.buffer;
    this.buffer = {};
    this.pendingFlush = null;

    // Record the i18n string usage data.
    sendRecords(records);
  }
}

// The max number of records which can be sent at once to the '/i18n/track_string_usage' API
const RECORD_LIMIT = 500;

/**
 * Asynchronously send the given records to the `/i18n/track_string_usage` API
 * @param {I18nRecords} records The records of i18n string usage information to be sent.
 */
function sendRecords(records) {
  const url = window.location.origin + window.location.pathname; //strip the query string from the URL
  Object.keys(records).forEach(source => {
    const stringKeys = Array.from(records[source]);
    // Break the keys up into smaller batches because the API has a maximum limit.
    for (let i = 0; i < stringKeys.length; i += RECORD_LIMIT) {
      const stringKeyBatch = stringKeys.slice(i, RECORD_LIMIT);
      fetch('/i18n/track_string_usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          source: source,
          string_keys: stringKeyBatch
        })
      });
    }
  });
}
