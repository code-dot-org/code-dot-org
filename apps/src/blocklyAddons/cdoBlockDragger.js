import GoogleBlockly from 'blockly/core';

export default class BlockDragger extends GoogleBlockly.BlockDragger {
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

  endBlockDrag(e, currentDragDeltaXY) {
    super.endBlockDrag(e, currentDragDeltaXY);
    this.workspace_.trashcan.setDisabled(false);
    this.workspace_.hideTrashcan();
  }
}
