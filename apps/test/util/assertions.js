import $ from 'jquery';
import {assert} from "./configuredChai";

/**
 * Uses jQuery to locate an element matching the given selector and check that
 * it is visible.
 * @param {string} selector
 */
export function assertVisible(selector) {
  assert.isTrue($(selector).is(':visible'),
    `Expected $('${selector}') to be visible but it was not`);
}

/**
 * Uses jQuery to locate an element matching the given selector and check that
 * it is not visible.
 * @param {string} selector
 */
export function assertHidden(selector) {
  assert.isFalse($(selector).is(':visible'),
    `Expected $('${selector}') to be hidden but it was visible`);
}
