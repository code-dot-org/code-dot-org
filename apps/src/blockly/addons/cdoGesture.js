import {BLOCK_TYPES} from '../constants';

export function gestureOverrides(blocklyWrapper) {
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
   * @override Sets up duplication of shadow argument reporter blocks.
   */
  cdoGesture.setStartBlock = function (block) {
    // If the gesture already went through a bubble, don't set the start block.
    if (!this.startBlock && !this.startBubble) {
      this.startBlock = block;
      Blockly.common.setSelected(this.startBlock);

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
   * Update this gesture to record whether a block is being dragged from the
   * flyout.
   * This function should be called on a pointermove event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a block should be dragged from the flyout this function creates
   * the new block on the main workspace and updates targetBlock_ and
   * startWorkspace_.
   *
   * @returns True if a block is being dragged from the flyout.
   * @override Initiates duplication of shadow argument reporter blocks.
   */
  cdoGesture.updateIsDragging = function (e) {
    // Begin Customization
    // Create a new block and set it as the target block for the drag.
    if (this.shouldDuplicateOnDrag) {
      this.duplicateOnDrag();
    }
    // End Customization

    if (!this.startWorkspace_) {
      throw new Error(
        'Cannot update dragging because the start workspace is undefined'
      );
    }
    if (this.calledUpdateIsDragging) {
      throw Error('updateIsDragging_ should only be called once per gesture.');
    }

    this.calledUpdateIsDragging = true;
    // If we drag a block out of the flyout, it updates `common.getSelected`
    // to return the new block.
    if (this.flyout) this.updateIsDraggingFromFlyout();
    const selected = Blockly.common.getSelected();
    if (selected && Blockly.isDraggable(selected) && selected.isMovable()) {
      this.dragging = true;
      this.dragger = this.createDragger(selected, this.startWorkspace_);
      this.dragger.onDragStart(e);
      this.dragger.onDrag(e, this.currentDragDeltaXY);
    } else {
      this.updateIsDraggingWorkspace();
    }
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
      const newBlock = Blockly.serialization.blocks.append(
        Blockly.serialization.blocks.save(this.blockToDuplicate),
        this.blockToDuplicate.workspace
      );
      newBlock.initSvg();
      newBlock.render();
      newBlock.moveTo(xy);
      // The dragger is created with the currently-selected block, and we want
      // to drag the new block.
      Blockly.common.setSelected(newBlock);
      this.setTargetBlock(newBlock);
    } finally {
      Blockly.Events.enable();
    }
  };
}
