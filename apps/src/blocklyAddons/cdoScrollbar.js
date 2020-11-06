import GoogleBlockly from 'blockly/core';

export default class Scrollbar extends GoogleBlockly.Scrollbar {
  /**
   * @override The built-in function subtracts vertical space to make room for the
   * horizontal scrollbar. We hide the horizontal scrollbar so we don't need to subtract
   * that space.
   */
  resizeViewVertical(hostMetrics) {
    this.setScrollViewSize_(Math.max(0, hostMetrics.viewHeight));

    var xCoordinate = hostMetrics.absoluteLeft + 0.5;
    if (!this.workspace_.RTL) {
      xCoordinate +=
        hostMetrics.viewWidth - Blockly.Scrollbar.scrollbarThickness - 1;
    }
    var yCoordinate = hostMetrics.absoluteTop + 0.5;
    this.setPosition(xCoordinate, yCoordinate);

    // If the view has been resized, a content resize will also be necessary.  The
    // reverse is not true.
    this.resizeContentVertical(hostMetrics);
  }

  /**
   * @override Hide scrollbar if not needed
   */
  resizeContentVertical(hostMetrics) {
    this.setVisible(this.scrollViewSize_ < hostMetrics.contentHeight);
    super.resizeContentVertical(hostMetrics);
  }

  /**
   * @override Hide horizontal scroll bar
   */
  resizeContentHorizontal(hostMetrics) {
    this.setVisible(false);
    super.resizeContentHorizontal(hostMetrics);
  }

  /**
   * @override Enable hiding paired scrollbars. Google doesn't enable hiding paired scrollbars
   * because it would cause problems with how they calculate spacing. We want to *always* hide
   * the horizontal scrollbar, so there's no problem.
   */
  setVisible(visible) {
    var visibilityChanged = visible !== this.isVisible();

    this.isVisible_ = visible;
    if (visibilityChanged) {
      this.updateDisplay_();
    }
  }
}
