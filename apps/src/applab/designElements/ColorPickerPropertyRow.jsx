/* global $ */
var rowStyle = require('./rowStyle');
var colors = require('../../sharedJsxStyles').colors;

var colorPicker = require('../colpick');

var ColorPickerPropertyRow = React.createClass({
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
    $(this.refs.colorPicker).colpick({
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
      backgroundColor: this.state.value,
      verticalAlign: 'top'
    };

    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}
            style={rowStyle.input} />
          <button
            className={this.state.value === '' ? 'rainbow-gradient' : undefined}
            style={buttonStyle}
            ref='colorPicker'>
          </button>
        </div>
      </div>
    );
  }
});

module.exports = ColorPickerPropertyRow;
