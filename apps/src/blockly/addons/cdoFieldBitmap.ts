import {FieldBitmap} from '@blockly/field-bitmap';
import * as blockUtils from '../../block_utils';

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
  constructor(value?: number[][], options?: object, config?: object) {
    super(value, options, config);
  }

  /**
   * Converts the field's value to XML representation.
   * @param {Element} fieldElement - The XML element to populate with field data.
   * @returns {Element} The populated XML element.
   */
  toXml(fieldElement: Element): Element {
    fieldElement.textContent = super.getValue();
    fieldElement.setAttribute('height', super.getImageHeight());
    fieldElement.setAttribute('width', super.getImageWidth());
    return fieldElement;
  }

  /**
   * Converts XML data to the field's value.
   * Converts a string of binary values into a 2d array with specified height/width.
   * @param {Element} fieldElement - The XML element containing field data.
   */
  fromXml(fieldElement: Element): void {
    const fieldValue = fieldElement.textContent || '';
    const height = parseInt(fieldElement.getAttribute('height') || '0');
    const width = parseInt(fieldElement.getAttribute('width') || '0');
    // TODO: define a type for blockUtils
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bitmap = (blockUtils as any).stringTo2DArray(
      fieldValue,
      height,
      width
    );
    super.setValue(bitmap);
  }
}
