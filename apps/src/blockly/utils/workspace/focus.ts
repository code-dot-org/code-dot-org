import * as BlocklyCore from 'blockly/core';

/**
 * Borrow focus from Blockly's FocusManager — a plain element.focus() loses
 * the race against the manager's focusin listener. Returns a release lambda
 * that must be called exactly once, or no other ephemeral borrow can happen
 * page-wide until reload. Returns null if a borrow is already in flight.
 */
export function takeEphemeralBlocklyFocus(
  element: HTMLElement | SVGElement
): (() => void) | null {
  const focusManager = BlocklyCore.getFocusManager();
  if (focusManager.ephemeralFocusTaken()) {
    return null;
  }
  return focusManager.takeEphemeralFocus(element);
}
