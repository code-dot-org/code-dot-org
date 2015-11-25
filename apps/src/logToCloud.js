var PageAction = {
  DropletTransitionError: 'DropletTransitionError'
};

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
