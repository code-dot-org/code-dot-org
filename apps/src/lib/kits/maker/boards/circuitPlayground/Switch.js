/** @file
 * Wrapper for johnny-five Switch that changes which events it surfaces
 * to the rest of the system and how often they are fired.
 */
import _ from 'lodash';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import five from '@code-dot-org/johnny-five';

/** @const {number} Pin for the toggle switch on a Circuit Playground. */
const SWITCH_PIN = 21;

// Properties that should pass through to the inner controller.
export const READ_ONLY_PROPERTIES = [
  'isOpen',
  'isClosed',
  'board',
  'pin',
  'value'
];
export const READ_WRITE_PROPERTIES = ['closeValue', 'invert', 'openValue'];

/**
 * 'Transparent' wrapper around a johnny-five Switch controller
 * that only emits open and close events when it knows the state has changed,
 * and also adds a 'change' event that fires in either case.
 * @param {five.Board} board - the johnny-five board object
 * @param {number} pin
 */
export default class Switch extends EventEmitter {
  constructor(board, pin = SWITCH_PIN) {
    super();

    /**
     * Private johnny-five switch controller, that we provide a 'transparent'
     * interface to.
     * @type {five.Switch}
     */
    const fiveSwitch = Switch._constructFiveSwitchController(board, pin);

    /**
     * The johnny-five Switch controller will fire 'open' or 'closed' events
     * any time a digital read event that includes switch state information is
     * fired, even if the state didn't change.
     * We cache the last known state of the switch so we only emit events when
     * the switch state changes.
     */
    let lastKnownState = undefined;

    // Define read-only properties that pass through to the five.Switch controller
    const readOnlyProperties = _(READ_ONLY_PROPERTIES)
      .map(name => [
        name,
        {
          get: () => fiveSwitch[name]
        }
      ])
      .fromPairs()
      .value();

    // Define read-write properties that pass through to the five.Switch controller
    const readWriteProperties = _(READ_WRITE_PROPERTIES)
      .map(name => [
        name,
        {
          get: () => fiveSwitch[name],
          set: x => (fiveSwitch[name] = x)
        }
      ])
      .fromPairs()
      .value();

    Object.defineProperties(this, {
      ...readOnlyProperties,
      ...readWriteProperties
    });

    // Listen to 'open' and 'close' events on the wrapped five.Switch controller.
    // Emit our own events only when we detect a state change.
    fiveSwitch.on('open', () => {
      if (lastKnownState === fiveSwitch.closeValue) {
        this.emit('open');
        this.emit('change', fiveSwitch.openValue);
      }
      lastKnownState = fiveSwitch.openValue;
    });

    fiveSwitch.on('close', () => {
      if (lastKnownState === fiveSwitch.openValue) {
        this.emit('close');
        this.emit('change', fiveSwitch.closeValue);
      }
      lastKnownState = fiveSwitch.closeValue;
    });
  }

  // No stop() or disable() method - no reset is needed for
  // five.Switch.

  /**
   * Fired when the Switch was closed and is now open
   * @event Switch#open
   */

  /**
   * Fired when the Switch was open and is now closed
   * @event Switch#close
   */

  /**
   * Fired when the Switch state changes
   * @event Switch#change
   * @type {?} the current switch value
   */

  /**
   * Static helper called when constructing an internal Switch controller,
   * designed to be easily stubbed in unit tests.
   * @param {five.Board} board
   * @param {number} pin
   * @returns {five.Switch}
   * @private
   * @static
   */
  static _constructFiveSwitchController(board, pin) {
    return new five.Switch({board, pin});
  }
}
