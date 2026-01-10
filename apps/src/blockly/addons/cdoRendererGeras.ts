import * as BlocklyCore from 'blockly/core';

import CdoPathObject from './cdoPathObjectGeras';

export default class CdoRendererGeras extends BlocklyCore.geras.Renderer {
  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root: SVGElement, style: BlocklyCore.Theme.BlockStyle) {
    return new CdoPathObject(
      root,
      style,
      this.getConstants() as BlocklyCore.geras.ConstantProvider
    );
  }
}
