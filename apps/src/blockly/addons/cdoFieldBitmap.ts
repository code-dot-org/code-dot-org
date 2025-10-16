import {FieldBitmap} from '@blockly/field-bitmap';
import * as GoogleBlockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

// Use our translations for "Clear" button text.
GoogleBlockly.Msg['BUTTON_LABEL_CLEAR'] = commonI18n.blocklyClear();

/**
 * Custom FieldBitmap class with additional hooks for XML serialization.
 */
export class CdoFieldBitmap extends FieldBitmap {
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
