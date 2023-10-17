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
      // It is possible for updateSize_() to be called before imageElement_ has been initialized.
      // In that case we can skip this update, as the imageElement_ will be initialized with
      // the new width and height.
      // TODO: This will need to be updated when upgrading to the 10.0 version of blockly.
      // In that version imageElement_ is renamed to imageElement.
      if (this.imageElement_) {
        this.imageElement_.setAttribute('width', this.size_.width);
        this.imageElement_.setAttribute('height', this.size_.height);
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
    return this.allowImageChange;
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
