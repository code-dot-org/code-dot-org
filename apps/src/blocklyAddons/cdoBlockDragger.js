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

  /** Hide trashcan when drag ends
   * @override
   */
  endBlockDrag(e, currentDragDeltaXY) {
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
