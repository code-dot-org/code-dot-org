import * as Blockly from 'blockly/core';
import {describe, expect, it, vi} from 'vitest';

import {PluginType} from '../../plugins';

import plugin, {FieldButton} from './index';

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

  it('is exposed as a field plugin', () => {
    expect(plugin.type).toBe(PluginType.Field);
    expect(plugin.name).toBe('field_button');
    expect(plugin.field).toBe(FieldButton);
  });
});
