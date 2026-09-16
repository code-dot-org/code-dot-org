import {ScrollBlockDragger as ScrollBlockDraggerBase} from '@blockly/plugin-scroll-options';
import * as BlocklyCore from 'blockly/core';

// Blockly 13 removed `workspace` from the Dragger base class. The scroll
// plugin still references `this.workspace`, so we re-expose it via the
// draggable (which for blocks is always a BlockSvg with a workspace).
export class CdoScrollBlockDragger extends ScrollBlockDraggerBase {
  get workspace(): BlocklyCore.WorkspaceSvg {
    return (this.draggable as BlocklyCore.BlockSvg).workspace;
  }
}
