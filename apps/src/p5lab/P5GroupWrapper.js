var jsInterpreter;

module.exports.injectJSInterpreter = function(jsi) {
  jsInterpreter = jsi;
};

module.exports.Group = function(baseConstructor) {
  var array = baseConstructor();

  /*
   * Create new helper called _groupCollideGameLab() which can be called as a
   * stateful nativeFunc by the interpreter. This enables the native method to
   * be called multiple times so that it can go asynchronous every time it
   * (or any native function that it calls, such as _collideWith) wants to execute
   * a callback back into interpreter code. The interpreter state object is
   * retrieved by calling JSInterpreter.getCurrentState().
   *
   * Additional properties can be set on the state object to track state
   * across the multiple executions. If the function wants to be called again,
   * it should set state.doneExec_ to false. When the function is complete and
   * no longer wants to be called in a loop by the interpreter, it should set
   * state.doneExec_ to true and return a value.
   *
   * Collide each member of group against the target using the given collision
   * type.  Return true if any collision occurred.
   * Internal use
   *
   * @private
   * @method _groupCollideGameLab
   * @param {!string} type one of 'overlap', 'collide', 'displace', 'bounce', or
   * 'bounceOff'
   * @param {Object} target Group or Sprite
   * @param {Function} [callback] on collision.
   * @return {boolean} True if any collision/overlap occurred
   */
  function _groupCollideGameLab(type, target, callback) {
    var state = jsInterpreter.getCurrentState();
    if (!state.__i) {
      state.__i = 0;
      state.__didCollide = false;
    }
    if (state.__i < this.size()) {
      if (!state.__subState) {
        // Before we call _collideWith (another stateful function), hang a __subState
        // off of state, so it can use that instead to track its state:
        state.__subState = {doneExec_: true};
      }
      var result_collideWith = this.get(state.__i)._collideWith(
        type,
        target,
        callback
      );
      if (state.__subState.doneExec_) {
        state.__didCollide = result_collideWith || state.__didCollide;
        delete state.__subState;
        state.__i++;
      }
      state.doneExec_ = false;
    } else {
      state.doneExec_ = true;
      return state.__didCollide;
    }
  }

  // Replace these four methods that take callback parameters to use the
  // replaced _groupCollideGameLab() function:

  array.overlap = _groupCollideGameLab.bind(array, 'overlap');
  array.collide = _groupCollideGameLab.bind(array, 'collide');
  array.displace = _groupCollideGameLab.bind(array, 'displace');
  array.bounce = _groupCollideGameLab.bind(array, 'bounce');
  array.bounceOff = _groupCollideGameLab.bind(array, 'bounceOff');
  array.isTouching = _groupCollideGameLab.bind(array, 'isTouching');

  return array;
};
