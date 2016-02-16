var PageAction = {
  DropletTransitionError: 'DropletTransitionError',
  SanitizedLevelHtml: 'SanitizedLevelHtml',
  UserJavaScriptError: 'UserJavaScriptError'
};

var MAX_FIELD_LENGTH = 4095;

/**
 * Shims window.newrelic, which is only included in production. This causes us
 * to no-op in other environments.
 */
module.exports = {
  PageAction: PageAction,

  addPageAction: function (actionName, value) {
    if (!window.newrelic) {
      return;
    }

    if (!PageAction[actionName]) {
      console.log('Unknown actionName: ' + actionName);
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
