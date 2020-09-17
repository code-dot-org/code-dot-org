/** @file Wrapper around Johnny-Five Button component */
import five from '@code-dot-org/johnny-five';
import '../../../../../utils'; // For Function.prototype.inherits
import {EXTERNAL_PINS} from './PlaygroundConstants';

/**
 * Wrap Johnny-Five's Button component to add attributes and customize behavior.
 * @param opts - see five.Button
 * @constructor
 * @extends {five.Button}
 */
export default function PlaygroundButton(opts) {
  // For Circuit Playground, treat touch pin buttons as pullups.
  opts.pullup = EXTERNAL_PINS.includes(opts.pin);
  five.Button.call(this, opts);

  // Add a read-only `isPressed` property
  Object.defineProperty(this, 'isPressed', {
    get: () => this.value === 1
  });
}
PlaygroundButton.inherits(five.Button);
