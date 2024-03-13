import GoogleBlockly from 'blockly/core';

export default class CdoFieldImage extends GoogleBlockly.FieldImage {
  newWidth = null;
  newHeight = null;
  allowImageChange = true;

  updateDimensions(width, height) {
    this.newWidth = width;
    this.newHeight = height;
    this.isDirty_ = true;
  }

  updateSize_() {
    if (this.newWidth !== null && this.newHeight !== null) {
      this.size_.width = this.newWidth;
      this.size_.height = this.newHeight + GoogleBlockly.FieldImage.Y_PADDING;
      this.imageHeight = this.newHeight;
      // It is possible for updateSize_() to be called before imageElement has been initialized.
      // In that case we can skip this update, as the imageElement will be initialized with
      // the new width and height.
      if (this.imageElement) {
        this.imageElement.setAttribute('width', this.size_.width);
        this.imageElement.setAttribute('height', this.size_.height);
      }
      this.newWidth = null;
      this.newHeight = null;
    }
  }

  // Set a flag to allow or disallow image changes.
  setAllowImageChange(allowImageChange) {
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
  doValueUpdate_(newValue) {
    if (this.shouldAllowImageChange()) {
      super.doValueUpdate_(newValue);
    }
  }
}
