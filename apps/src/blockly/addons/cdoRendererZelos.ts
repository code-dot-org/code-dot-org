import GoogleBlockly from 'blockly/core';
import CdoPathObject from './cdoPathObjectZelos';
import {BlockStyle} from 'blockly/core/theme';

export default class CdoRendererZelos extends GoogleBlockly.zelos.Renderer {
  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root: SVGElement, style: BlockStyle) {
    return new CdoPathObject(root, style, this.getConstants());
  }
}
