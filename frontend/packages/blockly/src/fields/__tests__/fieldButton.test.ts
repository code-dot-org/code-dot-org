// What a `FieldButton` puts on the block.
//
// Blockly's own `Field` substitutes a non-breaking space for an empty value, so
// that a text field still has something to click. A button that draws an icon
// already has something to click, and the space became padding: the glyph sat a
// space-width right of the middle of its own button.

import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {FieldButton} from '../fieldButton';

const glyph = (): SVGElement =>
  document.createElementNS('http://www.w3.org/2000/svg', 'tspan');

const displayTextOf = (field: FieldButton): string =>
  (field as unknown as {getDisplayText_: () => string}).getDisplayText_();

describe('FieldButton display text', () => {
  it('says nothing for an icon-only button', () => {
    const field = new FieldButton({
      value: '',
      icon: glyph(),
      onClick: () => {},
    });

    expect(displayTextOf(field)).toBe('');
  });

  it('keeps the placeholder when there is no icon', () => {
    // A button with neither text nor icon still needs a hit area, which is what
    // Blockly's space is for. Only the icon makes it redundant.
    const field = new FieldButton({value: '', onClick: () => {}});

    expect(displayTextOf(field)).toBe(Blockly.Field.NBSP);
  });

  it('shows its text when it has some', () => {
    const field = new FieldButton({value: 'go', onClick: () => {}});

    expect(displayTextOf(field)).toBe('go');
  });
});
