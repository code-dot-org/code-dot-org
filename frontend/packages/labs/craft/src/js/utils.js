module.exports = {};

/**
 * Creates a new event in a cross-browswer-compatible way.
 *
 * createEvent functionality is officially deprecated in favor of
 * the Event constructor, but some older browsers do not yet support
 * event constructors. Attempt to use the new functionality, fall
 * back to the old if it fails.
 *
 * @param {String} type
 * @param {boolean} [bubbles=false]
 * @param {boolean} [cancelable=false]
 */
module.exports.createEvent = function createEvent(type, bubbles = false, cancelable = false) {
  var customEvent;
  try {
    customEvent = new Event(type, { bubbles, cancelable });
  } catch (e) {
    customEvent = document.createEvent('Event');
    customEvent.initEvent(type, bubbles, cancelable);
  }
  return customEvent;
};

module.exports.bisect = function bisect(array, conditional) {
  const positive = array.filter(x => conditional(x));
  const negative = array.filter(x => !conditional(x));
  return [positive, negative];
};
