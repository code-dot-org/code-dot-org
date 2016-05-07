/** @file App Lab-specific Crosshair Overlay */

import CrosshairOverlay from '../templates/CrosshairOverlay';
import { scaledDropPoint } from './gridUtils';

const AppLabTooltipOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number
  },

  render() {
    var mouseX = this.props.mouseX;
    var mouseY = this.props.mouseY;

    // Modify passed props if we're in a 'dragging' mode.
    var draggingElement = $(".ui-draggable-dragging");
    this.isDragging_ = !!draggingElement.length;
    if (this.isDragging_) {
      // If we're dragging an element, use its current drop position
      // (top left of the dragged element)
      var point = scaledDropPoint(draggingElement);
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
export default AppLabTooltipOverlay;
