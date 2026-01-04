import * as Blockly from 'blockly/core';

import type {Renderer} from '../../types';
import createRenderer from '../base';

import CdoPathObject from './CdoPathObject';

export class CdoRendererThrasosBase extends Blockly.thrasos.Renderer {
  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root: SVGElement, style: Blockly.Theme.BlockStyle) {
    return new CdoPathObject(root, style, this.getConstants());
  }
}

export const renderer: Renderer = {
  name: 'cdo-thrasos',
  class: createRenderer(CdoRendererThrasosBase),
};

export default renderer;
