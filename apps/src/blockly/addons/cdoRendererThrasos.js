import GoogleBlockly from 'blockly/core';
import CdoPathObject from './cdoPathObjectThrasos';
import CdoConstantsProvider from './cdoConstantsProvider';

export default class CdoRendererThrasosBase extends GoogleBlockly.thrasos
  .Renderer {
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
