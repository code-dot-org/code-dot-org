import * as Blockly from 'blockly/core';

import type {InputPlugin} from '../plugins';

import CdoConstantsProvider from './constants';

export type RendererClassType = (
  inputs: InputPlugin[],
) => new (name: string) => Blockly.blockRendering.Renderer;

function createRenderer(
  RendererClass: new (name: string) => Blockly.blockRendering.Renderer,
): RendererClassType {
  return (inputs: InputPlugin[]) =>
    class extends RendererClass {
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
