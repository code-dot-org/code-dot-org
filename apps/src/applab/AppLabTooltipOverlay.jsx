/** @file App Lab-specific Tooltip Overlay */

import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import elementUtils from './designElements/elementUtils';
import { scaledDropPoint } from './gridUtils';
import { connect } from 'react-redux';
import { ApplabInterfaceMode } from './constants';
import { ellipsify } from '../utils';

var ELEMENT_ID_TEXT_MAX_CHAR = 12;

const AppLabTooltipOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number,
    // Provided by redux
    isInDesignMode: React.PropTypes.bool.isRequired
  },

  getInitialState: () => ({
    hoveredControlId: null
  }),

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
  },

  onMouseMove(event) {
    this.setState({
      hoveredControlId: this.getHoveredControlId(event.target)
    });
  },

  /**
   * Gets the element id of the Applab UI control user is hovering over, if any.
   * If the user is in design mode, we strip the element id prefix.
   * @param {EventTarget} eventTarget The mouseover event target
   * @returns {string} id of the Applab UI control the mouse is over. Returns null if none exist.
   * @private
   */
  getHoveredControlId(eventTarget) {
    // Check that the element is a child of a screen
    if (eventTarget && $(eventTarget).parents('div.screen').length > 0) {
      var controlElement = eventTarget;

      // Check to see the mouseover target is a resize handle.
      // If so, grab the id of associated control instead of the resize handle itself.
      // We need to do this because for very small controls, the resize handle completely
      // covers the control itself, making it impossible to show the id tooltip
      if (isResizeHandle(controlElement)) {
        controlElement = getAssociatedControl(controlElement);
      }

      // If we're in design mode, get the element id without the prefix
      if (this.props.isInDesignMode) {
        return elementUtils.getId(controlElement);
      }

      return controlElement.id;
    }

    return null;
  },

  /**
   * Internal helper to generate the element id string to display in tooltip.
   * @returns {string}
   * @private
   */
  getElementIdText() {
    return "id: " + ellipsify(this.state.hoveredControlId, ELEMENT_ID_TEXT_MAX_CHAR);
  },

  render() {
    var mouseX = this.props.mouseX;
    var mouseY = this.props.mouseY;
    var tooltipAboveCursor = false;

    // Modify passed props if we're in a 'dragging' mode.
    var draggingElement = $(".ui-draggable-dragging");
    this.isDragging_ = !!draggingElement.length;
    if (this.isDragging_) {
      // If we're dragging an element, use its current drop position
      // (top left of the dragged element)
      var point = scaledDropPoint(draggingElement);
      mouseX = point.left;
      mouseY = point.top;
      tooltipAboveCursor = true;
    }

    var tooltipProviders = [coordinatesProvider()];
    if (this.state.hoveredControlId) {
      tooltipProviders.push(this.getElementIdText);
    }

    return (
      <TooltipOverlay
          width={this.props.width}
          height={this.props.height}
          mouseX={mouseX}
          mouseY={mouseY}
          providers={tooltipProviders}
          tooltipAboveCursor={tooltipAboveCursor}
      />
    );
  }
});
export default connect(state => ({
  isInDesignMode: state.interfaceMode === ApplabInterfaceMode.DESIGN
}))(AppLabTooltipOverlay);

/**
 * Determines whether an element is a resize handle. The criteria we're using here are:
 * 1) The element has a screen element as its ancestor
 * AND
 * 2) It has the 'ui-resizable-handle' class
 * @param {HTMLElement} element
 * @returns {boolean} True if element is a resize handle
 * @static
 */
function isResizeHandle(element) {
  return $(element).parents('div.screen').length > 0 &&
      $(element).hasClass('ui-resizable-handle');
}

/**
 * Given a resize handle element, find the actual ui control it's associated with
 * @param {HTMLElement} resizeHandleElement
 * @returns {HTMLElement} The UI control element associated with the resize
 *          handle, or null if none exists.
 * @static
 */
function getAssociatedControl(resizeHandleElement) {
  var siblingControl = $(resizeHandleElement).siblings().not('.ui-resizable-handle');

  if (siblingControl.length > 0 && siblingControl[0].id) {
    return siblingControl[0];
  }

  return null;
}
