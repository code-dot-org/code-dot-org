
var PropertyRow = require('./PropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var CanvasProperties = React.createClass({
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
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('width'), 10)}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('height'), 10)}
          handleChange={this.props.handleChange.bind(this, 'height')} />
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
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);
  }
});

var CanvasEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
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
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
        <EventHeaderRow/>
        <EventRow
          name={clickName}
          desc={clickDesc}
          handleInsert={this.insertClick}/>
      </div>
    );
  }
});


module.exports = {
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
