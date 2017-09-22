import $ from 'jquery';
import React, {PropTypes} from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import EnumPropertyRow from './EnumPropertyRow';
import * as applabConstants from '../constants';
import * as elementUtils from './elementUtils';
import * as gridUtils from '../gridUtils';

class LabelProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={'text'}
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')}
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          lockState={$(element).data('lock-width') || PropertyRow.LockState.UNLOCKED}
          handleLockChange={this.props.handleChange.bind(this, 'lock-width')}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          lockState={$(element).data('lock-height') || PropertyRow.LockState.UNLOCKED}
          handleLockChange={this.props.handleChange.bind(this, 'lock-height')}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={'x position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={'y position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <ColorPickerPropertyRow
          desc={'text color'}
          initialValue={elementUtils.rgb2hex(element.style.color)}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <PropertyRow
          desc={'font size (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')}
        />
        <EnumPropertyRow
          desc={'text alignment'}
          initialValue={element.style.textAlign || 'left'}
          options={['left','right','center','justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
        />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>);

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
}

class LabelEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getClickEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  }

  insertClick = () => {
    this.props.onInsertEvent(this.getClickEventCode());
  };

  render() {
    const element = this.props.element;
    const clickName = 'Click';
    const clickDesc = 'Triggered when the label is clicked with a mouse or tapped on a screen.';

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow/>
        <EventRow
          name={clickName}
          desc={clickDesc}
          handleInsert={this.insertClick}
        />
      </div>
    );
  }
}

/**
 * This represents the amount of error allowed before we consider a label's size to "fit exactly".
 * This allows for rounding errors for adjusting center aligned labels, as well as allowing users
 * to have a chance of returning to an exact fit.
 */
const STILL_FITS = 5;

export default {
  PropertyTab: LabelProperties,
  EventTab: LabelEvents,

  create: function () {
    const element = document.createElement('label');
    element.style.margin = '0px';
    element.style.padding = '2px';
    element.style.lineHeight = '1';
    element.style.fontSize = '14px';
    element.style.overflow = 'hidden';
    element.style.wordWrap = 'break-word';
    element.textContent = 'text';
    element.style.color = '#333333';
    element.style.backgroundColor = '';
    element.style.maxWidth = applabConstants.APP_WIDTH + 'px';

    this.resizeToFitText(element);
    return element;
  },

  getCurrentSize: function (element) {
    return {
      width: parseInt(element.style.width, 10),
      height: parseInt(element.style.height, 10)
    };
  },

  /**
   * @returns {{width: number, height: number}} Size that this element should be if it were fitted exactly. If there is
   * no text, then the best size is 15 x 15 so that the user has something to drag around.
   */
  getBestSize: function (element) {
    // Start by assuming best fit is current size
    const size = this.getCurrentSize(element);

    const widthLocked = $(element).data('lock-width') === PropertyRow.LockState.LOCKED;
    const heightLocked = $(element).data('lock-height') === PropertyRow.LockState.LOCKED;

    // Change the size to fit the text.
    if (element.textContent) {
      // Max width depends on alignment.
      let maxWidth;
      if (element.style.textAlign === 'center') {
        maxWidth = applabConstants.APP_WIDTH;
      } else {
        // Note that left may not be defined yet, if this is just now being created.
        const left = parseInt(element.style.left || '0', 10);
        if (element.style.textAlign === 'right') {
          maxWidth = left + size.width;
        } else {
          maxWidth = applabConstants.APP_WIDTH - left;
        }
      }
      const clone = $(element).clone().css({
        position: 'absolute',
        visibility: 'hidden',
        width: 'auto',
        height: 'auto',
        maxWidth: maxWidth + 'px',
      }).appendTo($(document.body));

      const padding = parseInt(element.style.padding, 10);

      if (!widthLocked) {
        // Truncate the width before it runs off the edge of the screen
        size.width = Math.min(clone.width() + 1 + 2 * padding, maxWidth);
      }
      if (!heightLocked) {
        size.height = clone.height() + 1 + 2 * padding;
      }

      clone.remove();
    } else if (!widthLocked && !heightLocked) {
      // If either width or height are locked, then retain previous size.
      size.width = size.height = 15;
    }
    return size;
  },

  resizeToFitText: function (element) {
    const size = this.getBestSize(element);

    // For center or right alignment, we should adjust the left side to effectively retain that alignment.
    if (element.style.textAlign === 'center' || element.style.textAlign === 'right') {
      let left = parseInt(element.style.left, 10);
      const width = parseInt(element.style.width, 10);
      // Positive delta means that it is getting wider
      const delta = size.width - width;
      if (element.style.textAlign === 'right') {
        left -= delta;
      } else {
        // must be centered
        left -= delta / 2;
      }
      // Don't move text past the left side.
      element.style.left = Math.max(0, left) + 'px';
      if (gridUtils.isDraggableContainer(element.parentNode)) {
        element.parentNode.style.left = element.style.left;
      }
    }
    element.style.width = size.width + 'px';
    element.style.height = size.height + 'px';
  },

  /**
   * Returns whether this element perfectly fits its bounding size, if that is needed in onPropertyChange.
   */
  beforePropertyChange: function (element, name) {
    if (name !== 'text' && name !== 'fontSize') {
      return null;
    }
    const currentSize = this.getCurrentSize(element);
    const bestSize = this.getBestSize(element);
    return Math.abs(currentSize.width - bestSize.width) < STILL_FITS &&
        Math.abs(currentSize.height - bestSize.height) < STILL_FITS;
  },

  /**
   * @returns {boolean} True if it modified the backing element
   */
  onPropertyChange: function (element, name, value, previouslyFitExactly) {
    switch (name) {
      case 'text':
      case 'fontSize':
        if (previouslyFitExactly) {
          this.resizeToFitText(element);
        }
        break;
      case 'lock-width':
        $(element).data('lock-width', value);
        break;
      case 'lock-height':
        $(element).data('lock-height', value);
        break;
      default:
        return false;
    }
    return true;
  }
};
