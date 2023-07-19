import GoogleBlockly from 'blockly/core';
import CdoPathObject from './cdoPathObjectThrasos';
import CdoConstantsProvider from './cdoConstantsProvider';
import {addInlineRowSeparators} from '@blockly/renderer-inline-row-separators';

export class CdoRendererThrasos extends GoogleBlockly.thrasos.Renderer {
  /**
   * @override
   * Use our PathObject class instead of the default. Our PathObject has
   * different styles for highlighted and disabled blocks than the geras default.
   */
  makePathObject(root, style) {
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

// Create a separate version of the renderer that includes inline row separators.
export const CdoRendererThrasosIRS = addInlineRowSeparators(
  CdoRendererThrasos,
  GoogleBlockly.thrasos.RenderInfo
);
