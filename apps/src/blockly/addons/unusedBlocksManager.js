import UnusedBlockFrame from './UnusedBlockFrame';

export default class UnusedBlocksManager {
  constructor(workspace) {
    this.workspace = workspace;
    this.workspace.addChangeListener(this.workspaceChangeHandler.bind(this));
  }

  workspaceChangeHandler(blocklyEvent) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      if (blocklyEvent.isStart) {
        const block = blocklyEvent.blocks[0];
        if (block.unusedSvg_) {
          block.unusedSvg_.dispose();
          block.unusedSvg_ = null;
        }
      }
    }
  }

  show() {
    this.workspace.getTopBlocks().forEach(block => {
      if (block.disabled) {
        this.addUnusedBlockFrame(block);
      }
    });
  }

  addUnusedBlockFrame(block, helpClickFunc) {
    if (!block.unusedSvg_) {
      block.unusedSvg_ = new UnusedBlockFrame(block, helpClickFunc);
    }
    block.unusedSvg_.render(block.svgGroup_);
  }
}
