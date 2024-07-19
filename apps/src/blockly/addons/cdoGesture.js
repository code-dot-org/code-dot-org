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
}
