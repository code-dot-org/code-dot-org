/* global $ */
var React = require('react');

var colorPicker = require('../colpick');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentDidMount: function () {
    this.ensureColorPicker();
  },

  componentDidUpdate: function () {
    this.ensureColorPicker();
  },

  /**
   * Make our button a colpick color picker, if it isn't already
   */
  ensureColorPicker: function () {
    var element = React.findDOMNode(this.refs.colorPicker);
    $(element).colpick({
      color: this.state.value,
    	layout: 'rgbhex',
    	submit: 0,
      onChange: this.handleColorChange
    });
  },

  handleChangeInternal: function(event) {
    this.changeColor(event.target.value);
  },

  handleColorChange: function (hsbColor, hexColor) {
    this.changeColor('#' + hexColor);
  },

  changeColor: function (color) {
    this.props.handleChange(color);
    this.setState({value: color});
  },

  render: function() {
    var buttonStyle = {
      backgroundColor: this.state.value
    };
    return (
      <div>
        <div>{this.props.desc}</div>
        <div>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}/>
          <button style={buttonStyle} ref='colorPicker'></button>
        </div>
      </div>
    );
  }
});

module.exports = PropertyRow;
