import GoogleBlockly from 'blockly/core';
import {customConnectionBlockTypes} from './cdoConstants';

/**
 * A connection checker that imposes stricter typing rules than the default
 * checker in Blockly, but uses the same rules for dragging and safety.
 * This checker still expects nullable arrays of string for connection
 * type checks, and still looks for intersections in the arrays. Unlike the
 * default checker, null checks arrays are only compatible with other null
 * arrays.
 * @implements {Blockly.IConnectionChecker}
 */

export default class CdoConnectionChecker extends GoogleBlockly.ConnectionChecker {
  /**
   * Constructor for the connection checker.
   */
  constructor() {
    super();
  }

  /**
   * Check whether this connection is compatible with another connection with
   * respect to the value type system.  E.g. square_root("Hello") is not
   * compatible. For our custom implementation, blocks with custom connection
   * types (Behaviors, Locations, Sprites) should are not compatible with null
   * connection types.
   *
   * @param a Connection to compare.
   * @param b Connection to compare against.
   * @returns True if the connections share a type.
   */
  doTypeChecks(a, b) {
    const checkArrayOne = a.getCheck();
    const checkArrayTwo = b.getCheck();

    const customConnectionChecks = Object.values(customConnectionBlockTypes);
    const foundInOne = !!checkArrayOne?.some(check =>
      customConnectionChecks.includes(check)
    );
    const foundInTwo = !!checkArrayTwo?.some(check =>
      customConnectionChecks.includes(check)
    );

    if (foundInOne !== foundInTwo) {
      return false;
    }

    if (!checkArrayOne || !checkArrayTwo) {
      // One or both sides are promiscuous enough that anything will fit.
      return true;
    }
    // Find any intersection in the check lists.
    return checkArrayOne.some(check => checkArrayTwo.includes(check));
  }
}
