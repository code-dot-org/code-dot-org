// The chrome is the site's chrome.
//
// Two things this is about, and both were once true of the editor and are not
// any more: its buttons looked like nothing else in the lab, and it said things
// with typographic glyphs — ↶, ⇄, 💬 — that the rest of the product says with
// FontAwesome icons.
//
// The look itself is not asserted here (it is Emotion classes, and a test that
// pins those would fail on every design-system release). What is asserted is
// what the look FOLLOWS from: a button that names a variant and a color the
// design system styles, and an icon that is an icon.

import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

/** The glyphs the chrome used to be drawn with. */
const GLYPHS = ['↶', '↷', '⇄', '↻', '✎', '◉', '◎', '💬', '×', '◂', '▸'];

const editor = () =>
  render(<EffectEditor initialDocument={createEffectDocument()} />).container;

describe('the editor chrome', () => {
  it('draws its buttons with FontAwesome icons', () => {
    editor();
    for (const [name, icon] of [
      ['Undo', 'fa-rotate-left'],
      ['Redo', 'fa-rotate-right'],
      ['Show the GLSL code', 'fa-code'],
      ['Change test texture', 'fa-images'],
    ] as const) {
      const button = screen.getByRole('button', {name});
      expect(button.querySelector(`i.${icon}`), name).not.toBeNull();
    }
  });

  it('says nothing with a glyph that an icon should say', () => {
    const container = editor();
    const text = container.textContent ?? '';
    for (const glyph of GLYPHS) {
      expect(text.includes(glyph), glyph).toBe(false);
    }
  });

  it('takes its form controls from the design system, not from MUI', () => {
    // MUI is what lays the editor out — Paper, List, MenuList — and one control
    // it still supplies is the vertical try-out slider, which the design system
    // has no equivalent of. Everything a learner types into or picks from is
    // DSCO: a native input or select, themed by the same tokens as the rest of
    // the lab rather than by MUI's own palette.
    const container = editor();
    expect(
      container.querySelector(
        '[class*="MuiTextField"], [class*="MuiInputBase"], [class*="MuiSwitch"], [class*="MuiSelect"]',
      ),
    ).toBeNull();
    expect(container.querySelector('input[name="node-search"]')).not.toBeNull();
  });

  it('names a variant and a color the design system styles', () => {
    // `color="inherit"` is not one of the pairs `CdoTheme` styles, so a button
    // left on it falls through every one of them and renders as bare MUI. That
    // was the editor's default; nothing may go back to it.
    editor();
    for (const button of screen.getAllByRole('button')) {
      expect(button.className, button.textContent ?? '').not.toMatch(
        /MuiButton-(text|outlined|contained)Inherit/,
      );
    }
  });
});
