import * as BlocklyLibrary from 'blockly/core';

import type {Renderer} from '../../types';
import CdoConstantsProvider from '../constants';

import CdoPathObject from './CdoPathObject';

export class CdoRendererThrasosBase extends BlocklyLibrary.thrasos.Renderer {
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

export const renderer: Renderer = {
  name: 'cdo-thrasos',
  class: CdoRendererThrasosBase,
};

export default renderer;
