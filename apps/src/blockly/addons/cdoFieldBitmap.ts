import {FieldBitmap} from '@blockly/field-bitmap';

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
    value?: number[][] | null,
    options?: object | null,
    config?: {fieldHeight?: number} | null
  ) {
    super(value, options, config);
    this.fieldHeight = config?.fieldHeight;
  }

  /**
   * Called when a new value has been validated and is about to be set.
   * We extend this to ensure that the field height is always respected.
   * See: https://github.com/google/blockly-samples/issues/2372
   * @param newValue The value that's about to be set.
   * @override
   */
  doValueUpdate_(newValue: number[][]) {
    super.doValueUpdate_(newValue);
    // This calculation is performed once in the constructor of the base class.
    if (newValue && this.fieldHeight) {
      this.pixelSize = this.fieldHeight / this.imgHeight;
    }
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
