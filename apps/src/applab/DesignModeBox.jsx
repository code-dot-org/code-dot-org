/* global $ */

var React = require('react');
var applabMsg = require('./locale');
var DesignProperties = require('./designProperties.jsx');

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
  },

  render: function() {
    var styles = {
      container: {
        position: 'absolute',
        width: '100%',
        top: 30,
        bottom: 0,
        backgroundColor: 'white',
        boxSizing: 'border-box',
        borderLeft: '1px solid gray',
        borderRight: '1px solid gray',
        borderBottom: '1px solid gray'
      },
      designToolbox: {
        display: this.props.isToolboxVisible ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 270,
        boxSizing: 'border-box',
        borderRight: '1px solid gray',
        padding: 10
      },
      designProperties: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: this.props.isToolboxVisible ? 270 : 0,
        right: 0,
        boxSizing: 'border-box',
        padding: 10
      }
    };

    return (
      <div id="design-mode-container" style={styles.container}>
        <div id="design-toolbox" style={styles.designToolbox}>
          <p>{applabMsg.designToolboxDescription()}</p>
          <div data-element-type="BUTTON" className="new-design-element">button</div>
          <div data-element-type="LABEL" className="new-design-element">label</div>
          <div data-element-type="TEXT_INPUT" className="new-design-element">input</div>
          <div data-element-type="TEXT_AREA" className="new-design-element">text area</div>
          <div data-element-type="CHECKBOX" className="new-design-element">checkbox</div>
          <div data-element-type="RADIO_BUTTON" className="new-design-element">radio button</div>
          <div data-element-type="DROPDOWN" className="new-design-element">dropdown</div>
          <div data-element-type="IMAGE" className="new-design-element">image</div>
          <div data-element-type="CANVAS" className="new-design-element">canvas</div>
          <div data-element-type="SCREEN" className="new-design-element">screen</div>
        </div>
        <div id="design-properties" style={styles.designProperties}>
          <DesignProperties
            element={this.props.element}
            handleChange={this.props.handleChange}
            onDepthChange={this.props.onDepthChange}
            onDelete={this.props.onDelete} />
        </div>
      </div>
    );
  },
  componentDidMount: function () {
    this.makeDraggable();
  },
  componentDidUpdate: function () {
    this.makeDraggable();
  },
  makeDraggable: function() {
    $(this.getDOMNode()).find(".new-design-element").draggable({
      containment:"#codeApp",
      helper:"clone",
      appendTo:"#codeApp",
      revert: 'invalid',
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});
