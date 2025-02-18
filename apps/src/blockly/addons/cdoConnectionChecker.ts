import * as GoogleBlockly from 'blockly/core';

import {BLOCK_TYPES} from '../constants';

import {customConnectionBlockTypes} from './cdoConstants';

/**
 * A connection checker that imposes stricter typing rules for CDO custom
 * connection type checks, but uses the same rules for dragging and safety.
 * This checker still expects nullable arrays of string for connection
 * type checks, and still looks for intersections in the arrays. Unlike the
 * default checker, check arrays that contain a custom connection type are
 * only compatible with other check arrays with the same connection type.
 *
 * This implementation also includes an additional check to prevent
 * connections to inputs of function definitions that include argument_reporter
 * shadow block.
 * @implements {Blockly.IConnectionChecker}
 */

export default class CdoConnectionChecker extends GoogleBlockly.ConnectionChecker {
  /**
   * Check whether this connection is compatible with another connection with
   * respect to the value type system.  E.g. square_root("Hello") is not
   * compatible. Includes custom logic for CDO custom connection type checks.
   *
   * @param a Connection to compare.
   * @param b Connection to compare against.
   * @returns True if the connections share a type.
   */
  doTypeChecks(a: GoogleBlockly.Connection, b: GoogleBlockly.Connection) {
    const checkArrayOne = a.getCheck(); // An array of strings or null
    const checkArrayTwo = b.getCheck(); // An array of strings or null

    // For our custom implementation, connections are rejected if only one
    // check array contains a CDO custom connection type (Behaviors, Locations,
    // Sprites). E.g. A block with a sprite input should not accept a number.
    const customConnectionChecks = Object.values(customConnectionBlockTypes);
    const checkArrayOneContainsCustomType = !!checkArrayOne?.some(check =>
      customConnectionChecks.includes(check)
    );
    const checkArrayTwoContainsCustomType = !!checkArrayTwo?.some(check =>
      customConnectionChecks.includes(check)
    );
    if (checkArrayOneContainsCustomType !== checkArrayTwoContainsCustomType) {
      return false;
    }

    // Prevent connection if a shadow argument_reporter block is connected to
    // the value input of a function definition block. This connection represents
    // a function parameter, which should not be displaced by another block.
    if (
      Blockly.cdoUtils.isFunctionBlock(b.getSourceBlock()) &&
      b.type === Blockly.ConnectionType.INPUT_VALUE &&
      b.isConnected() &&
      b.targetConnection?.getSourceBlock().isShadow() &&
      b.targetConnection?.getSourceBlock().type === BLOCK_TYPES.argumentReporter
    ) {
      return false;
    }

    return super.doTypeChecks(a, b);
  }
}
