import * as Blockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

import {FieldBitmap, FieldBitmapFromJsonConfig} from './blocklyFieldBitmap';

Blockly.Msg['BUTTON_LABEL_CLEAR'] = commonI18n.blocklyClear();
/**
 * Custom FieldBitmap class with additional hooks for XML serialization.
 */
export class CdoFieldBitmap extends FieldBitmap {
  /**
   * Constructs a new instance of CdoFieldBitmap.
   * @param {number[][] | null} value - The initial value of the field, represented as a 2D array of any length, or null/undefined.
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
