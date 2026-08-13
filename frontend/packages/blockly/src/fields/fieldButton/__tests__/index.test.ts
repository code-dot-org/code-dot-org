import * as Blockly from 'blockly/core';
import {describe, expect, it, vi} from 'vitest';

import {PluginType} from '../../../plugins';

import plugin, {FieldButton} from '../index';

/*
 * FieldButton's value/text/click logic is plain field behavior that needs no
 * rendering, so it runs headless in jsdom. (initView/applyColour, which draw on
 * a live block, are exercised only when a block renders — out of scope here.)
 */

// Reach the protected, underscore-suffixed methods without rendering a block.
type Internals = {
  getDisplayText_: () => string;
  showEditor_: () => void;
  onMouseDown_: (e: PointerEvent) => void;
};
const internals = (field: FieldButton) => field as unknown as Internals;

describe('FieldButton', () => {
  it('constructs from JSON', () => {
    const field = FieldButton.fromJson({value: 'x', onClick: () => {}});
    expect(field).toBeInstanceOf(FieldButton);
  });

  it('applies transformText to the displayed text', () => {
    const field = new FieldButton({
      value: 'hi',
      onClick: () => {},
      transformText: text => text.toUpperCase(),
    });
    expect(internals(field).getDisplayText_()).toBe('HI');
  });

  it('shows a non-breaking space when there is no text', () => {
    const field = new FieldButton({value: '', onClick: () => {}});
    expect(internals(field).getDisplayText_()).toBe(Blockly.Field.NBSP);
  });

  it('invokes onClick when the editor is shown', () => {
    const onClick = vi.fn();
    internals(new FieldButton({value: 'x', onClick})).showEditor_();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('invokes onClick on mousedown when allowReadOnlyClick is set', () => {
    const onClick = vi.fn();
    const field = new FieldButton({
      value: 'x',
      onClick,
      allowReadOnlyClick: true,
    });
    internals(field).onMouseDown_({} as PointerEvent);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('paints its background whether or not a colour was given', () => {
    // The bug this pins. Blockly paints a field's background from a CLASS, and
    // a button has neither of the two it hands out: callers clear `EDITABLE`
    // (a button has no value a learner sets), which eventually earns the DARK
    // one. Which class it had was an accident of when the flag was cleared, so
    // the same button was pale in a workspace and black in a flyout — and went
    // black in the workspace too as soon as its value changed.
    //
    // An inline `style` beats both classes. The colour is the theme's own
    // field background, so this is not a new colour; it is the one a button
    // was getting when it got lucky.
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const field = new FieldButton({value: 'x', onClick: () => {}});
    Object.assign(field as unknown as Record<string, unknown>, {
      borderRect_: rect,
      textElement_: text,
      getConstants: () => ({FIELD_BORDER_RECT_COLOUR: '#fff'}),
      getSourceBlock: () => ({style: {colourPrimary: '#b8791c'}}),
    });

    field.applyColour();

    expect(rect.getAttribute('style')).toBe('fill: #fff');
    // …and the words with it. The classes paint a non-editable field's text
    // pale to sit on the dark background they were about to give it; state one
    // without the other and a button reads white on white.
    expect(text.getAttribute('style')).toBe('fill: #b8791c');
  });

  it('still prefers a colour the caller asked for', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const field = new FieldButton({
      value: 'x',
      onClick: () => {},
      colorOverrides: {button: 'rebeccapurple'},
    });
    Object.assign(field as unknown as Record<string, unknown>, {
      borderRect_: rect,
      getConstants: () => ({FIELD_BORDER_RECT_COLOUR: '#fff'}),
    });

    field.applyColour();

    expect(rect.getAttribute('style')).toBe('fill: rebeccapurple');
  });

  it('is exposed as a field plugin', () => {
    expect(plugin.type).toBe(PluginType.Field);
    expect(plugin.name).toBe('field_button');
    expect(plugin.field).toBe(FieldButton);
  });
});
