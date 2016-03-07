/* global ColorPicker */
var rowStyle = require('./rowStyle');
var colors = require('../../sharedJsxStyles').colors;

var ColorPickerPropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue,
      displayColorPicker: false,
    };
  },

  handleChangeInternal: function(event) {
    this.changeColor(event.target.value);
  },

  handleColorChange: function (color) {
    if (color.rgb.a == 1) {
      // no transparency set
      this.changeColor('#' + color.hex);
    } else {
      this.changeColor(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
    }
  },

  changeColor: function (color) {
    this.props.handleChange(color);
    this.setState({value: color});
  },

  toggleColorPicker: function() {
    this.setState({displayColorPicker: !this.state.displayColorPicker});
  },

  render: function() {
    var buttonStyle = {
      backgroundColor: this.state.value,
      verticalAlign: 'top'
    };
    let colorPicker = this.state.displayColorPicker ? (
      <ColorPicker type="sketch"
                   color={this.state.value}
                   onChangeComplete={this.handleColorChange}/>
    ) : null;
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
            onClick={this.toggleColorPicker}>
          </button>
          {colorPicker}
        </div>
      </div>
    );
  }
});

module.exports = ColorPickerPropertyRow;
