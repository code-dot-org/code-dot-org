import {BLOCK_TYPES} from '../constants';

export function overrideHandleTouchMove(blocklyWrapper) {
  const cdoGesture = blocklyWrapper.Gesture.prototype;

  // Override handleTouchMove function
  cdoGesture.handleTouchMove = function (e) {
    const pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);

    this.cachedPoints.set(pointerId, this.getTouchPoint(e));

    if (this.isPinchZoomEnabled && this.cachedPoints.size === 2) {
      this.handlePinch(e);
    } else {
      // Google Blockly would call handleMove here which can create an infinite loop.
      // We handle multi-touch move logic here without calling handleMove again
      this.updateFromEvent(e);
      if (this.workspaceDragger) {
        this.workspaceDragger.drag(this.currentDragDeltaXY);
      } else if (this.dragger) {
        this.dragger.onDrag(this.mostRecentEvent, this.currentDragDeltaXY);
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Record the block that a gesture started on, and set the target block
   * appropriately.
   * Additionally, begin tracking shadow argument_report blocks for duplicateOnDrag.
   *
   * @param block The block the gesture started on.
   * @internal
   */
  cdoGesture.setStartBlock = function (block) {
    // If the gesture already went through a bubble, don't set the start block.
    if (!this.startBlock && !this.startBubble) {
      this.startBlock = block;

      // Begin Customization
      // Set up duplication of shadow argument_reporter blocks.
      this.shouldDuplicateOnDrag =
        block.isShadow() && block.type === BLOCK_TYPES.argumentReporter;
      this.blockToDuplicate = block;
      // End Customization

      if (block.isInFlyout && block !== block.getRootBlock()) {
        this.setTargetBlock(block.getRootBlock());
      } else {
        this.setTargetBlock(block);
      }
    }
  };

  /**
   * Custom method: Create a block dragger and start dragging the selected block.
   */
  cdoGesture.startDraggingBlock = function () {
    // Begin Customization
    // Create a new block and set it as the target block for the drag.
    if (this.shouldDuplicateOnDrag) {
      this.duplicateOnDrag();
    }
    // End Customization

    const BlockDraggerClass = Blockly.registry.getClassFromOptions(
      Blockly.registry.Type.BLOCK_DRAGGER,
      this.creatorWorkspace.options,
      true
    );

    this.blockDragger = new BlockDraggerClass(
      this.targetBlock,
      this.startWorkspace_
    );
    this.blockDragger.startDrag(this.currentDragDeltaXY, this.healStack);
    this.blockDragger.drag(this.mostRecentEvent, this.currentDragDeltaXY);
  };

  /**
   * Custom method to duplicate a shadow block when it is dragged.
   * Used for argument_reporter blocks.
   */
  cdoGesture.duplicateOnDrag = function () {
    this.setTargetBlock(this.blockToDuplicate);

    try {
      Blockly.Events.disable();
      const xy = this.blockToDuplicate.getRelativeToSurfaceXY();
      const newBlock = this.blockToDuplicate.workspace.newBlock(
        this.blockToDuplicate.type
      );
      newBlock.initSvg();
      newBlock.render();
      newBlock.moveTo(xy);
      newBlock.setFieldValue(this.blockToDuplicate.getFieldValue('VAR'), 'VAR');
      this.setTargetBlock(newBlock);
    } finally {
      Blockly.Events.enable();
    }
  };
}
