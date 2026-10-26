// The lab's color field: Blockly's swatch, with a picker of our own behind it.
//
// It subclasses `@blockly/field-colour`'s `FieldColour` and replaces exactly one
// thing — what opens when you click it. Everything else about a color field is
// already right and worth keeping: a `colour_picker` block IS its color, painted
// edge to edge, and the same field on a statement row draws a small swatch. That
// behaviour is a hundred lines of renderer agreement (`isFullBlockField`,
// `applyColour`, `updateSize_`) that nothing here should be re-deriving.
//
// WHAT OPENS IS THE ARGUMENT. The stock grid is about seventy preset swatches,
// which is both too many to choose from and too few to choose WITH: the stock
// rules already start from colors that are not on it (`#e0484a`, `#4da3ff`), so
// it could not reproduce the value it was showing. What opens now is sixteen
// colors that have names (`colorPalette`) above the whole color range in one
// rectangle (`colorSpectrum`), with a box for a hex somebody was given. The
// swatches are the friendly path and come first; the spectrum is the escape
// hatch, not the greeting.
//
// A LEVEL MAY ASK FOR THE SWATCHES ALONE. A first lesson about color is not a
// lesson about picking one exactly, and `simpleColors` in the level data says so
// — see `setSimpleColors` below, which is how a React setting reaches a Blockly
// field in this lab (the same shape as `setModuleOpener` and friends).

import {FieldColour} from '@blockly/field-colour';
import * as Blockly from 'blockly/core';

import {COLOR_SWATCHES, SWATCHES_PER_ROW} from '../../colorPalette';
import {
  paintSpectrum,
  pickSpectrum,
  SPECTRUM_HEIGHT,
  SPECTRUM_WIDTH,
} from '../../colorSpectrum';
import {toHex} from '../../engine/core/color';

/** White, for a color nothing has chosen yet. */
export const DEFAULT_COLOR = '#ffffff';

const HEX = /^#[0-9a-fA-F]{6}$/;

/** The swatch grid's geometry, in the dropdown's own pixels. */
const SWATCH_SIZE = 26;
const SWATCH_GAP = 2;

let simpleColors = false;

/**
 * Whether the picker offers the swatches alone.
 *
 * Installed by the editor from the level's data, and read when a dropdown is
 * built rather than when a field is made — so it applies to the next click, and
 * a field built before the level was known does not have to be rebuilt.
 */
export function setSimpleColors(simple: boolean): void {
  simpleColors = simple;
}

/** What the picker is currently offering. Exported for tests. */
export const offersSpectrum = (): boolean => !simpleColors;

export class FieldColorPicker extends FieldColour {
  /**
   * Built by the field registry from a block's JSON, which is how every color
   * field in the lab is made — `colour_picker`'s own, and the `r g b a` block's
   * preview swatch. The base class's `fromJson` would hand back a base-class
   * field, so the registry would get the stock grid however this was registered.
   */
  static override fromJson(
    options: Blockly.FieldConfig & {colour?: string; color?: string},
  ): FieldColorPicker {
    // Both spellings: the stock `colour_picker` JSON says `colour` and the
    // lab's own swatch helper says `color` (`domainBlocks.swatchArg`).
    const value = options.colour ?? options.color;
    return new FieldColorPicker(HEX.test(String(value)) ? value : undefined);
  }

  /**
   * Open the picker under the field.
   *
   * In `DropDownDiv`, which is what every other field's editor in this lab opens
   * in: positioned under the field, arrow pointing at it, painted in the block's
   * own colors, closing when you click away. A native `<input type="color">` was
   * tried first and cannot be placed — the browser opens its dialog wherever it
   * likes, which in Chrome is the corner of the screen.
   */
  protected override showEditor_(): void {
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    if (!block) {
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding:6px;';
    wrapper.appendChild(this.buildSwatches());
    if (offersSpectrum()) {
      wrapper.appendChild(this.buildSpectrum());
    }
    Blockly.DropDownDiv.getContentDiv().appendChild(wrapper);

    Blockly.DropDownDiv.setColour(
      block.style.colourPrimary,
      block.style.colourTertiary,
    );
    Blockly.DropDownDiv.showPositionedByField(this);
  }

  /** Take a color and be done: every path here ends the same way. */
  private choose(value: string): void {
    this.setValue(value);
    Blockly.DropDownDiv.hideIfOwner(this);
  }

  /** The named colors, eight to a row. */
  private buildSwatches(): HTMLElement {
    const grid = document.createElement('div');
    const width = SWATCHES_PER_ROW * (SWATCH_SIZE + SWATCH_GAP) - SWATCH_GAP;
    grid.style.cssText =
      `display:grid;gap:${SWATCH_GAP}px;width:${width}px;` +
      `grid-template-columns:repeat(${SWATCHES_PER_ROW}, ${SWATCH_SIZE}px);`;
    for (const {hex, name} of COLOR_SWATCHES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.title = name;
      button.setAttribute('aria-label', name);
      // A pale outline on every one, so black on a dark block and white on a
      // light one are both a swatch rather than a hole.
      button.style.cssText =
        `height:${SWATCH_SIZE}px;padding:0;border-radius:3px;cursor:pointer;` +
        `border:1px solid rgba(0,0,0,.25);background:${hex};`;
      button.addEventListener('click', () => this.choose(hex));
      grid.appendChild(button);
    }
    return grid;
  }

  /** The whole color range, and a box for an exact one. */
  private buildSpectrum(): HTMLElement {
    const holder = document.createElement('div');
    holder.style.cssText = `margin-top:6px;width:${SPECTRUM_WIDTH}px;`;

    const canvas = document.createElement('canvas');
    canvas.width = SPECTRUM_WIDTH;
    canvas.height = SPECTRUM_HEIGHT;
    canvas.style.cssText =
      `display:block;width:${SPECTRUM_WIDTH}px;height:${SPECTRUM_HEIGHT}px;` +
      'border-radius:4px;cursor:crosshair;';

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = this.getValue() ?? DEFAULT_COLOR;
    hex.spellcheck = false;
    hex.setAttribute('aria-label', 'Color, as six hexadecimal digits');
    hex.style.cssText =
      'display:block;width:100%;margin-top:6px;box-sizing:border-box;' +
      'font-family:monospace;font-size:12px;padding:3px 5px;border-radius:3px;' +
      'border:1px solid rgba(0,0,0,.25);';

    holder.appendChild(canvas);
    holder.appendChild(hex);
    // Painted once it is in the document, so the canvas has been laid out.
    paintSpectrum(canvas);

    // A drag keeps setting the value, so the block follows the pointer and what
    // is chosen is what was seen; letting go ends it.
    const pick = (event: PointerEvent) => {
      const picked = pickSpectrum(canvas, event.clientX, event.clientY);
      if (!picked) {
        return;
      }
      const value = toHex(picked.map(byte => byte / 255));
      this.setValue(value);
      hex.value = value;
    };
    canvas.addEventListener('pointerdown', event => {
      canvas.setPointerCapture(event.pointerId);
      pick(event);
    });
    canvas.addEventListener('pointermove', event => {
      if (event.buttons & 1) {
        pick(event);
      }
    });
    canvas.addEventListener('pointerup', () =>
      Blockly.DropDownDiv.hideIfOwner(this),
    );

    const commitTyped = () => {
      const typed = hex.value.trim();
      if (HEX.test(typed)) {
        this.setValue(typed.toLowerCase());
      }
      hex.value = this.getValue() ?? DEFAULT_COLOR;
    };
    hex.addEventListener('change', commitTyped);
    hex.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        commitTyped();
        Blockly.DropDownDiv.hideIfOwner(this);
      }
    });
    return holder;
  }

  override dispose(): void {
    Blockly.DropDownDiv.hideIfOwner(this);
    super.dispose();
  }
}

/** The field type name every color field in the lab is declared under. */
export const FIELD_COLOUR_NAME = 'field_colour';

/**
 * Put this field where the stock one was.
 *
 * Registered over `field_colour` rather than added beside it, so that ONE
 * change reaches every color in the lab: the `colour_picker` block, the `r g b a`
 * block's preview swatch, and the `with default` slot on a color property. A
 * block that declares `field_colour` gets this without knowing it exists, which
 * is the point — a learner meeting sixteen colors on one block and seventy on
 * the next would be meeting two labs.
 */
export function installColorPickerField(): void {
  if (Blockly.fieldRegistry.unregister) {
    Blockly.fieldRegistry.unregister(FIELD_COLOUR_NAME);
  }
  Blockly.fieldRegistry.register(FIELD_COLOUR_NAME, FieldColorPicker);
}
