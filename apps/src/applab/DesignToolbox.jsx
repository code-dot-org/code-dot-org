/* global $ */

var React = require('react');
var applabMsg = require('./locale');

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func,
    isToolboxVisible: React.PropTypes.bool.isRequired,
  },

  render: function () {
    var toolboxStyle = {
      display: this.props.isToolboxVisible ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 270,
        boxSizing: 'border-box',
        borderRight: '1px solid gray',
        padding: 10
    };

    return (
      <div id="design-toolbox" style={toolboxStyle}>
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
    );
  },

  componentDidMount: function () {
    this.makeDraggable();
  },
  componentDidUpdate: function () {
    this.makeDraggable();
  },
  makeDraggable: function () {
    $(this.getDOMNode()).find(".new-design-element").draggable({
      containment: "#codeApp",
      helper: "clone",
      appendTo: "#codeApp",
      revert: 'invalid',
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});
