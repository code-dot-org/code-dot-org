// A color swatch on a block, opening the browser's own color picker.
//
// `define property` needs somewhere to say what a color property starts as, and
// the alternatives both fall short. A text box asks a learner to know that a
// color is six hexadecimal digits, which is the thing the lab spends its color
// blocks NOT asking. Blockly's `colour_picker` field is a grid of about seventy
// preset swatches, and the stock rules already start from colors that are not on
// it (`#e0484a`, `#4da3ff`) — a picker that cannot reproduce the value it is
// showing is worse than the text box it replaced.
//
// So this opens `<input type="color">`, which every browser answers with its own
// full picker — a spectrum, and a box to paste a hex somebody was given. It is
// the same choice the map editor's inspector made for a color property
// (`mapEditor/MapStage`) and the effect editor made for a color node
// (`effect/editor/EffectFlowNode`), for the same reason.
//
// The input is a real element in the document rather than something drawn here:
// a browser will not open its picker for an element it does not have, and one
// that is `display: none` cannot be clicked open at all. It is parked over the
// field at one pixel square and fully transparent, which is the usual way of it.

import * as Blockly from 'blockly/core';

/** White, for a property that has not said what color it starts as. */
export const DEFAULT_COLOR = '#ffffff';

/** The swatch's side, and the space around it, in workspace units. */
const SWATCH = 14;
const PAD = 3;

const HEX = /^#[0-9a-fA-F]{6}$/;

export class FieldColorPicker extends Blockly.Field<string> {
  private swatch: SVGRectElement | null = null;
  /** The input the browser opens its picker for. Made once, per field. */
  private picker: HTMLInputElement | null = null;

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
    this.swatch?.setAttribute('fill', this.getValue() ?? DEFAULT_COLOR);
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

  protected override doValueUpdate_(value: string): void {
    super.doValueUpdate_(value);
    this.paint();
    this.setTooltip(value);
  }

  /**
   * Hand the press to the browser's picker.
   *
   * Committed on `change`, which is the pick being finished, and not on
   * `input`, which fires all the way through a drag across the spectrum: one
   * value chosen is one step to undo.
   */
  protected override showEditor_(): void {
    if (!this.getSourceBlock() || !this.fieldGroup_) {
      return;
    }
    if (!this.picker) {
      const input = document.createElement('input');
      input.type = 'color';
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');
      input.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;border:0;padding:0;';
      input.addEventListener('change', () => this.setValue(input.value));
      this.picker = input;
    }
    // Under the field, so a picker that anchors to its input opens beside the
    // block rather than in the corner of the window.
    const box = this.fieldGroup_.getBoundingClientRect();
    this.picker.style.left = `${box.left}px`;
    this.picker.style.top = `${box.bottom}px`;
    this.picker.value = this.getValue() ?? DEFAULT_COLOR;
    document.body.appendChild(this.picker);
    this.picker.click();
  }

  override dispose(): void {
    this.picker?.remove();
    this.picker = null;
    super.dispose();
  }
}
