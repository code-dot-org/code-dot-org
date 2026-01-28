import * as Blockly from 'blockly/core';

import {PluginType} from '../../../plugins';
import type {InputPlugin} from '../../../plugins';

/**
 * Adds a spiky triangular notch for input/output connections.
 */
export const plugin: (check: string) => InputPlugin = (check: string) => ({
  type: PluginType.Input,
  check,
  shape: 'TRIANGLE',
  makePath: function (shapeIndex: number) {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can
     * define a function to generate the path for both.
     */
    function makeMainPath(up: number) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, (-1 * up * height) / 2),
        Blockly.utils.svgPaths.point(width, (-1 * up * height) / 2),
      ]);
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: shapeIndex,
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp,
    };
  },
});

export default plugin;
