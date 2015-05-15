var original = null;
var listeners = [];

/**
 * Wraps window.addEventListener to catch all added listeners, allowing us to
 * dispose of them when our test finishes
 */
module.exports = {
  /**
   * Attach our wrapper, tracking all added listeners
   */
  attach: function () {
    if (original) {
      throw new Error('addEventListener already wrapped');
    }

    original = window.addEventListener;

    window.addEventListener = function () {
      listeners.push(arguments);
      original.apply(window, arguments);
    };
  },

  /**
   * Detach our wrapper, removing all added listeners
   */
  detach: function () {
    window.addEventListener = original;
    original = null;
    listeners.forEach(function (argList) {
      window.removeEventListener.apply(window, argList);
    });
    listeners = [];
  }
};
