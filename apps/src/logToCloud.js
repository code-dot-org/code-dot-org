var PageAction = {
  DropletTransitionError: 'DropletTransitionError',
  SanitizedLevelHtml: 'SanitizedLevelHtml',
  UserJavaScriptError: 'UserJavaScriptError',
  RunButtonClick: 'RunButtonClick'
};

var MAX_FIELD_LENGTH = 4095;

/**
 * Shims window.newrelic, which is only included in production. This causes us
 * to no-op in other environments.
 */
module.exports = {
  PageAction: PageAction,

  /**
   * @param {string} actionName - Must be one of the keys from PageAction
   * @param {object} value - Object literal representing columns we want to
   *   add for this action
   * @param {number} [sampleRate] - Optional sample rate. Default is 1.0
   */
  addPageAction: function (actionName, value, sampleRate) {
    if (sampleRate === undefined) {
      sampleRate = 1.0;
    }

    if (!window.newrelic) {
      return;
    }

    if (!PageAction[actionName]) {
      console.log('Unknown actionName: ' + actionName);
      return;
    }

    if (typeof(value) !== "object") {
      console.log('Expected value to be an object');
      return;
    }

    if (Math.random() > sampleRate) {
      // Ignore this instance
      return;
    }

    for (var prop in value) {
      if (typeof value[prop] === 'string') {
        value[prop] = value[prop].substring(0, MAX_FIELD_LENGTH);
      }
    }

    window.newrelic.addPageAction(actionName, value);
  },

  /**
   * Sets an attribute that will be included on any subsequent generated events
   */
  setCustomAttribute: function (key, value) {
    if (!window.newrelic) {
      return;
    }

    window.newrelic.setCustomAttribute(key, value);
  }
};
