import {ScrollBlockDragger} from '@blockly/plugin-scroll-options';

export default class BlockDragger extends ScrollBlockDragger {
  /** Open trashcan lid whenever the block is over the toolbox, not only if it's over the trashcan itself.
   * @override
   */
  updateCursorDuringBlockDrag_() {
    super.updateCursorDuringBlockDrag_();
    const wouldDeleteBlock = this.draggedConnectionManager_.wouldDeleteBlock();
    this.workspace_.trashcan.setLidOpen(wouldDeleteBlock);
  }
}
