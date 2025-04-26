import * as BlocklyLibrary from 'blockly/core';

import CdoConstantsProvider from '../constants';

import CdoPathObject from './CdoPathObject';

export default class CdoRendererThrasosBase extends BlocklyLibrary.thrasos
  .Renderer {
  static name: string = 'cdo-thrasos';

  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root: SVGElement, style: BlocklyLibrary.Theme.BlockStyle) {
    return new CdoPathObject(root, style, this.getConstants());
  }

  /**
   * @override
   * Use our cdoConstantsProvider class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makeConstants_ = function () {
    return new CdoConstantsProvider();
  };
}
