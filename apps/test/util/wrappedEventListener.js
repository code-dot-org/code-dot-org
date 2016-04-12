function isNativeCode(func) {
  return func && func.toString().indexOf('[native code]') > -1;
}

/**
 * Wraps window.addEventListener to catch all added listeners, allowing us to
 * dispose of them when our test finishes
 */
module.exports = {
  /**
   * Attach our wrapper, tracking all added listeners
   */
  attach: function () {
    if (!isNativeCode(window.addEventListener)) {
      throw new Error('addEventListener already wrapped');
    }
    if (window.originalAddEventListener) {
      throw new Error('originalAddEventListener already exists');
    }
    if (window.wrappedListeners) {
      throw new Error('wrappedListeners already exists');
    }

    window.originalAddEventListener = window.addEventListener;
    window.wrappedListeners = [];

    window.addEventListener = function () {
      window.wrappedListeners.push(arguments);
      window.originalAddEventListener.apply(window, arguments);
    };
  },

  /**
   * Detach our wrapper, removing all added listeners
   */
  detach: function () {
    if (!isNativeCode(window.originalAddEventListener)) {
      throw new Error('originalAddEventListener is not a native function');
    }
    window.addEventListener = window.originalAddEventListener;
    window.originalAddEventListener = null;
    window.wrappedListeners.forEach(function (argList) {
      window.removeEventListener.apply(window, argList);
    });
    window.wrappedListeners = null;
  }
};
