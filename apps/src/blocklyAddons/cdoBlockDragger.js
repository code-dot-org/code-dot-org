import GoogleBlockly from 'blockly/core';

export default class BlockDragger extends GoogleBlockly.BlockDragger {
  /** Show trashcan over toolbox while dragging
   * @override
   */
  dragBlock(e, currentDragDeltaXY) {
    super.dragBlock(e, currentDragDeltaXY);
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
  endBlockDrag(e, currentDragDeltaXY) {
    // Don't let the block end with a negative position, unless it's getting deleted.
    if (!this.draggedConnectionManager_.wouldDeleteBlock()) {
      const endPosition = this.draggingBlock_.getRelativeToSurfaceXY();
      if (endPosition.x < 0) {
        currentDragDeltaXY.x -= endPosition.x;
      }
      if (endPosition.y < 0) {
        currentDragDeltaXY.y -= endPosition.y;
      }
    }

    super.endBlockDrag(e, currentDragDeltaXY);
    this.workspace_.trashcan.setDisabled(false);
    this.workspace_.hideTrashcan();
  }

  /** Open trashcan lid whenever the block is over the toolbox, not only if it's over the trashcan itself.
   * @override
   */
  updateCursorDuringBlockDrag_() {
    super.updateCursorDuringBlockDrag_();
    if (this.draggedConnectionManager_.wouldDeleteBlock()) {
      this.workspace_.trashcan.setLidOpen(true);
    }
  }
}
