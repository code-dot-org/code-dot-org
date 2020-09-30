import GoogleBlockly from 'blockly/core';

export default class BlockDragger extends GoogleBlockly.BlockDragger {
  updateCursorDuringBlockDrag_() {
    const wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
    if (wouldDeleteBlock_) {
      this.workspace_.showTrashcan();
    } else {
      this.workspace_.hideTrashcan();
    }
    super.updateCursorDuringBlockDrag_();
  }
}
