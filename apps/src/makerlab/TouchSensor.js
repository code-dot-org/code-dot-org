/** @file Wrapper for playground-io Touchpad to expose individual pads */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser

/**
 * Given a playground-io Touchpad controller, monitors touch events and forwards
 * 'down' and 'up' events for a particular pin.
 * @constructor
 * @param {number} pinIndex - Which pin to pay attention to and forward events for.
 * @param {Touchpad} touchpadsController - playground-io Touchpad controller.
 */
export default class TouchSensor extends EventEmitter {
  constructor(pinIndex, touchpadsController) {
    super();

    /**
     * @private {number} Which single pin this controller will monitor and
     *          forward events for.
     */
    this.pinIndex_ = pinIndex;

    /**
     * @private {Touchpad} controller that manages a set of capacitive touchpads
     *          as buttons with up/down events; each event it emits has a 'type'
     *          (string 'up', 'down' and some others) and a 'which' array of pin
     *          ids - TouchSensor in turn forwards events for a single pin.
     */
    this.touchpadsController_ = touchpadsController;
  }

  /**
   * Called whenever we begin running with this component.
   * TODO Verify this is true
   */
  start() {
    this.removeAllListeners();

    ['down', 'up'].forEach(eventName => {
      this.touchpadsController_.on(eventName, event => {
        if (event.which.includes(this.pinIndex_)) {
          this.emit(eventName);
        }
      });
    });
  }
}
