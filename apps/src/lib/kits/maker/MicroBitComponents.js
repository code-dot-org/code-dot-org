/**
 * Utilities for initializing MicroBit board components with APIs
 * conforming to Maker API droplet blocks.
 */

import five from '@code-dot-org/johnny-five';
import {MicroBitButton} from './Button';

/**
 * Initializes a set of Johnny-Five component instances for the currently
 * connected MicroBit board.
 *
 * @param {five.Board} board - the johnny-five board object that needs new
 *        components initialized.
 * @returns {<String, Object>} board components
 */
export function createMicroBitComponents(board) {
  return Promise.resolve({
    buttonA: new MicroBitButton({mb: board, pin: 1}),
    buttonB: new MicroBitButton({mb: board, pin: 2})
  });
}

/**
 * Set of classes used by interpreter to understand the type of instantiated
 * objects, allowing it to make methods and properties of instances available.
 */
export const componentConstructors = {
  Board: five.Board,
  MicroBitButton
};
