import {FieldBitmap} from '@blockly/field-bitmap';
import * as Blockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

// Use our translations for "Clear" button text.
Blockly.Msg['BUTTON_LABEL_CLEAR'] = commonI18n.blocklyClear();

interface FieldBitmapFromJsonConfig extends Blockly.FieldConfig {
  value?: number[][];
  width?: number;
  height?: number;
}
/**
 * Custom FieldBitmap class with additional hooks for XML serialization.
 */
export class CdoFieldBitmap extends FieldBitmap {
  /**
   * Constructs a new instance of CdoFieldBitmap.
   * @param {number[][] | ypeof Blockly.Field.SKIP_SETUP} value - The initial value of the field, represented
   * as a 2D array of any length, or undefined.
   * @param {object | null} options - The options for the field, can be an object or null/undefined.
   * @param {object | null} config - Additional configuration options, can be an object or null/undefined.
   */
  constructor(
    value: number[][] | typeof Blockly.Field.SKIP_SETUP,
    options?: Blockly.FieldValidator<number[][]>,
    config?: FieldBitmapFromJsonConfig
  ) {
    super(value, options, config);
  }

  /**
   * Show the bitmap editor dialog.
   * This override can be removed once this issue is resolved:
   * https://github.com/google/blockly-samples/issues/2463
   *
   * @param e Optional mouse event that triggered the field to open, or
   *    undefined if triggered programmatically.
   */
  // eslint-disable-next-line
  protected showEditor_(this: typeof FieldBitmap, e?: Event) {
    super.showEditor_();

    // Store row and column indices on each pixel button.
    const pixelContainer = document.querySelector('.pixelContainer');
    pixelContainer?.querySelectorAll('.pixelRow').forEach((row, rowIndex) => {
      row.querySelectorAll('.pixelButton').forEach((button, colIndex) => {
        // Set the custom data attributes for row and column indices
        button.setAttribute('data-row', rowIndex.toString());
        button.setAttribute('data-col', colIndex.toString());
      });
    });

    // Handle dragging into a pixel when pointer is down. In the base class,
    // mouseenter events are bound to the individual pixel buttons, but this
    // isn't compatible with touch devices.
    const dropdownEditor = document.querySelector('.dropdownEditor');
    this.bindEvent(dropdownEditor, 'pointermove', (e: PointerEvent) => {
      const currentElement = document.elementFromPoint(e.clientX, e.clientY);
      const rowIndex = currentElement?.getAttribute('data-row');
      const colIndex = currentElement?.getAttribute('data-col');
      if (rowIndex && colIndex) {
        this.onMouseEnterPixel(parseInt(rowIndex), parseInt(colIndex));
      }
    });
  }

  /**
   * Binds an event listener to the specified element.
   * This override can be removed once this issue is resolved:
   * https://github.com/google/blockly-samples/issues/2463
   *
   * @param element Specified element.
   * @param eventName Name of the event to bind.
   * @param callback Function to be called on specified event.
   * @override
   */
  bindEvent(
    element: HTMLElement,
    eventName: string,
    callback: (e: Event) => void
  ) {
    this.boundEvents.push(
      // In the base class, browserEvents.conditionalBind is used, which has
      // a side of effect of locking workspace events on touch devices.
      Blockly.browserEvents.bind(element, eventName, this, callback)
    );
  }

  /**
   * Converts the field's value to XML representation.
   * @param {Element} fieldElement - The XML element to populate with field data.
   * @returns {Element} The populated XML element.
   */
  toXml(fieldElement: Element): Element {
    fieldElement.textContent = JSON.stringify(this.getValue());
    return fieldElement;
  }

  /**
   * Converts XML data to the field's value.
   * Converts a string of binary values into a 2d array with specified height/width.
   * @param {Element} fieldElement - The XML element containing field data.
   */
  fromXml(fieldElement: Element): void {
    const bitmap = JSON.parse(fieldElement.textContent || '[]');
    this.setValue(bitmap);
  }
}
