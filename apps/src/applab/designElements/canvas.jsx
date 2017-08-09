import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import PropertyRow from './PropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import * as elementUtils from './elementUtils';

var CanvasProperties = createReactClass({
  propTypes: {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('width'), 10)}
          handleChange={this.props.handleChange.bind(this, 'width')}
        />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('height'), 10)}
          handleChange={this.props.handleChange.bind(this, 'height')}
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
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>);
  }
});

var CanvasEvents = createReactClass({
  propTypes: {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  },

  getClickEventCode: function () {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked at x:" + event.offsetX + " y:" + event.offsetY);\n' +
      '  setActiveCanvas("' + id + '");\n' +
      '  circle(event.offsetX, event.offsetY, 10);\n' +
      '});\n';
    return code;
  },

  insertClick: function () {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the canvas is clicked with a mouse or tapped on a screen.';

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
});


export default {
  PropertyTab: CanvasProperties,
  EventTab: CanvasEvents,
  create: function () {
    var element = document.createElement('canvas');
    element.setAttribute('width', '100px');
    element.setAttribute('height', '100px');

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  }
};
