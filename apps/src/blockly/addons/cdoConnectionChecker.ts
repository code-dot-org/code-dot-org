import GoogleBlockly, {Connection} from 'blockly/core';

import {customConnectionBlockTypes} from './cdoConstants';

/**
 * A connection checker that imposes stricter typing rules for CDO custom
 * connection type checks, but uses the same rules for dragging and safety.
 * This checker still expects nullable arrays of string for connection
 * type checks, and still looks for intersections in the arrays. Unlike the
 * default checker, check arrays that contain a custom connection type are
 * only compatible with other check arrays with the same connection type.
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
  doTypeChecks(a: Connection, b: Connection) {
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

    return super.doTypeChecks(a, b);
  }
}
