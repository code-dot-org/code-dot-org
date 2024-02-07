/**
 * A KeyHandler class that can listen for events with multiple keys pressed.
 */
class KeyHandler {
  constructor(element) {
    this.pressedKeyMap = {};
    this.keyHandlers = [];

    element.addEventListener('keydown', e => this.onKeyDown_(e.key));
    element.addEventListener('keyup', e => this.onKeyUp_(e.key));
  }

  /**
   * Register an event to be called when a set of keys are pressed.
   *
   * @param {String[]} keys the set of keys that trigger this event.
   * @param {Function} callback function to call when the keys are pressed.
   */
  registerEvent(keys, callback) {
    this.keyHandlers.push([keys, callback]);
  }

  onKeyDown_(key) {
    // Ignore keys that we don't have mappings for
    const keysToCheck = this.keyHandlers.map(([keys]) => keys).flat();
    if (!keysToCheck.includes(key)) {
      return;
    }

    this.pressedKeyMap[key] = true;
    const pressedKeys = Object.keys(this.pressedKeyMap);
    this.keyHandlers.forEach(([keys, callback]) => {
      if (
        keys.every(key => pressedKeys.includes(key)) &&
        keys.length === pressedKeys.length
      ) {
        callback();
      }
    });
  }

  onKeyUp_(key) {
    delete this.pressedKeyMap[key];
  }
}

export default KeyHandler;
