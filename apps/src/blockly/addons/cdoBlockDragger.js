import {ScrollBlockDragger} from '@blockly/plugin-scroll-options';

export default class BlockDragger extends ScrollBlockDragger {
  /**
   * Make sure disabled state is updated immediately.
   * @override
   */
  endDrag(e, currentDragDeltaXY) {
    super.endDrag(e, currentDragDeltaXY);

    // Core Blockly logic will eventually update the block's disabled state, but
    // we want to update it immediately. We rely on this value to skip
    // code generation for disabled blocks, and since we have live-preview, it
    // would be noticeable if this value were out of sync, even briefly.
    // This only matters if the block is not being deleted.
    if (!this.draggedConnectionManager_.wouldDeleteBlock()) {
      const isStartMode = !!Blockly.editBlocks;
      if (isStartMode) {
        // Never disable blocks in start mode.
      } else {
        const isTopBlock = this.draggingBlock_.previousConnection === null;
        const hasParentBlock = !!this.draggingBlock_.parentBlock_;
        this.draggingBlock_.setEnabled(isTopBlock || hasParentBlock);
      }
    }
  }

  /** Open trashcan lid whenever the block is over the toolbox, not only if it's over the trashcan itself.
   * @override
   */
  updateCursorDuringBlockDrag_() {
    super.updateCursorDuringBlockDrag_();
    const wouldDeleteBlock = this.draggedConnectionManager_.wouldDeleteBlock();
    this.workspace_.trashcan.setLidOpen(wouldDeleteBlock);
  }
}
