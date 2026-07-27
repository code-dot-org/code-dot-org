import {FieldBitmap} from '@blockly/field-bitmap';
import * as BlocklyCore from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

// Use our translations for "Clear" button text.
BlocklyCore.Msg['BUTTON_LABEL_CLEAR'] = commonI18n?.blocklyClear?.() || 'Clear';

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

  /**
   * JSON serialization: the bitmap itself. Without these hooks Blockly
   * routes JSON-serialized field state through the legacy XML path (because
   * fromXml is overridden): saves embed an XML string, and loading a plain
   * JSON field value (e.g. a toolbox entry's fields) crashes in DOMParser.
   */
  saveState(): number[][] | null {
    return this.getValue();
  }

  loadState(state: unknown): void {
    if (typeof state === 'string') {
      const text = state.trim();
      // States saved before these hooks existed are legacy XML strings;
      // toolbox defaults may carry the bitmap as a JSON string.
      if (text.startsWith('<')) {
        this.fromXml(BlocklyCore.utils.xml.textToDom(text));
        return;
      }
      this.setValue(JSON.parse(text));
      return;
    }
    this.setValue(state);
  }
}
