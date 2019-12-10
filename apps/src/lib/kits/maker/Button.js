/** @file Wrapper around Johnny-Five Button component */
import five from '@code-dot-org/johnny-five';
import '../../../utils'; // For Function.prototype.inherits
import {EXTERNAL_PINS} from './PlaygroundConstants';

/**
 * Wrap Johnny-Five's Button component to add attributes and customize behavior.
 * @param opts - see five.Button
 * @constructor
 * @extends {five.Button}
 */
export function PlaygroundButton(opts) {
  // For Circuit Playground, treat touch pin buttons as pullups.
  opts.pullup = EXTERNAL_PINS.includes(opts.pin);
  five.Button.call(this, opts);

  // Add a read-only `isPressed` property
  Object.defineProperty(this, 'isPressed', {
    get: () => this.value === 1
  });
}
PlaygroundButton.inherits(five.Button);

export function MicroBitButton(board) {
  this.buttonEvents = new Array(6).fill(0);
  board.mb.addFirmataEventListener((sourceID, eventID) => {
    if (board.pin === sourceID) {
      this.buttonEvents[eventID]++;
      if (eventID === 1) {
        this.emit('down');
      } else if (eventID === 2) {
        this.emit('up');
      }
    }
  });

  // Add a read-only `isPressed` property
  Object.defineProperty(this, 'isPressed', {
    get: () => this.buttonEvents[1] > 0
  });
}
MicroBitButton.inherits(five.Button);
