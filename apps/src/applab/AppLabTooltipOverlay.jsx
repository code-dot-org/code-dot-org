/** @file App Lab-specific Tooltip Overlay */
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import {getId} from './designElements/elementUtils';
import {draggedElementDropPoint} from './gridUtils';
import {connect} from 'react-redux';
import {ApplabInterfaceMode} from './constants';
import {ellipsify} from '../utils';

const ELEMENT_ID_TEXT_MAX_CHAR = 12;

export class AppLabTooltipOverlay extends React.Component {
  static propTypes = {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: PropTypes.number,
    height: PropTypes.number,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
    // Provided by redux
    isInDesignMode: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool
  };

  state = {
    hoveredControlId: null
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove = event => {
    this.setState({
      hoveredControlId: this.getHoveredControlId(event.target)
    });
  };

  /**
   * Gets the element id of the Applab UI control user is hovering over, if any.
   * If the user is in design mode, we strip the element id prefix.
   * @param {HTMLElement} controlElement The mouseover event target
   * @returns {string} id of the Applab UI control the mouse is over. Returns null if none exist.
   * @private
   */
  getHoveredControlId(controlElement) {
    // Check that the element is a child of a 'withCrosshair' div...
    if (
      !controlElement ||
      $(controlElement).parents('div.withCrosshair').length === 0
    ) {
      return null;
    }

    // Check to see the target is a resize handle.
    // If so, grab the id of associated control instead of the resize handle itself.
    // We need to do this because for very small controls, the resize handle completely
    // covers the control itself, making it impossible to show the id tooltip
    if (isResizeHandle(controlElement)) {
      controlElement = getAssociatedControl(controlElement);
    }

    // If we're in design mode, get the element id without the prefix
    if (this.props.isInDesignMode) {
      return getId(controlElement);
    }

    return controlElement.id;
  }

  /**
   * Internal helper to generate the element id string to display in tooltip.
   * @returns {string}
   * @private
   */
  getElementIdText = () =>
    'id: ' + ellipsify(this.state.hoveredControlId, ELEMENT_ID_TEXT_MAX_CHAR);

  render() {
    const dragPoint = draggedElementDropPoint();
    let tooltipProviders = [coordinatesProvider(false, this.props.isRtl)];
    if (this.state.hoveredControlId) {
      tooltipProviders.push(this.getElementIdText);
    }

    return (
      <TooltipOverlay
        width={this.props.width}
        height={this.props.height}
        mouseX={dragPoint ? dragPoint.left : this.props.mouseX}
        mouseY={dragPoint ? dragPoint.top : this.props.mouseY}
        providers={tooltipProviders}
        tooltipAboveCursor={!!dragPoint}
      />
    );
  }
}
export default connect(state => ({
  isRtl: state.isRtl,
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
  return (
    $(element).parents('div.screen').length > 0 &&
    $(element).hasClass('ui-resizable-handle')
  );
}

/**
 * Given a resize handle element, find the actual ui control it's associated with
 * @param {HTMLElement} resizeHandleElement
 * @returns {HTMLElement} The UI control element associated with the resize
 *          handle, or null if none exists.
 * @static
 */
function getAssociatedControl(resizeHandleElement) {
  const siblingControl = $(resizeHandleElement)
    .siblings()
    .not('.ui-resizable-handle');

  if (siblingControl.length > 0 && siblingControl[0].id) {
    return siblingControl[0];
  }

  return null;
}
