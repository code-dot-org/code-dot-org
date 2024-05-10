import {FieldBitmap} from '@blockly/field-bitmap';

import {commonI18n} from '@cdo/apps/types/locale';

// The parent class sets a static pixel size and calculate the field size dymanically.
// We set a static height for the field and calculate the pixel size based on available space.
const FIELD_HEIGHT = 42;

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
    config?: object | null
  ) {
    super(value, options, config);
  }

  /**
   * Show the bitmap editor dialog. The parent class provides two buttons labeled
   * "Randomize" and "Clear". In our version, we remove the randomize button and
   * replace the clear button text with a translation string.
   * @param {!Event=} e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param {boolean=} _quietInput Quiet input.
   * @override
   * @protected
   */
  showEditor_(e = undefined, _quietInput = undefined) {
    super.showEditor_(e, _quietInput);

    // Find the buttons inside the dropdown editor.
    const buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
      '.dropdownEditor .controlButton'
    );

    // Remove the button or update its text to use our translations.
    buttons.forEach(button => {
      switch (button.innerHTML.trim()) {
        case 'Randomize':
          button.remove();
          break;
        case 'Clear':
          button.innerHTML = commonI18n.blocklyClear();
          break;
      }
    });
  }

  /**
   * Initializes the on-block display.
   * In the parent class, each pixel is 15x15. In our version, we dynamically
   * set the size based on a static field height. See updateSize_() for more.
   * @override
   */
  initView() {
    this.blockDisplayPixels_ = [];
    this.pixelSize = FIELD_HEIGHT / this.imgHeight_;
    for (let r = 0; r < this.imgHeight_; r++) {
      const row = [];
      for (let c = 0; c < this.imgWidth_; c++) {
        const square = Blockly.utils.dom.createSvgElement(
          'rect',
          {
            x: c * this.pixelSize,
            y: r * this.pixelSize,
            width: this.pixelSize,
            height: this.pixelSize,
            fill: '#fff',
            fill_opacity: 1,
          },
          this.fieldGroup_
        );
        row.push(square);
      }
      this.blockDisplayPixels_.push(row);
    }
  }

  /**
   * Updates the size of the block based on the size of the underlying image.
   * In the parent class, the field size is always sized dynamically based on the
   * number of pixels, each being 15x15. In our version, the height of the field
   * static to prevent the blocks from becoming to large. The width of the field
   * is calculated based on the number of pixels horizontally, each being sized
   * dynamically according to the fixed field height. See initView() for more.
   * @override
   */
  protected updateSize_() {
    {
      const newWidth = this.pixelSize * this.imgWidth_;
      if (this.borderRect_) {
        this.borderRect_.setAttribute('width', String(newWidth));
        this.borderRect_.setAttribute('height', String(FIELD_HEIGHT));
      }

      this.size_.width = newWidth;
      this.size_.height = FIELD_HEIGHT;
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
