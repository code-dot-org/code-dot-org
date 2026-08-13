import * as Blockly from 'blockly/core';

import {PluginType} from '../../plugins';
import type {FieldPlugin} from '../../plugins';

interface ColorOverrides {
  button?: string;
  icon?: string;
  text?: string;
}

export interface FieldButtonOptions extends Blockly.FieldConfig {
  value?: string;
  validator?: Blockly.FieldValidator<string> | null;
  onClick: () => void;
  transformText?: (text: string) => string;
  icon?: SVGElement;
  colorOverrides?: ColorOverrides;
  allowReadOnlyClick?: boolean;
}

/**
 * Implements a Blockly field that represents a clickable button with an optional
 * image serving as an icon.
 */
export class FieldButton extends Blockly.Field {
  private onClick: () => void | undefined;
  private transformText: ((text: string) => string) | undefined;
  private icon: SVGElement | undefined;
  private colorOverrides: ColorOverrides | undefined;
  private allowReadOnlyClick: boolean | undefined;
  /**
   * This is a customized field which the user clicks to select an option from a customized picker,
   * for example, the location of a sprite from a grid or a sound file from a customized modal.
   * @param {Object} options - The options for constructing the class.
   * @param {*} options.value Optional. The initial value of the field.
   * @param {Function} [options.validator] Optional. A function that is called to validate changes to the field's value.
   * Takes in a value & returns a validated value, or null to abort a change
   * @param {Function} options.onClick Handles the field's editor.
   * @param {Function} [options.transformText] Handles how the field text is displayed.
   * @param {SVGElement} options.icon SVG <tspan> element - if the field displays a button, this is the icon that is displayed on the button.
   * @param {Object} [options.colorOverrides] - An optional set of colors to use instead of the sourceBlock's styles.
   * @param {string} [options.colorOverrides.button] - An override for the toggle button color.
   * @param {string} [options.colorOverrides.icon] - An override for the color of the icon.
   * @param {string} [options.colorOverrides.text] - An override for the color of the text.
   */
  constructor({
    value,
    validator,
    onClick,
    transformText,
    icon,
    colorOverrides,
    allowReadOnlyClick = false,
  }: FieldButtonOptions) {
    super(value, validator);
    this.onClick = onClick;
    this.transformText = transformText;
    this.icon = icon;
    this.SERIALIZABLE = true;
    this.colorOverrides = colorOverrides;
    this.allowReadOnlyClick = allowReadOnlyClick;
  }

  static fromJson(options: FieldButtonOptions) {
    //const options = options as FieldButtonOptions;
    return new FieldButton(options);
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.icon) {
      const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg;
      this.icon.style.fill =
        this.colorOverrides?.icon || sourceBlock?.style.colourPrimary;

      // Make the icon centered on Safari.
      this.icon.setAttribute('dominant-baseline', 'central');
      this.textElement_?.appendChild(this.icon);

      // Measure again once the icon font has arrived. A first render can happen
      // before FontAwesome has loaded, and `updateSize_` would then have
      // measured the FALLBACK glyph — a button sized for a character that is
      // about to be replaced by a different one.
      void document.fonts?.ready.then(() => {
        if (this.getSourceBlock()) {
          this.forceRerender();
        }
      });
    }
  }

  /**
   * Size an icon button to the icon it actually draws.
   *
   * Blockly measures a field's text with the BLOCK's font, as a canvas
   * measurement, for speed. An icon is a FontAwesome character in a `<tspan>`,
   * and the block's font does not have it — so the guess comes back narrower
   * than the glyph, and the button is drawn too small for its own icon and the
   * icon sits off its centre. `getComputedTextLength` asks what was actually
   * rendered, and then equal padding either side is what centres it.
   *
   * Only for icon buttons: a text button's text IS in the block's font, where
   * Blockly's own measurement is both right and faster.
   */
  protected override updateSize_(margin?: number): void {
    if (!this.icon) {
      super.updateSize_(margin);
      return;
    }
    const constants = this.getConstants();
    const pad =
      margin ??
      (this.borderRect_ ? (constants?.FIELD_BORDER_RECT_X_PADDING ?? 0) : 0);
    const width = this.textElement_?.getComputedTextLength() ?? 0;
    const height = this.borderRect_
      ? Math.max(
          constants?.FIELD_TEXT_HEIGHT ?? 0,
          constants?.FIELD_BORDER_RECT_HEIGHT ?? 0,
        )
      : (constants?.FIELD_TEXT_HEIGHT ?? 0);
    this.size_ = new Blockly.utils.Size(pad * 2 + width, height);
    this.positionTextElement_(pad, width);
    this.positionBorderRect_();
  }

  /**
   *  Get the text from this field to display on the block. May differ from
   * `getText` with call to `this.transformText` which can change format of text.
   * @override
   */
  getDisplayText_() {
    const text = this.getText();
    if (!text) {
      // An ICON-only button says nothing, and should take no room saying it.
      // Blockly's own `Field` substitutes a non-breaking space for an empty
      // value so that a text field still has something to click; a button that
      // draws an icon already has that, and the space became padding — the
      // glyph sat a space-width right of the middle of its own button.
      return this.icon ? '' : Blockly.Field.NBSP;
    }
    // The transformText function customizes the text for display.
    if (this.transformText) {
      return this.transformText(text);
    }
    return text;
  }

  /**
   * Create an editor for the field.
   * @override
   */
  showEditor_() {
    this.onClick();
  }

  /**
   * If we always want to allow clicking on a read-only field, we
   * call onClick here, otherwise we use the default behavior.
   * @override
   */
  onMouseDown_(e: PointerEvent) {
    if (this.allowReadOnlyClick) {
      this.onClick();
    } else {
      super.onMouseDown_(e);
    }
  }

  /**
   * Contrast background for button with source block
   * @override
   *
   * THE RECT IS PAINTED WHETHER OR NOT THERE IS AN OVERRIDE, and that is a fix
   * rather than a tidy-up. Blockly paints a field's background from a CLASS —
   * `blocklyEditableField` is the pale one every dropdown and text field wears,
   * `blocklyNonEditableField` is dark — and a button is neither: it has no
   * value a learner sets, so callers clear `EDITABLE` to stop Blockly
   * serializing it and warning about it.
   *
   * Which class it ends up with was then an accident of timing. Clearing the
   * flag AFTER appending leaves the pale class stamped and never re-stamped, so
   * a button looked right in the workspace by luck. Put the same block in a
   * FLYOUT — where every field is non-editable, because a block in the toolbox
   * cannot be edited — and Blockly re-stamps it, and the same button comes back
   * black. So did any button whose value changed, since writing one re-stamps
   * too: the world block's rule count was black in the workspace for exactly
   * that reason while the eye beside it was not.
   *
   * Saying the colour outright ends the argument: an inline `style` beats both
   * classes, so a button looks the same everywhere. The default is the field
   * background the theme already uses for every other field, so this is not a
   * new colour — it is the colour a button was getting when it got lucky.
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg;
    const textColor = this.colorOverrides?.text;
    const iconColor = this.colorOverrides?.icon;
    const buttonColor =
      this.colorOverrides?.button ??
      this.getConstants()?.FIELD_BORDER_RECT_COLOUR;

    if (this.icon) {
      this.icon.style.fill = iconColor || sourceBlock?.style.colourPrimary;
    }

    const borderRect = this.borderRect_;
    if (borderRect && buttonColor) {
      borderRect.setAttribute('style', 'fill: ' + buttonColor);
    }

    // The text goes the way the icon does, and for the same reason now that the
    // background is stated: Blockly's classes paint a non-editable field's text
    // PALE, to sit on the dark background it was about to give it. Take the
    // dark background away and the words go white on white — which is what a
    // button reading "8 rules" did the moment its rect was fixed. The block's
    // own colour is what the eye's glyph already uses, so the two read alike.
    const textElement = this.textElement_;
    if (textElement) {
      textElement.setAttribute(
        'style',
        'fill: ' + (textColor || sourceBlock?.style.colourPrimary),
      );
    }
  }
}

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_button',
  field: FieldButton,
};

export default plugin;
