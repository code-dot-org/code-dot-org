/** @file App Lab-specific Crosshair Overlay */

import CrosshairOverlay from '../templates/CrosshairOverlay';
import { scaledDropPoint } from './gridUtils';

const AppLabCrosshairOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number
  },

  render() {
    let mouseX = this.props.mouseX,
        mouseY = this.props.mouseY;

    // Modify passed props if we're in a 'dragging' mode.
    const draggedElement = $(".ui-draggable-dragging");
    const isDragging = !!draggedElement.length;
    if (isDragging) {
      // If we're dragging an element, use its current drop position
      // (top left of the dragged element)
      const point = scaledDropPoint(draggedElement);
      mouseX = point.left;
      mouseY = point.top;
    }

    return (
        <CrosshairOverlay
            width={this.props.width}
            height={this.props.height}
            mouseX={mouseX}
            mouseY={mouseY}
        />
    );
  }
});
export default AppLabCrosshairOverlay;
