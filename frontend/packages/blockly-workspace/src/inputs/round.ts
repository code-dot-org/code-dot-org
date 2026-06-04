import * as Blockly from 'blockly/core';

import {PluginType} from '../plugins';
import type {InputPlugin} from '../plugins';

/**
 * Adds a round notch for input/output connections.
 */
export const plugin: (check: string) => InputPlugin = (check: string) => ({
  type: PluginType.Input,
  check,
  shape: 'ROUND',
  makePath: function (shapeIndex: number) {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    function makeMainPath(up: number) {
      // Definition of curve function at https://github.com/google/blockly/blob/2bbb3aa1fcc1cc2df1a75bfbdefa42ab56182872/core/utils/svg_paths.ts#L26-L40
      const path = Blockly.utils.svgPaths.curve('c', [
        -width * 1.5 + ', 0 ',
        -width * 1.5 + ', ' + -1 * up * height + ' ',
        '0, ' + -1 * up * height + ' ',
      ]);
      return path;
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
