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
      this.draggingBlock_.setEnabled(
        Blockly.isStartMode || !this.draggingBlock_.isUnused()
      );
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
