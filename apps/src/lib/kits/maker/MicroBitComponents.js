/**
 * Utilities for initializing MicroBit board components
 */
import {MicroBitButton} from './Button';

/**
 * Initializes a set of components for the currently
 * connected MicroBit board.
 *
 * @param {MBFirmataClient} board - Microbit firmata client
 * @returns {Promise} board components
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
  MicroBitButton
};
