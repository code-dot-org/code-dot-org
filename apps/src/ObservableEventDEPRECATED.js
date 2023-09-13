/**
 * A subscription/notification atom, used to cleanly hook up callbacks
 * without attaching anything to the DOM or other global scope.
 * @constructor
 * @deprecated Use EventEmitter instead, which you can import from the events module.
 *             See https://nodejs.org/api/events.html
 */
function ObservableEventDEPRECATED() {
  /**
   * Objects observing this.
   * @type {Array}
   * @private
   */
  this.observerList_ = [];
}

/**
 * Subscribe a method to be called when notifyObservers is called.
 * @param {function} onNotify - method called when notifyObservers gets called.
 *        Will receive any arguments passed to notifyObservers.
 * @returns {Object} key - used to unregister from observable
 */
ObservableEventDEPRECATED.prototype.register = function (onNotify) {
  var key = {toCall: onNotify};
  Object.freeze(key);
  this.observerList_.push(key);
  return key;
};

/**
 * Unsubscribe from notifications.
 * @param {Object} keyObj - Key generated when registering
 * @returns {boolean} - Whether an unregistration actually occurred
 */
ObservableEventDEPRECATED.prototype.unregister = function (keyObj) {
  for (var i = 0; i < this.observerList_.length; i++) {
    if (keyObj === this.observerList_[i]) {
      this.observerList_.splice(i, 1);
      return true;
    }
  }
  return false;
};

/**
 * Call all methods subscribed to this ObservableEventDEPRECATED, passing through
 * any arguments.
 * @param {...} Any arguments, which are passed through to the observing
 *              functions.
 */
ObservableEventDEPRECATED.prototype.notifyObservers = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.observerList_.forEach(function (observer) {
    observer.toCall.apply(undefined, args);
  });
};

export {ObservableEventDEPRECATED as default};
