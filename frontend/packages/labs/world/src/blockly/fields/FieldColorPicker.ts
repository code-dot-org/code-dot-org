// A color swatch on a block, opening a color picker under it.
//
// `define property` needs somewhere to say what a color property starts as, and
// the alternatives both fall short. A text box asks a learner to know that a
// color is six hexadecimal digits, which is the thing the lab spends its color
// blocks NOT asking. Blockly's `colour_picker` field is a grid of about seventy
// preset swatches, and the stock rules already start from colors that are not on
// it (`#e0484a`, `#4da3ff`) — a picker that cannot reproduce the value it is
// showing is worse than the text box it replaced.
//
// So this shows the whole color range instead: the same rectangle the image
// editor's swatch opens (`colorSpectrum`), with a box under it for a hex
// somebody was given. Between them there is no color that cannot be said.
//
// IT LIVES IN BLOCKLY'S OWN DROPDOWN, which is the reason it is drawn here at
// all rather than handed to `<input type="color">`. A native color input opens
// whatever window the browser feels like, wherever the browser feels like
// putting it — in Chrome, the top-left corner of the screen, an entire monitor
// away from the block that asked. `DropDownDiv` positions itself under the
// field with an arrow pointing at it, the way every other field's editor in the
// lab does, and closes when you click away.

import * as Blockly from 'blockly/core';

import {
  paintSpectrum,
  pickSpectrum,
  SPECTRUM_HEIGHT,
  SPECTRUM_WIDTH,
} from '../../colorSpectrum';
import {toHex} from '../../engine/core/color';

/** White, for a property that has not said what color it starts as. */
export const DEFAULT_COLOR = '#ffffff';

/** The swatch's side, and the space around it, in workspace units. */
const SWATCH = 14;
const PAD = 3;

const HEX = /^#[0-9a-fA-F]{6}$/;

// `string | undefined` and not `string`, because that is the value type
// Blockly's own field APIs are written against (`DropDownDiv.showPositionedByField`
// takes a `Field<string | undefined>`). Nothing here ever holds `undefined`:
// the constructor supplies a color and the validator refuses anything that is
// not one.
export class FieldColorPicker extends Blockly.Field<string | undefined> {
  private swatch: SVGRectElement | null = null;
  constructor(value?: string) {
    super(HEX.test(String(value ?? '')) ? String(value) : DEFAULT_COLOR);
    this.SERIALIZABLE = true;
  }

  /**
   * Six hex digits or nothing.
   *
   * Returning null keeps whatever the field already held, which is what should
   * happen to a value no picker could show: `#e0484a` is a color, `` is not,
   * and neither is `red`.
   */
  protected override doClassValidation_(value?: string): string | null {
    const text = String(value ?? '').trim();
    return HEX.test(text) ? text.toLowerCase() : null;
  }

  /**
   * The swatch, and the field background behind it.
   *
   * `super.initView()` is not called: it would make a text element for a value
   * this field draws as a color rather than as words.
   */
  override initView(): void {
    this.createBorderRect_();
    this.swatch = Blockly.utils.dom.createSvgElement<SVGRectElement>(
      Blockly.utils.Svg.RECT,
      {
        x: PAD,
        y: PAD,
        rx: 3,
        ry: 3,
        width: SWATCH,
        height: SWATCH,
        // A pale outline, so white on a light block is still a swatch.
        stroke: '#00000033',
        'stroke-width': 1,
      },
      this.fieldGroup_!,
    );
    this.paint();
  }

  /**
   * Put the value on the swatch.
   *
   * Called from everywhere the value or the view can change, and NOT left to
   * `render_` alone. Blockly runs `render_` only when it next asks the field
   * for its size, and a field whose size never changes — this one is a fixed
   * square — can be asked once and never again: the value moved and the swatch
   * did not. Blockly's own colour field paints from `doValueUpdate_` for the
   * same reason.
   */
  private paint(): void {
    // An inline `style`, and NOT a `fill` attribute. A presentation attribute
    // loses to any CSS rule that matches the element, and Blockly's renderer
    // paints a field's rects from its own stylesheet — so the swatch carried
    // the right color in the DOM and drew the field background's white, which
    // reads as a picker that does not work. `FieldButton` states its colours
    // inline for the same reason.
    if (this.swatch) {
      this.swatch.style.fill = this.getValue() ?? DEFAULT_COLOR;
    }
  }

  protected override updateSize_(): void {
    this.size_ = new Blockly.utils.Size(SWATCH + PAD * 2, SWATCH + PAD * 2);
    this.positionBorderRect_();
  }

  protected override render_(): void {
    this.paint();
    this.updateSize_();
  }

  /** The hex, for the tooltip and for anything that reads a field as words. */
  override getText(): string {
    return this.getValue() ?? '';
  }

  protected override doValueUpdate_(value: string | undefined): void {
    super.doValueUpdate_(value);
    this.paint();
    this.setTooltip(value ?? DEFAULT_COLOR);
  }

  /**
   * Open the picker under the field.
   *
   * A drag across the rectangle keeps setting the value, so the block updates
   * as the pointer moves and what is chosen is what was seen; letting go ends
   * it. The hex box beside it commits on Enter or on losing focus, which is
   * the only way to say a color exactly.
   */
  protected override showEditor_(): void {
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    if (!block) {
      return;
    }
    const content = Blockly.DropDownDiv.getContentDiv();

    const canvas = document.createElement('canvas');
    canvas.width = SPECTRUM_WIDTH;
    canvas.height = SPECTRUM_HEIGHT;
    canvas.style.cssText = `display:block;width:${SPECTRUM_WIDTH}px;height:${SPECTRUM_HEIGHT}px;border-radius:4px;cursor:crosshair;`;

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = this.getValue() ?? DEFAULT_COLOR;
    hex.spellcheck = false;
    hex.setAttribute('aria-label', 'Color, as six hexadecimal digits');
    hex.style.cssText =
      'display:block;width:100%;margin-top:6px;box-sizing:border-box;' +
      'font-family:monospace;font-size:12px;padding:3px 5px;border-radius:3px;' +
      'border:1px solid rgba(0,0,0,.25);';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding:6px;';
    wrapper.appendChild(canvas);
    wrapper.appendChild(hex);
    content.appendChild(wrapper);

    // Painted after it is in the document: a canvas with no layout yet still
    // takes a fill, but nothing else about it is worth guessing at.
    paintSpectrum(canvas);

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
    // The pick is done when the press ends — a drag can refine it first.
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

    Blockly.DropDownDiv.setColour(
      block.style.colourPrimary,
      block.style.colourTertiary,
    );
    Blockly.DropDownDiv.showPositionedByField(this);
  }

  override dispose(): void {
    Blockly.DropDownDiv.hideIfOwner(this);
    super.dispose();
  }
}
