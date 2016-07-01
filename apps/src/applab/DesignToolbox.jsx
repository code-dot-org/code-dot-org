var React = require('react');
var DesignToolboxElement = require('./DesignToolboxElement');
var applabMsg = require('./locale');

var IMAGE_BASE_URL = '/blockly/media/applab/design_toolbox/';

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired
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
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'button.png'}
            desc={'Button'}
            elementType={'BUTTON'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'input.png'}
            desc={'Text Input'}
            elementType={'TEXT_INPUT'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'label.png'}
            desc={'Label'}
            elementType={'LABEL'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'dropdown.png'}
            desc={'Dropdown'}
            elementType={'DROPDOWN'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'radio.png'}
            desc={'Radio Button'}
            elementType={'RADIO_BUTTON'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'checkbox.png'}
            desc={'Checkbox'}
            elementType={'CHECKBOX'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'image.png'}
            desc={'Image'}
            elementType={'IMAGE'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'canvas.png'}
            desc={'Canvas'}
            elementType={'CANVAS'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'screen.png'}
            desc={'Screen'}
            elementType={'SCREEN'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'textarea.png'}
            desc={'Text Area'}
            elementType={'TEXT_AREA'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'chart.png'}
            desc={'Chart'}
            elementType={'CHART'}
            handleDragStart={this.props.handleDragStart} />
        <DesignToolboxElement
            imageUrl={IMAGE_BASE_URL + 'slider.png'}
            desc={'Slider'}
            elementType={'SLIDER'}
            handleDragStart={this.props.handleDragStart} />
      </div>
    );
  }
});
