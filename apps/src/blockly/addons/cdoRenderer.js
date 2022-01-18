import GoogleBlockly from 'blockly/core';
import CdoPathObject from './cdoPathObject';

export default class CdoRenderer extends GoogleBlockly.geras.Renderer {
  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root, style) {
    return new CdoPathObject(root, style, this.getConstants());
  }
}
