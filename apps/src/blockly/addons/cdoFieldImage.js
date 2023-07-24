import GoogleBlockly from 'blockly/core';

export default class CdoFieldImage extends GoogleBlockly.FieldImage {
  newWidth = null;
  newHeight = null;

  updateDimensions(width, height) {
    this.newWidth = width;
    this.newHeight = height + GoogleBlockly.FieldImage.Y_PADDING;
    this.isDirty_ = true;
  }

  updateSize_() {
    if (this.newWidth !== null && this.newHeight !== null) {
      console.log(
        `updating width to ${this.newWidth} and height to ${this.newHeight}`
      );
      this.size_.width = this.newWidth;
      this.size_.height = this.newHeight;
      // TODO: This will need to be updated when upgrading to the 10.0 version of blockly.
      // In that version imageElement_ is renamed to imageElement.
      this.imageElement_.setAttribute('width', this.newWidth);
      this.imageElement_.setAttribute('height', this.newHeight);
      this.newWidth = null;
      this.newHeight = null;
    }
  }
}
