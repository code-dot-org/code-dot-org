var list = [];

/**
 * call setTimeout and track the returned id
 */
exports.setTimeout = function (fn, time) {
  list.push(window.setTimeout.apply(window, arguments));
};

/**
 * Clears all timeouts in our list and resets the list
 */
exports.clearTimeouts = function () {
  list.forEach(window.clearTimeout, window);
  list = [];
};
