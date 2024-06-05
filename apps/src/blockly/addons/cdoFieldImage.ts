import GoogleBlockly, {Field, FieldImage, FieldImageConfig} from 'blockly/core';

import {FIELD_IMAGE_DEFAULT_SIZE} from '../constants';

export default class CdoFieldImage extends GoogleBlockly.FieldImage {
  // Y_PADDING is private in the parent class, so we need to redefine it here.
  private static readonly Y_PADDING_COPY = 1;
  newWidth: number | null = null;
  newHeight: number | null = null;
  allowImageChange = true;

  // width and height are required in the parent class, but were optional
  // in the CDO Blockly implementation. We override the constructor in order
  // to provide default values for the image width and height.
  constructor(
    src: string | typeof Field.SKIP_SETUP,
    width: string | number = FIELD_IMAGE_DEFAULT_SIZE,
    height: string | number = FIELD_IMAGE_DEFAULT_SIZE,
    alt?: string,
    onClick?: (p1: FieldImage) => void,
    flipRtl?: boolean,
    config?: FieldImageConfig
  ) {
    super(src, width, height, alt, onClick, flipRtl, config);
  }

  updateDimensions(width: number, height: number) {
    this.newWidth = width;
    this.newHeight = height;
    this.isDirty_ = true;
  }

  updateSize_() {
    if (this.newWidth !== null && this.newHeight !== null) {
      this.size_.width = this.newWidth;
      this.size_.height = this.newHeight + CdoFieldImage.Y_PADDING_COPY;
      // imageHeight is readonly in the parent, but we want to override it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).imageHeight = this.newHeight;
      // It is possible for updateSize_() to be called before imageElement has been initialized.
      // In that case we can skip this update, as the imageElement will be initialized with
      // the new width and height.
      if (this.imageElement) {
        this.imageElement.setAttribute('width', `${this.size_.width}`);
        this.imageElement.setAttribute('height', `${this.size_.height}`);
      }
      this.newWidth = null;
      this.newHeight = null;
    }
  }

  // Set a flag to allow or disallow image changes.
  setAllowImageChange(allowImageChange: boolean) {
    this.allowImageChange = allowImageChange;
  }

  shouldAllowImageChange() {
    // This can be called during object construction, in which case
    // an undefined value will be treated as true.
    return this.allowImageChange !== false;
  }

  /**
   * If the image is allowed to change, update the value of the field.
   * @param {string} newValue
   * @override
   */
  doValueUpdate_(newValue: string) {
    if (this.shouldAllowImageChange()) {
      super.doValueUpdate_(newValue);
    }
  }
}
