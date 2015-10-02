/* global $ */

var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var ChartProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div id='propertyRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')} />
        <PropertyRow
          desc={'x position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);

    // TODO (bbuchanan):
    // chart-specific properties!
  }
});

var ChartEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getDrawChartFromRecordsCode: function() {
    var id = this.props.element.id;
    var code =
      'drawChartFromRecords("' + id + '", "bar", "tableName", ' +
      '["columnOne", "columnTwo"]);\n';
    return code;
  },

  insertDrawChartFromRecords: function() {
    this.props.onInsertEvent(this.getDrawChartFromRecordsCode());
  },

  render: function () {
    var element = this.props.element;
    var drawChartFromRecordsName = 'drawChartFromRecords';
    var drawChartFromRecordsDesc =
        "Draws the chart using App Lab's table data storage.";

    return (
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
        <EventHeaderRow/>
        <EventRow
          name={drawChartFromRecordsName}
          desc={drawChartFromRecordsDesc}
          handleInsert={this.insertDrawChartFromRecords}/>
      </div>
    );
  }
});


module.exports = {
  PropertyTab: ChartProperties,
  EventTab: ChartEvents,

  create: function () {
    var element = document.createElement('div');
    element.setAttribute('class', 'chart');
    element.style.height = '100px';
    element.style.width = '100px';

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  }
};
