import * as Blockly from 'blockly/core';

import CdoConstantsProvider from './constants';

type RendererClassType<T extends Blockly.blockRendering.Renderer> = new (
  name: string,
) => T;

function createRenderer<T extends RendererClassType>(
  RendererClass: T,
): RendererClassType {
  return (inputs: InputPlugin[]) =>
    class Renderer extends RendererClass {
      /**
       * @override
       * Use our cdoConstantsProvider class instead of the default. Our PathObject has
       * different styles for highlighted and disabled blocks than the geras default.
       */
      makeConstants_ = function () {
        return new CdoConstantsProvider(inputs);
      };
    };
}

export default createRenderer;
