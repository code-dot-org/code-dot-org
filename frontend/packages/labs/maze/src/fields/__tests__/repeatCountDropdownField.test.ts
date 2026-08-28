// @vitest-environment jsdom
//
// This package's default vitest environment has no DOM; Blockly's field
// machinery reaches for `document` even outside a rendered workspace.
import {describe, expect, it} from 'vitest';

import {RepeatCountDropdownField} from '../repeatCountDropdownField';

describe('RepeatCountDropdownField', () => {
  it('defaults to the real option set (2 through 10)', () => {
    const field = new RepeatCountDropdownField();
    expect(field.getOptions().map(([, value]) => value)).toEqual(
      ['2', '3', '4', '5', '6', '7', '8', '9', '10'],
    );
  });

  it('accepts a value already in the default range (the repeat(5) reference solution)', () => {
    const field = new RepeatCountDropdownField();
    field.setValue('5');
    expect(field.getValue()).toBe('5');
  });

  it('adds a seeded value outside the default range instead of snapping to the first option', () => {
    const field = new RepeatCountDropdownField();
    field.setValue('15');
    expect(field.getValue()).toBe('15');
    expect(field.getOptions().map(([, value]) => value)).toContain('15');
  });

  it('does not add a non-numeric value — an invalid change is still rejected', () => {
    const field = new RepeatCountDropdownField();
    field.setValue('not-a-number');
    // Rejected by the base FieldDropdown validator: value stays at the
    // field's initial default (the first option) rather than the rejected one.
    expect(field.getValue()).toBe('2');
  });

  // This package's XML->JSON conversion (packages/blockly/src/xml's
  // parseValue) coerces a numeric-looking field's text to a JS number, so a
  // seeded `<title name="TIMES">5</title>` reaches this field's setValue as
  // the number 5, not the string '5' — the exact path a level's toolbox/
  // workspace XML goes through. A `===` against this class's string-typed
  // options must still treat that as a match, not a miss: a miss injects a
  // NUMBER-typed option pair, and Blockly's own ARIA label computation
  // (FieldDropdown.computeOptionAriaLabel) throws on a non-string label —
  // this reproduced live on courseB_iceage_loops1..12 before the fix.
  it('treats a same-valued number as a match for an existing string option', () => {
    const field = new RepeatCountDropdownField();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exercising the exact non-string input Blockly's own state loading passes.
    field.setValue(5 as any);
    expect(field.getValue()).toBe('5');
    expect(field.getOptions()).toHaveLength(9);
    for (const [label, value] of field.getOptions()) {
      expect(typeof label).toBe('string');
      expect(typeof value).toBe('string');
    }
    // The actual live crash: Blockly's ARIA label computation throws on a
    // non-string option label. Reproduces courseB_iceage_loops1's exact
    // failure (TIMES=5, a number after XML->JSON) if the fix regresses.
    expect(() => field.getAriaValue()).not.toThrow();
  });

  it('coerces an out-of-range number to a string option instead of injecting a number pair', () => {
    const field = new RepeatCountDropdownField();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exercising the exact non-string input Blockly's own state loading passes.
    field.setValue(15 as any);
    expect(field.getValue()).toBe('15');
    for (const [label, value] of field.getOptions()) {
      expect(typeof label).toBe('string');
      expect(typeof value).toBe('string');
    }
    expect(() => field.getAriaValue()).not.toThrow();
  });
});
