import GoogleBlockly from 'blockly/core';

export default class BlockDragger extends GoogleBlockly.BlockDragger {
  /** Show trashcan over toolbox while dragging
   * @override
   */
  drag(e, currentDragDeltaXY) {
    super.drag(e, currentDragDeltaXY);
    const isDraggingFromFlyout_ = !!Blockly.mainBlockSpace.currentGesture_
      .flyout_;

    if (isDraggingFromFlyout_) {
      this.workspace_.hideTrashcan();
    } else {
      this.workspace_.showTrashcan();
      if (this.draggingBlock_.isDeletable()) {
        this.workspace_.trashcan.setDisabled(false);
      } else {
        this.workspace_.trashcan.setDisabled(true);
      }
    }
  }

  /** Hide trashcan when drag ends.
   * Also prevent blocks from ending with a negative position. Google allows the workspace to scroll in any direction,
   * so negative block coordinates are valid, but we want to keep everything flowing down and to the right from (0,0).
   * @override
   */
  endDrag(e, currentDragDeltaXY) {
    const wouldDeleteBlock = this.draggedConnectionManager_.wouldDeleteBlock();
    // Don't let the block end with a negative position, unless it's getting deleted.
    if (!wouldDeleteBlock) {
      const endPosition = this.draggingBlock_.getRelativeToSurfaceXY();
      if (endPosition.x < 0) {
        currentDragDeltaXY.x -= endPosition.x;
      }
      if (endPosition.y < 0) {
        currentDragDeltaXY.y -= endPosition.y;
      }
    }

    super.endDrag(e, currentDragDeltaXY);
    this.workspace_.trashcan.setDisabled(false);
    this.workspace_.trashcan.setLidOpen(false);
    this.workspace_.hideTrashcan();

    // Core Blockly logic will eventually update the block's disabled state, but
    // we want to update it immediately. We rely on this value to skip
    // code generation for disabled blocks, and since we have live-preview, it
    // would be noticeable if this value were out of sync, even briefly.
    // This only matters if the block is not being deleted.
    if (!wouldDeleteBlock) {
      this.draggingBlock_.setEnabled(!!this.draggingBlock_.parentBlock_);
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
