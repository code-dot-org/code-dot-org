/* global ColorPicker */
var rowStyle = require('./rowStyle');
var ColorPicker = require('react-color').default;

var ColorPickerPropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue,
      displayColorPicker: false
    };
  },

  componentDidMount: function () {
    window.addEventListener('mousedown', this.handlePageClick);
  },

  componentWillUnmount: function () {
    window.removeEventListener('mousedown', this.handlePageClick);
  },

  handlePageClick: function (e) {
    if (e.target === ReactDOM.findDOMNode(this.refs.button)) {
      return;
    }
    var ref = this.refs.colorPicker;
    if (ref && !ReactDOM.findDOMNode(ref).contains(e.target)) {
      this.setState({displayColorPicker: false});
    }
  },

  handleChangeInternal: function (event) {
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

  toggleColorPicker: function () {
    this.setState({displayColorPicker: !this.state.displayColorPicker});
  },

  render: function () {
    var buttonStyle = {
      backgroundColor: this.state.value,
      verticalAlign: 'top'
    };
    let colorPicker = this.state.displayColorPicker ? (
      <ColorPicker
        ref="colorPicker"
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
            ref="button"
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
